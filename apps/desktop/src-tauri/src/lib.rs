use tauri::{Manager, Emitter};
use std::sync::Mutex;
use std::process::{Command, Child, Stdio};
use std::collections::HashMap;

const OTTIE_PROFILE: &str = "ottie";
const OTTIE_GATEWAY_PORT: &str = "18790";

/// macOS .app 不继承 shell PATH，需要手动构建完整 PATH
fn full_path() -> String {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
    let existing = std::env::var("PATH").unwrap_or_default();
    format!("{home}/.local/bin:/opt/homebrew/bin:/usr/local/bin:{home}/.nvm/versions/node/v22.16.0/bin:{home}/.nvm/versions/node/v20.19.2/bin:{home}/.nvm/versions/node/v18.20.8/bin:/usr/bin:/bin:{existing}")
}

/// 创建一个设置了正确 PATH 的 openclaw Command
fn openclaw_cmd() -> Command {
    let mut cmd = Command::new("openclaw");
    cmd.env("PATH", full_path());
    cmd
}

struct SidecarState {
    openclaw: Option<Child>,
    screenpipe: Option<Child>,
    agents: HashMap<String, Child>,
    agent_entries: HashMap<String, AgentEntry>,
}

#[derive(Clone, serde::Serialize)]
struct AgentEntry {
    id: String,
    provider: String,
    status: String,
    cwd: String,
    created_at: u64,
    output: String,
}

#[derive(serde::Serialize)]
struct ProviderInfo {
    id: String,
    available: bool,
    version: String,
}

impl Drop for SidecarState {
    fn drop(&mut self) {
        if let Some(ref mut child) = self.openclaw {
            let _ = child.kill();
        }
        if let Some(ref mut child) = self.screenpipe {
            let _ = child.kill();
        }
        for (_, child) in self.agents.iter_mut() {
            let _ = child.kill();
        }
    }
}

// ============================================================
// Dependency detection
// ============================================================

#[derive(serde::Serialize)]
struct DepsStatus {
    node_installed: bool,
    node_version: String,
    openclaw_installed: bool,
    openclaw_version: String,
    gateway_running: bool,
    api_key_configured: bool,
}

#[tauri::command]
fn check_deps() -> DepsStatus {
    let (node_installed, node_version) = check_bin_version("node", &["--version"]);
    let (oc_installed, oc_version) = check_bin_version("openclaw", &["--version"]);
    let gateway_running = check_gateway_health();

    // Check if API key is configured in ottie profile
    let api_key_configured = openclaw_cmd()
        .args(["--profile", OTTIE_PROFILE, "config", "get", "agents.defaults.model.primary"])
        .output()
        .map(|o| o.status.success() && !String::from_utf8_lossy(&o.stdout).trim().is_empty())
        .unwrap_or(false);

    DepsStatus {
        node_installed,
        node_version,
        openclaw_installed: oc_installed,
        openclaw_version: oc_version,
        gateway_running,
        api_key_configured,
    }
}

fn check_bin_version(bin: &str, args: &[&str]) -> (bool, String) {
    match Command::new(bin).args(args).output() {
        Ok(output) if output.status.success() => {
            let ver = String::from_utf8_lossy(&output.stdout).trim().to_string();
            (true, ver)
        }
        _ => (false, String::new()),
    }
}

// ============================================================
// Install openclaw
// ============================================================

#[tauri::command]
fn install_openclaw() -> Result<String, String> {
    let mut npm_cmd = Command::new("npm");
    npm_cmd.env("PATH", full_path());
    let output = npm_cmd
        .args(["install", "-g", "openclaw"])
        .output()
        .map_err(|e| format!("npm not found: {}", e))?;

    if output.status.success() {
        // Run initial setup for ottie profile
        let _ = openclaw_cmd()
            .args(["--profile", OTTIE_PROFILE, "setup", "--non-interactive", "--mode", "local"])
            .output();
        Ok("OpenClaw installed successfully".into())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Install failed: {}", stderr))
    }
}

