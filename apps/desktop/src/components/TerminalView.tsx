/**
 * 终端模拟器 — xterm.js 封装
 * 参考 Paseo 的 terminal-emulator.tsx
 *
 * 在 Tauri 环境下通过 Rust PTY 交互
 * 在 Vite dev 环境下显示只读 shell
 */

import React, { useEffect, useRef, useState } from 'react'

let Terminal: any = null
let FitAddon: any = null
try {
  Terminal = require('xterm').Terminal
  FitAddon = require('@xterm/addon-fit').FitAddon
} catch {}

interface Props {
  terminalId?: string
  cwd?: string
}

export function TerminalView({ terminalId, cwd }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<any>(null)
  const fitRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!Terminal || !containerRef.current) return

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1e1e2e',
        foreground: '#cdd6f4',
        cursor: '#f5e0dc',
        selectionBackground: '#585b70',
        black: '#45475a',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#f5c2e7',
        cyan: '#94e2d5',
        white: '#bac2de',
      },
      scrollback: 5000,
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(containerRef.current)
    fit.fit()

    termRef.current = term
    fitRef.current = fit
    setReady(true)

    // Tauri 环境：连接 PTY
    const connectPTY = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const { listen } = await import('@tauri-apps/api/event')

        const id = await invoke('spawn_terminal', { cwd: cwd ?? '~' }) as string

        // 监听终端输出
        const unlisten = await listen(`terminal-output-${id}`, (event: any) => {
          term.write(event.payload)
        })

        // 发送键盘输入
        term.onData((data: string) => {
          invoke('write_terminal', { terminalId: id, data }).catch(() => {})
        })

        // 清理
        return () => {
          unlisten()
          invoke('kill_terminal', { terminalId: id }).catch(() => {})
        }
      } catch {
        // 非 Tauri 环境：显示提示
        term.writeln('\x1b[32m🦦 Ottie Terminal\x1b[0m')
        term.writeln('')
        term.writeln('\x1b[33m终端需要在 Tauri 桌面端运行\x1b[0m')
        term.writeln('在 Vite dev 模式下终端功能不可用')
        term.writeln('')
        return () => {}
      }
    }

    let cleanup: (() => void) | null = null
    connectPTY().then(fn => { cleanup = fn })

    // 窗口 resize
    const handleResize = () => fit.fit()
    window.addEventListener('resize', handleResize)

    return () => {
      cleanup?.()
      window.removeEventListener('resize', handleResize)
      term.dispose()
    }
  }, [cwd])

  if (!Terminal) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', backgroundColor: '#1e1e2e', color: '#cdd6f4',
        fontFamily: 'monospace', fontSize: '14px',
      }}>
        终端组件加载失败
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#1e1e2e',
      }}
    />
  )
}
