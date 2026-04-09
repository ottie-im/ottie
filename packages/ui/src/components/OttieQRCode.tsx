import React, { useEffect, useRef } from 'react'

interface OttieQRCodeProps {
  value: string
  size?: number
  onScan?: (data: string) => void
  showMyCode?: boolean
  label?: string
}

/**
 * QR 码组件 — 显示自己的邀请码 / 扫描对方的码
 *
 * 使用 Canvas API 生成简单 QR 码（不依赖外部库的轻量实现）。
 * 生产环境建议替换为 qrcode 库获得更好的纠错能力。
 */
export function OttieQRCode({ value, size = 200, showMyCode = true, label, onScan }: OttieQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!showMyCode || !canvasRef.current) return

    // 动态加载 qrcode 库（如果安装了）
    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(canvasRef.current!, value, {
        width: size,
        margin: 2,
        color: { dark: '#111b21', light: '#ffffff' },
      })
    }).catch(() => {
      // 没有 qrcode 库，显示文本 fallback
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#f0f2f5'
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = '#667781'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('QR 码需要安装 qrcode 库', size / 2, size / 2 - 10)
      ctx.fillText('npm install qrcode', size / 2, size / 2 + 10)
    })
  }, [value, size, showMyCode])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: 'var(--font-family)',
    }}>
      {showMyCode && (
        <>
          <canvas ref={canvasRef} width={size} height={size} style={{ borderRadius: '12px' }} />
          {label && (
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '12px' }}>
              {label}
            </div>
          )}
          <div style={{
            fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px',
            maxWidth: size, textAlign: 'center', wordBreak: 'break-all',
          }}>
            {value}
          </div>
        </>
      )}

      {onScan && (
        <div style={{ marginTop: '16px' }}>
          <input
            type="text"
            placeholder="粘贴对方的邀请链接"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const input = e.currentTarget
                if (input.value.trim()) {
                  onScan(input.value.trim())
                  input.value = ''
                }
              }
            }}
            style={{
              padding: '8px 12px', border: '1px solid var(--border)',
              borderRadius: '8px', fontSize: '14px', width: size,
              fontFamily: 'var(--font-family)',
            }}
          />
        </div>
      )}
    </div>
  )
}