// ============================================================
// API key + model configuration (writes to ~/.openclaw-ottie/)
// ============================================================

#[tauri::command]
fn configure_model(provider: String, api_key: String, model: String, base_url: String) -> Result<String, String> {
    // 1. Set gateway mode (required for first run)
    let _ = run_openclaw_config_set("gateway.mode", "local");
    let _ = run_openclaw_config_set("gateway.bind", "loopback");

    // 2. Set provider config (batch mode for atomicity)
    let api_format = if provider == "anthropic" { "anthropic-messages" } else { "openai-responses" };
    let batch = format!(
        r#"[{{"path":"models.providers.{provider}.baseUrl","value":"{base_url}"}},{{"path":"models.providers.{provider}.api","value":"{api_format}"}},{{"path":"models.providers.{provider}.authHeader","value":true}},{{"path":"models.providers.{provider}.models","value":[{{"id":"{model}","name":"{model}","contextWindow":200000,"maxTokens":8192}}]}}]"#,
        provider = provider, base_url = base_url, api_format = api_format, model = model,
    );
    let output = openclaw_cmd()
        .args(["--profile", OTTIE_PROFILE, "config", "set", "--batch-json", &batch])
        .output()
        .map_err(|e| format!("batch config set failed: {}", e))?;
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Provider config failed: {}", stderr));
    }

    // 3. Write API key directly to agent auth-profiles.json (correct format)
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
    let agent_dir = format!("{}/.openclaw-{}/agents/main/agent", home, OTTIE_PROFILE);
    std::fs::create_dir_all(&agent_dir)
        .map_err(|e| format!("Failed to create agent dir: {}", e))?;

    let auth_json = format!(
        r#"{{"version":1,"profiles":{{"{provider}:manual":{{"type":"api_key","provider":"{provider}","key":"{key}"}}}}}}"#,
        provider = provider, key = api_key,
    );
    std::fs::write(format!("{}/auth-profiles.json", agent_dir), &auth_json)
        .map_err(|e| format!("Failed to write auth: {}", e))?;

    // 4. Set primary model
    let model_id = format!("{}/{}", provider, model);
    run_openclaw_config_set("agents.defaults.model.primary", &model_id)?;

    Ok(format!("Configured {} with model {}", provider, model_id))
}

fn run_openclaw_config_set(path: &str, value: &str) -> Result<(), String> {
    let output = openclaw_cmd()
        .args(["--profile", OTTIE_PROFILE, "config", "set", path, value])
        .output()
        .map_err(|e| format!("openclaw config set failed: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Config set {} failed: {}", path, stderr));
    }
    Ok(())
}

// ============================================================
// Gateway management
// ============================================================

#[tauri::command]
fn gateway_status() -> String {
    let gw = check_gateway_health();
    format!("{{\"gateway\":{}}}", gw)
}

#[tauri::command]
fn start_gateway(state: tauri::State<'_, Mutex<SidecarState>>) -> Result<bool, String> {
    if check_gateway_health() {
        return Ok(true); // Already running
    }

    let child = spawn_openclaw();
    let started = child.is_some();

    let managed = state.inner();
    let mut s = managed.lock().unwrap();
    s.openclaw = child;

    if started {
        // Wait a bit for gateway to come up
        drop(s);
        for _ in 0..15 {
            std::thread::sleep(std::time::Duration::from_secs(1));
            if check_gateway_health() {
                return Ok(true);
            }
        }
    }

    Ok(check_gateway_health())
}

#[tauri::command]
fn restart_gateway(state: tauri::State<'_, Mutex<SidecarState>>) -> Result<bool, String> {
    // Kill existing
    {
        let managed = state.inner();
        let mut s = managed.lock().unwrap();
        if let Some(ref mut child) = s.openclaw {
            let _ = child.kill();
        }
        s.openclaw = None;
    }
    std::thread::sleep(std::time::Duration::from_secs(1));

    // Start new
    start_gateway(state)
}

