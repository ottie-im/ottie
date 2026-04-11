import React, { useState, useEffect } from 'react'

interface SetupGuideProps {
  onComplete: () => void
}

type SetupStep = 'checking' | 'node-missing' | 'installing-openclaw' | 'configure-api' | 'starting-gateway' | 'ready'

const PROVIDERS = [
  { id: 'aihubmix', name: 'AIHubMix (推荐，支持全部模型)', baseUrl: 'https://aihubmix.com/v1', defaultModel: 'claude-sonnet-4-20250514', placeholder: 'sk-...' },
  { id: 'anthropic', name: 'Claude (Anthropic)', baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-sonnet-4-20250514', placeholder: 'sk-ant-...' },
  { id: 'openai', name: 'OpenAI (GPT-4)', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o', placeholder: 'sk-...' },
  { id: 'custom', name: '自定义 (兼容 OpenAI)', baseUrl: '', defaultModel: '', placeholder: 'API Key' },
]

export function SetupGuide({ onComplete }: SetupGuideProps) {
  const [step, setStep] = useState<SetupStep>('checking')
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState('aihubmix')
  const [apiKey, setApiKey] = useState('')
  const [customBaseUrl, setCustomBaseUrl] = useState('')
  const [customModel, setCustomModel] = useState('')
  const [progress, setProgress] = useState('')

  // Check dependencies on mount
  useEffect(() => {
    checkDeps()
  }, [])

  const checkDeps = async () => {
    setStep('checking')
    setError(null)

    try {
      if ((window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/core')
        const deps: any = await invoke('check_deps')

        if (!deps.node_installed) {
          setStep('node-missing')
          return
        }

        if (!deps.openclaw_installed) {
          await installOpenClaw()
          return
        }

        if (!deps.api_key_configured) {
          setStep('configure-api')
          return
        }

        // Everything ready — start gateway
        await startGateway()
      } else {
        // Dev mode (browser) — skip checks
        setStep('configure-api')
      }
    } catch (err: any) {
      setError(err.message ?? '检测失败')
      setStep('configure-api') // Let user configure manually
    }
  }

  const installOpenClaw = async () => {
    setStep('installing-openclaw')
    setProgress('正在安装 AI 引擎，首次可能需要 2-3 分钟...')
    setError(null)

    try {
      if ((window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('install_openclaw')
        setProgress('安装完成！')
        setStep('configure-api')
      }
    } catch (err: any) {
      setError(`安装失败: ${err}。请手动运行: npm install -g openclaw`)
      setStep('configure-api') // Continue anyway
    }
  }

  const handleConfigureApi = async () => {
    const selected = PROVIDERS.find(p => p.id === provider)!
    const baseUrl = provider === 'custom' ? customBaseUrl : selected.baseUrl
    const model = provider === 'custom' ? customModel : selected.defaultModel

    if (!apiKey.trim()) {
      setError('请输入 API Key')
      return
    }
    if (provider === 'custom' && (!baseUrl.trim() || !model.trim())) {
      setError('请填写 Base URL 和模型名称')
      return
    }

    setError(null)
    setProgress('正在配置模型...')

    try {
      // Save to localStorage for frontend
      localStorage.setItem('ottie_agent_config', JSON.stringify({ provider, apiKey, model, baseUrl }))

      // Write to OpenClaw config (Tauri only)
      if ((window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('configure_model', { provider, api_key: apiKey, model, base_url: baseUrl })
      }

      await startGateway()
    } catch (err: any) {
      setError(`配置失败: ${err}`)
    }
  }

  const handleSkip = async () => {
    localStorage.setItem('ottie_agent_config', JSON.stringify({ provider: 'none', apiKey: '', model: '', baseUrl: '' }))
    localStorage.setItem('ottie_setup_complete', 'true')
    onComplete()
  }

  const startGateway = async () => {
    setStep('starting-gateway')
    setProgress('正在启动 AI 引擎...')

    try {
      if ((window as any).__TAURI__) {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('start_gateway')
      }
    } catch {
      // Gateway might already be running or fail silently — that's ok
    }

    localStorage.setItem('ottie_setup_complete', 'true')
    setStep('ready')
    setTimeout(onComplete, 1500)
  }

  const stepIndicator = (label: string, state: 'done' | 'active' | 'pending') => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
      <span style={{ fontSize: '16px' }}>
        {state === 'done' ? '✅' : state === 'active' ? '⏳' : '○'}
      </span>
      <span style={{
        fontSize: '14px',
        color: state === 'pending' ? 'var(--text-tertiary)' : 'var(--text-primary)',
        fontWeight: state === 'active' ? 500 : 400,
      }}>
        {label}
      </span>
    </div>
  )

  const getStepStates = () => {
    const steps = ['checking', 'node-missing', 'installing-openclaw', 'configure-api', 'starting-gateway', 'ready']
    const idx = steps.indexOf(step)
    return {
      env: idx > 0 ? 'done' : idx === 0 ? 'active' : 'pending',
      install: idx > 2 ? 'done' : idx >= 1 && idx <= 2 ? 'active' : 'pending',
      api: idx > 3 ? 'done' : idx === 3 ? 'active' : 'pending',
      gateway: idx >= 5 ? 'done' : idx === 4 ? 'active' : 'pending',
    } as Record<string, 'done' | 'active' | 'pending'>
  }

  const states = getStepStates()

  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--cloud-gray)', fontFamily: 'var(--font-family)',
    }}>
      <div style={{
        background: 'var(--white)', borderRadius: '16px', padding: '40px',
        boxShadow: 'var(--shadow-subtle)', maxWidth: '440px', width: '100%',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🦦</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>设置 Ottie</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>首次使用需要配置 AI 引擎</div>
        </div>

        {/* Progress indicators */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--snow-white)', borderRadius: '12px' }}>
          {stepIndicator('系统环境检测', states.env)}
          {stepIndicator('AI 引擎安装', states.install)}
          {stepIndicator('配置 API Key', states.api)}
          {stepIndicator('启动完成', states.gateway)}
        </div>

        {/* Node.js missing */}
        {step === 'node-missing' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              需要安装 Node.js 才能运行 AI 引擎
            </div>
            <button
              onClick={() => window.open('https://nodejs.org/zh-cn/download', '_blank')}
              style={{
                width: '100%', padding: '12px', background: 'var(--ottie-green)', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-family)', marginBottom: '8px',
              }}
            >
              下载 Node.js
            </button>
            <button
              onClick={checkDeps}
              style={{
                width: '100%', padding: '10px', background: 'none', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px',
                cursor: 'pointer', fontFamily: 'var(--font-family)',
              }}
            >
              已安装，重新检测
            </button>
          </div>
        )}

        {/* Installing openclaw */}
        {step === 'installing-openclaw' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{progress}</div>
            <div style={{
              marginTop: '16px', height: '4px', background: 'var(--border)', borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: 'var(--ottie-green)', borderRadius: '2px',
                width: '60%', animation: 'pulse 2s infinite',
              }} />
            </div>
          </div>
        )}

        {/* Configure API key */}
        {step === 'configure-api' && (
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              选择 AI 模型提供商并输入 API Key
            </div>

            {/* Provider selection */}
            <div style={{ marginBottom: '16px' }}>
              {PROVIDERS.map(p => (
                <label key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                  border: provider === p.id ? '2px solid var(--ottie-green)' : '1px solid var(--border)',
                  borderRadius: '8px', marginBottom: '6px', cursor: 'pointer',
                  background: provider === p.id ? '#f0fdf4' : 'transparent',
                }}>
                  <input
                    type="radio" name="provider" value={p.id}
                    checked={provider === p.id}
                    onChange={() => setProvider(p.id)}
                    style={{ accentColor: 'var(--ottie-green)' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{p.name}</span>
                </label>
              ))}
            </div>

            {/* API key input */}
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={PROVIDERS.find(p => p.id === provider)?.placeholder ?? 'API Key'}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                borderRadius: '8px', fontSize: '14px', marginBottom: '8px',
                fontFamily: 'var(--font-family)', boxSizing: 'border-box',
              }}
            />

            {/* Custom provider fields */}
            {provider === 'custom' && (
              <>
                <input
                  type="text" value={customBaseUrl}
                  onChange={e => setCustomBaseUrl(e.target.value)}
                  placeholder="Base URL (https://api.example.com/v1)"
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: '8px', fontSize: '14px', marginBottom: '8px',
                    fontFamily: 'var(--font-family)', boxSizing: 'border-box',
                  }}
                />
                <input
                  type="text" value={customModel}
                  onChange={e => setCustomModel(e.target.value)}
                  placeholder="模型名称 (如 gpt-4o)"
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--border)',
                    borderRadius: '8px', fontSize: '14px', marginBottom: '8px',
                    fontFamily: 'var(--font-family)', boxSizing: 'border-box',
                  }}
                />
              </>
            )}

            <button
              onClick={handleConfigureApi}
              style={{
                width: '100%', padding: '12px', background: 'var(--ottie-green)', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-family)', marginTop: '8px',
              }}
            >
              配置并启动
            </button>

            <button
              onClick={handleSkip}
              style={{
                width: '100%', padding: '10px', background: 'none', color: 'var(--text-tertiary)',
                border: 'none', fontSize: '13px', cursor: 'pointer',
                fontFamily: 'var(--font-family)', marginTop: '8px',
              }}
            >
              跳过，使用基础模式（规则引擎）
            </button>
          </div>
        )}

        {/* Starting gateway */}
        {step === 'starting-gateway' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{progress}</div>
          </div>
        )}

        {/* Ready */}
        {step === 'ready' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>准备就绪！</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>正在进入 Ottie...</div>
          </div>
        )}

        {/* Checking */}
        {step === 'checking' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>正在检测系统环境...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '12px', padding: '10px 12px', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: '8px',
            fontSize: '13px', color: '#b91c1c',
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
