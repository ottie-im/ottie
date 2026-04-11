/**
 * Ottie A2UI Component Catalog
 *
 * 定义 Ottie 支持渲染的 A2UI 组件类型。
 * 第三方 Agent 只能请求渲染 catalog 中存在的组件。
 * 这是安全模型的核心——Agent 不能注入任意代码。
 */

import React from 'react'

export interface A2UIComponentDef {
  type: string
  render: (props: Record<string, any>, children?: React.ReactNode[]) => React.ReactElement
}

/**
 * 默认 Ottie 组件目录
 * 映射 A2UI 标准组件类型 → Ottie UI 渲染
 */
export const DEFAULT_CATALOG: Record<string, A2UIComponentDef> = {
  'card': {
    type: 'card',
    render: (props, children) => React.createElement('div', {
      style: {
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '16px', marginBottom: '8px',
        fontFamily: 'var(--font-family)',
      },
    }, ...(children ?? [])),
  },

  'text': {
    type: 'text',
    render: (props) => React.createElement('span', {
      style: {
        fontSize: props.size === 'large' ? '16px' : props.size === 'small' ? '12px' : '14px',
        fontWeight: props.weight === 'bold' ? 600 : 400,
        color: props.color ?? 'var(--text-primary)',
      },
    }, props.value ?? props.text ?? ''),
  },

  'button': {
    type: 'button',
    render: (props) => React.createElement('button', {
      onClick: props.onAction,
      style: {
        background: props.variant === 'primary' ? 'var(--ottie-green)' : 'var(--cloud-gray)',
        color: props.variant === 'primary' ? '#fff' : 'var(--text-primary)',
        border: 'none', borderRadius: '8px', padding: '8px 16px',
        fontSize: '14px', fontWeight: 500, cursor: 'pointer',
        fontFamily: 'var(--font-family)',
      },
    }, props.label ?? props.text ?? 'Button'),
  },

  'image': {
    type: 'image',
    render: (props) => React.createElement('img', {
      src: props.src ?? props.url,
      alt: props.alt ?? '',
      style: {
        maxWidth: '100%', borderRadius: '8px',
        maxHeight: props.maxHeight ?? '300px',
      },
    }),
  },

  'row': {
    type: 'row',
    render: (props, children) => React.createElement('div', {
      style: {
        display: 'flex', gap: props.gap ?? '8px',
        alignItems: props.align ?? 'center',
        flexWrap: props.wrap ? 'wrap' : undefined,
      },
    }, ...(children ?? [])),
  },

  'column': {
    type: 'column',
    render: (props, children) => React.createElement('div', {
      style: {
        display: 'flex', flexDirection: 'column',
        gap: props.gap ?? '8px',
      },
    }, ...(children ?? [])),
  },

  'divider': {
    type: 'divider',
    render: () => React.createElement('hr', {
      style: { border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' },
    }),
  },

  'spacer': {
    type: 'spacer',
    render: (props) => React.createElement('div', {
      style: { height: props.height ?? '16px' },
    }),
  },

  'text-field': {
    type: 'text-field',
    render: (props) => React.createElement('input', {
      type: 'text',
      placeholder: props.placeholder ?? '',
      defaultValue: props.value ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => props.onAction?.(e.target.value),
      style: {
        width: '100%', padding: '8px 12px',
        border: '1px solid var(--border)', borderRadius: '8px',
        fontSize: '14px', fontFamily: 'var(--font-family)',
        outline: 'none', boxSizing: 'border-box' as const,
      },
    }),
  },
}
