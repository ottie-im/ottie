/**
 * Ollama 流式聊天 — SSE 解析
 * 逐 token 返回，让 agent 输出有生命感
 */

export interface StreamOptions {
  url: string
  model: string
  messages: { role: string; content: string }[]
  onChunk: (text: string) => void
  onDone: (fullText: string) => void
  onError: (error: string) => void
  maxTokens?: number
  temperature?: number
  signal?: AbortSignal
}

export async function streamOllamaChat(options: StreamOptions): Promise<void> {
  const { url, model, messages, onChunk, onDone, onError, maxTokens = 500, temperature = 0.7, signal } = options
  let fullText = ''

  try {
    const resp = await fetch(`${url}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        stream: true,
      }),
      signal,
    })

    if (!resp.ok) {
      onError(`HTTP ${resp.status}`)
      return
    }

    const reader = resp.body?.getReader()
    if (!reader) {
      // Fallback: non-streaming (some environments don't support ReadableStream)
      const data = await resp.json()
      const text = data.choices?.[0]?.message?.content ?? ''
      fullText = text
      onChunk(text)
      onDone(text)
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // SSE 格式: data: {...}\n\n
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const delta = json.choices?.[0]?.delta?.content
          if (delta) {
            fullText += delta
            onChunk(delta)
          }
        } catch {
          // 忽略解析错误
        }
      }
    }

    onDone(fullText)
  } catch (err: any) {
    if (err.name === 'AbortError') {
      onDone(fullText) // 被取消时仍返回已收集的文本
    } else {
      onError(err.message ?? '流式请求失败')
    }
  }
}