#[tauri::command]
fn openclaw_agent(agent_id: String, message: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    // 找到 session JSONL 文件，记录执行前的大小
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
    let sessions_dir = format!("{}/.openclaw-{}/agents/{}/sessions", home, OTTIE_PROFILE, agent_id);
    let jsonl_path = std::fs::read_dir(&sessions_dir).ok()
        .and_then(|entries| {
            entries.filter_map(|e| e.ok())
                .find(|e| e.path().extension().map(|ext| ext == "jsonl").unwrap_or(false))
                .map(|e| e.path())
        });

    let initial_size = jsonl_path.as_ref()
        .and_then(|p| std::fs::metadata(p).ok())
        .map(|m| m.len())
        .unwrap_or(0);

    // 启动后台线程监听 JSONL 变化推送状态
    let handle = app_handle.clone();
    let jsonl_watch = jsonl_path.clone();
    let stop_flag = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
    let stop_clone = stop_flag.clone();

    std::thread::spawn(move || {
        let Some(path) = jsonl_watch else { return };
        let mut last_size = initial_size;
        while !stop_clone.load(std::sync::atomic::Ordering::Relaxed) {
            std::thread::sleep(std::time::Duration::from_millis(500));
            let Ok(meta) = std::fs::metadata(&path) else { continue };
            let new_size = meta.len();
            if new_size > last_size {
                // 读取新增内容
                if let Ok(file) = std::fs::File::open(&path) {
                    use std::io::{Seek, BufRead, BufReader};
                    let mut reader = BufReader::new(file);
                    let _ = reader.seek(std::io::SeekFrom::Start(last_size));
                    for line in reader.lines() {
                        let Ok(line) = line else { continue };
                        if line.is_empty() { continue }
                        // 解析事件，提取 tool_use 名称
                        if let Ok(event) = serde_json::from_str::<serde_json::Value>(&line) {
                            let msg = &event["message"];
                            let role = msg["role"].as_str().unwrap_or("");
                            if role == "assistant" {
                                if let Some(content) = msg["content"].as_array() {
                                    for c in content {
                                        if c["type"].as_str() == Some("tool_use") {
                                            let tool_name = c["name"].as_str().unwrap_or("unknown");
                                            let status = match tool_name {
                                                "browser" => "🌐 正在操作浏览器...",
                                                "web_search" => "🔍 正在搜索...",
                                                "web_fetch" => "📄 正在获取网页...",
                                                "read" => "📖 正在读取文件...",
                                                "write" => "✏️ 正在写入文件...",
                                                "edit" => "✏️ 正在编辑文件...",
                                                "exec" => "⚙️ 正在执行命令...",
                                                "process" => "⚙️ 正在运行进程...",
                                                "memory_search" => "🧠 正在搜索记忆...",
                                                "tts" => "🔊 正在生成语音...",
                                                _ => "🔧 正在使用工具...",
                                            };
                                            let _ = handle.emit("openclaw-status", status);
                                        } else if c["type"].as_str() == Some("text") {
                                            if let Some(text) = c["text"].as_str() {
                                                if text.len() > 5 {
                                                    let preview = if text.len() > 50 { &text[..50] } else { text };
                                                    let status = format!("💭 {preview}...");
                                                    let _ = handle.emit("openclaw-status", &status);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                last_size = new_size;
            }
        }
    });

    // 执行 openclaw agent（同步阻塞）
    let _ = app_handle.emit("openclaw-status", "⏳ 正在连接 Agent...");

    let output = openclaw_cmd()
        .args(["--profile", OTTIE_PROFILE, "agent", "--agent", &agent_id, "--message", &message, "--json"])
        .output()
        .map_err(|e| format!("Failed to run openclaw: {}", e))?;

    // 停止监听线程
    stop_flag.store(true, std::sync::atomic::Ordering::Relaxed);

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();

    if let Some(json_start) = stdout.find('{') {
        let json_str = &stdout[json_start..];
        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(json_str) {
            if let Some(text) = parsed["result"]["payloads"][0]["text"].as_str() {
                return Ok(text.to_string());
            }
        }
    }

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("OpenClaw error: {}", stderr));
    }

    Ok(stdout)
}

// ============================================================
// Process spawning (isolated with --profile ottie)
// ============================================================

fn spawn_openclaw() -> Option<Child> {
    let result = openclaw_cmd()
        .args(["--profile", OTTIE_PROFILE, "gateway", "run", "--port", OTTIE_GATEWAY_PORT, "--auth", "none", "--bind", "loopback"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn();

    match result {
        Ok(child) => Some(child),
        Err(_) => None,
    }
}

fn spawn_screenpipe() -> Option<Child> {
    let mut npx_cmd = Command::new("npx");
    npx_cmd.env("PATH", full_path());
    let result = npx_cmd
        .args(["screenpipe@latest", "record"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn();

    match result {
        Ok(child) => Some(child),
        Err(_) => None,
    }
}

fn check_gateway_health() -> bool {
    std::net::TcpStream::connect_timeout(
        &format!("127.0.0.1:{}", OTTIE_GATEWAY_PORT).parse().unwrap(),
        std::time::Duration::from_millis(300),
    ).is_ok()
}

// ============================================================
// Agent Manager — 原生 agent 进程管理
// ============================================================

#[tauri::command]
fn detect_providers() -> Vec<ProviderInfo> {
    let mut providers = Vec::new();

    // Claude Code CLI
    let (claude_ok, claude_ver) = {
        let mut cmd = Command::new("claude");
        cmd.env("PATH", full_path());
        match cmd.args(["--version"]).output() {
            Ok(o) if o.status.success() => (true, String::from_utf8_lossy(&o.stdout).trim().to_string()),
            _ => (false, String::new()),
        }
    };
    providers.push(ProviderInfo { id: "claude".into(), available: claude_ok, version: claude_ver });

    // Codex CLI
    let (codex_ok, codex_ver) = {
        let mut cmd = Command::new("codex");
        cmd.env("PATH", full_path());
        match cmd.args(["--version"]).output() {
            Ok(o) if o.status.success() => (true, String::from_utf8_lossy(&o.stdout).trim().to_string()),
            _ => (false, String::new()),
        }
    };
    providers.push(ProviderInfo { id: "codex".into(), available: codex_ok, version: codex_ver });

    providers
}

#[tauri::command]
fn create_agent(
    provider: String,
    cwd: String,
    prompt: String,
    state: tauri::State<'_, Mutex<SidecarState>>,
    app_handle: tauri::AppHandle,
) -> Result<String, String> {
    let agent_id = uuid::Uuid::new_v4().to_string();
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    // 构建命令
    let (bin, args): (&str, Vec<String>) = match provider.as_str() {
        "claude" => ("claude", vec![
            "-p".into(),
            "--output-format".into(), "stream-json".into(),
            "--dangerously-skip-permissions".into(),
            "--no-session-persistence".into(),
            prompt.clone(),
        ]),
        "codex" => ("codex", vec![
            "exec".into(),
            "--json".into(),
            "--full-access".into(),
            prompt.clone(),
        ]),
        _ => return Err(format!("不支持的 provider: {}", provider)),
    };

    // spawn 进程
    let mut cmd = Command::new(bin);
    cmd.env("PATH", full_path());
    cmd.current_dir(&cwd);
    cmd.args(&args);
    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let mut child = cmd.spawn().map_err(|e| {
        format!("无法启动 {} — 请确认已安装: {}", bin, e)
    })?;

    // 取出 stdout 给后台线程
    let stdout = child.stdout.take();

    // 存入 state
    let entry = AgentEntry {
        id: agent_id.clone(),
        provider: provider.clone(),
        status: "running".into(),
        cwd: cwd.clone(),
        created_at: now,
        output: String::new(),
    };

    {
        let mut s = state.lock().unwrap();
        s.agents.insert(agent_id.clone(), child);
        s.agent_entries.insert(agent_id.clone(), entry.clone());
    }

    // emit 创建事件
    let _ = app_handle.emit("agent-update", &serde_json::json!({
        "agentId": &agent_id,
        "status": "running",
        "provider": &provider,
    }));

    // 后台线程：读 stdout，解析 JSON，emit 事件
    let handle = app_handle.clone();
    let handle2 = app_handle.clone();
    let aid = agent_id.clone();
    let prov = provider.clone();

    std::thread::spawn(move || {
        let mut accumulated = String::new();

        if let Some(stdout) = stdout {
            use std::io::BufRead;
            let reader = std::io::BufReader::new(stdout);
            for line in reader.lines() {
                let Ok(line): Result<String, _> = line else { break };
                if line.is_empty() { continue }

                // 尝试解析 JSON
                if let Ok(event) = serde_json::from_str::<serde_json::Value>(&line) {
                    let event_type = event["type"].as_str().unwrap_or("");

                    // Claude: assistant message text
                    if event_type == "assistant" {
                        if let Some(content) = event["message"]["content"].as_array() {
                            for c in content {
                                if c["type"].as_str() == Some("text") {
                                    if let Some(text) = c["text"].as_str() {
                                        accumulated.push_str(text);
                                    }
                                }
                            }
                        }
                    }

                    // Claude: final result
                    if event_type == "result" {
                        if let Some(result) = event["result"].as_str() {
                            accumulated = result.to_string();
                        }
                    }

                    // Codex: message
                    if event_type == "message" {
                        if let Some(content) = event["content"].as_str() {
                            accumulated.push_str(content);
                        }
                    }

                    // Codex: completed
                    if event_type == "completed" {
                        if let Some(result) = event["result"].as_str() {
                            accumulated = result.to_string();
                        }
                    }

                    // emit 流式事件
                    let _ = handle.emit("agent-stream", &serde_json::json!({
                        "agentId": &aid,
                        "event": &event,
                    }));
                }
            }
        }

        // 进程结束 — 等待退出码
        let state_ref = handle2.state::<Mutex<SidecarState>>();
        let exit_status = {
            let mut s = state_ref.lock().unwrap();
            if let Some(mut child) = s.agents.remove(&aid) {
                child.wait().ok().map(|s| s.success()).unwrap_or(false)
            } else {
                false
            }
        };

        let final_status = if exit_status { "idle" } else { "error" };

        // 更新 entry
        {
            let mut s = state_ref.lock().unwrap();
            if let Some(entry) = s.agent_entries.get_mut(&aid) {
                entry.status = final_status.to_string();
                entry.output = accumulated.clone();
            }
        }

        // emit 完成事件
        let _ = handle.emit("agent-update", &serde_json::json!({
            "agentId": &aid,
            "status": final_status,
            "provider": &prov,
            "output": &accumulated,
        }));
    });

    Ok(agent_id)
}

#[tauri::command]
fn list_agents(state: tauri::State<'_, Mutex<SidecarState>>) -> Vec<AgentEntry> {
    let s = state.lock().unwrap();
    s.agent_entries.values().cloned().collect()
}

#[tauri::command]
fn cancel_agent(
    agent_id: String,
    state: tauri::State<'_, Mutex<SidecarState>>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut s = state.lock().unwrap();
    if let Some(mut child) = s.agents.remove(&agent_id) {
        let _ = child.kill();
    }
    if let Some(entry) = s.agent_entries.get_mut(&agent_id) {
        entry.status = "cancelled".into();
    }
    let _ = app_handle.emit("agent-update", &serde_json::json!({
        "agentId": &agent_id,
        "status": "cancelled",
    }));
    Ok(())
}

#[tauri::command]
fn get_agent_output(
    agent_id: String,
    state: tauri::State<'_, Mutex<SidecarState>>,
) -> Result<String, String> {
    let s = state.lock().unwrap();
    s.agent_entries.get(&agent_id)
        .map(|e| e.output.clone())
        .ok_or_else(|| format!("Agent {} not found", agent_id))
}

// ============================================================
// File System — FileTree / FileViewer 需要
// ============================================================

#[derive(serde::Serialize)]
struct FileEntry {
    name: String,
    path: String,
    is_dir: bool,
}

#[tauri::command]
fn read_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = std::fs::read_dir(&path).map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for entry in entries {
        let Ok(entry) = entry else { continue };
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') { continue } // 隐藏文件跳过
        let path = entry.path().to_string_lossy().to_string();
        let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
        result.push(FileEntry { name, path, is_dir });
    }
    Ok(result)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| format!("读取失败: {}", e))
}

// ============================================================
// Git — GitPanel 需要
// ============================================================

#[derive(serde::Serialize)]
struct GitStatusResult {
    branch: String,
    changed: Vec<GitChangedFile>,
    ahead: u32,
    behind: u32,
}

#[derive(serde::Serialize)]
struct GitChangedFile {
    path: String,
    status: String,
}

#[tauri::command]
fn git_status(cwd: String) -> Result<GitStatusResult, String> {
    let branch = Command::new("git")
        .args(["branch", "--show-current"])
        .current_dir(&cwd).env("PATH", full_path())
        .output().map_err(|e| e.to_string())?;
    let branch_name = String::from_utf8_lossy(&branch.stdout).trim().to_string();

    let status = Command::new("git")
        .args(["status", "--porcelain"])
        .current_dir(&cwd).env("PATH", full_path())
        .output().map_err(|e| e.to_string())?;
    let changed: Vec<GitChangedFile> = String::from_utf8_lossy(&status.stdout)
        .lines()
        .filter(|l| l.len() > 3)
        .map(|l| GitChangedFile {
            status: l[..2].trim().to_string(),
            path: l[3..].to_string(),
        })
        .collect();

    Ok(GitStatusResult { branch: branch_name, changed, ahead: 0, behind: 0 })
}

#[tauri::command]
fn git_branches(cwd: String) -> Result<Vec<String>, String> {
    let output = Command::new("git")
        .args(["branch", "--list", "--format=%(refname:short)"])
        .current_dir(&cwd).env("PATH", full_path())
        .output().map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout)
        .lines().map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect())
}

#[tauri::command]
fn git_diff(cwd: String, file: Option<String>) -> Result<String, String> {
    let mut args = vec!["diff".to_string()];
    if let Some(f) = file { args.push(f); }
    let output = Command::new("git")
        .args(&args)
        .current_dir(&cwd).env("PATH", full_path())
        .output().map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
fn git_commit(cwd: String, message: String) -> Result<(), String> {
    Command::new("git").args(["add", "-A"])
        .current_dir(&cwd).env("PATH", full_path())
        .output().map_err(|e| e.to_string())?;
    let output = Command::new("git").args(["commit", "-m", &message])
        .current_dir(&cwd).env("PATH", full_path())
        .output().map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

#[tauri::command]
fn git_switch_branch(cwd: String, branch: String) -> Result<(), String> {
    let output = Command::new("git").args(["checkout", &branch])
        .current_dir(&cwd).env("PATH", full_path())
        .output().map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

// ============================================================
// Terminal — 简化版（无 PTY，用 Command 模拟）
// ============================================================

#[tauri::command]
fn spawn_terminal(cwd: String) -> Result<String, String> {
    // 简化实现：返回一个 terminal ID，实际 PTY 需要 portable-pty crate
    let id = uuid::Uuid::new_v4().to_string();
    // TODO: 用 portable-pty 实现完整终端
    Ok(id)
}

#[tauri::command]
fn write_terminal(_terminal_id: String, _data: String) -> Result<(), String> {
    // TODO: 写入 PTY stdin
    Ok(())
}

#[tauri::command]
fn kill_terminal(_terminal_id: String) -> Result<(), String> {
    // TODO: kill PTY 进程
    Ok(())
}

// ============================================================
// Schedule — 定时任务
// ============================================================

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct ScheduleEntry {
    id: String,
    cron: String,
    provider: String,
    prompt: String,
    cwd: String,
    enabled: bool,
    last_run: Option<String>,
}

fn schedules_path() -> String {
    let home = std::env::var("HOME").unwrap_or_else(|_| "/tmp".into());
    let dir = format!("{}/.ottie", home);
    let _ = std::fs::create_dir_all(&dir);
    format!("{}/schedules.json", dir)
}

fn load_schedules() -> Vec<ScheduleEntry> {
    std::fs::read_to_string(schedules_path())
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn save_schedules(schedules: &[ScheduleEntry]) {
    let _ = std::fs::write(schedules_path(), serde_json::to_string_pretty(schedules).unwrap_or_default());
}

#[tauri::command]
fn create_schedule(cron: String, provider: String, prompt: String, cwd: String) -> Result<(), String> {
    let mut schedules = load_schedules();
    schedules.push(ScheduleEntry {
        id: uuid::Uuid::new_v4().to_string(),
        cron, provider, prompt, cwd,
        enabled: true, last_run: None,
    });
    save_schedules(&schedules);
    Ok(())
}

#[tauri::command]
fn list_schedules() -> Vec<ScheduleEntry> {
    load_schedules()
}

#[tauri::command]
fn delete_schedule(id: String) -> Result<(), String> {
    let mut schedules = load_schedules();
    schedules.retain(|s| s.id != id);
    save_schedules(&schedules);
    Ok(())
}

#[tauri::command]
fn toggle_schedule(id: String, enabled: bool) -> Result<(), String> {
    let mut schedules = load_schedules();
    if let Some(s) = schedules.iter_mut().find(|s| s.id == id) {
        s.enabled = enabled;
    }
    save_schedules(&schedules);
    Ok(())
}

// ============================================================
// App entry point
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .manage(Mutex::new(SidecarState {
            openclaw: None,
            screenpipe: None,
            agents: HashMap::new(),
            agent_entries: HashMap::new(),
        }))
        .invoke_handler(tauri::generate_handler![
            check_deps,
            install_openclaw,
            configure_model,
            gateway_status,
            start_gateway,
            restart_gateway,
            openclaw_agent,
            detect_providers,
            create_agent,
            list_agents,
            cancel_agent,
            get_agent_output,
            read_directory,
            read_file,
            git_status,
            git_branches,
            git_diff,
            git_commit,
            git_switch_branch,
            spawn_terminal,
            write_terminal,
            kill_terminal,
            create_schedule,
            list_schedules,
            delete_schedule,
            toggle_schedule,
        ])
        .setup(|app| {
            // DevTools: Cmd+Option+I 可以打开（已启用 devtools feature）

            // Auto-start gateway if openclaw is installed
            let openclaw_child = if !check_gateway_health() {
                spawn_openclaw()
            } else {
                None // Already running (dev mode or previous instance)
            };

            // Spawn Screenpipe silently (optional)
            let screenpipe_child = spawn_screenpipe();
            {
                let managed = app.state::<Mutex<SidecarState>>();
                let mut state = managed.lock().unwrap();
                state.openclaw = openclaw_child;
                state.screenpipe = screenpipe_child;
            }

            // Wait for gateway in background, then emit events
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                // Wait up to 15s for gateway to come up
                for _ in 0..15 {
                    if check_gateway_health() {
                        let _ = handle.emit("gateway-ready", true);
                        return;
                    }
                    std::thread::sleep(std::time::Duration::from_secs(1));
                }
                // Timeout — emit anyway, frontend will show degraded status
                let _ = handle.emit("gateway-ready", false);
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::Destroyed = event {
                let state = window.app_handle().state::<Mutex<SidecarState>>();
                let mut s = state.lock().unwrap();
                if let Some(ref mut child) = s.openclaw {
                    let _ = child.kill();
                }
                if let Some(ref mut child) = s.screenpipe {
                    let _ = child.kill();
                }
                for (_, child) in s.agents.iter_mut() {
                    let _ = child.kill();
                }
                s.openclaw = None;
                s.screenpipe = None;
                s.agents.clear();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
