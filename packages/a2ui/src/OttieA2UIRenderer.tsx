/**
 * OttieA2UIRenderer — 把 A2UI JSON 渲染成 React 组件
 *
 * 安全模型：只渲染 catalog 中注册的组件，拒绝未知类型。
 * Agent 发来 A2UIPayload → 渲染器遍历 components → 用 catalog 映射渲染。
 */

import React from 'react'
import type { A2UIPayload, A2UIComponent, A2UIEvent } from '@ottie-im/contracts'
import { DEFAULT_CATALOG, type A2UIComponentDef } from './catalog'

interface OttieA2UIRendererProps {
  payload: A2UIPayload
  catalog?: Record<string, A2UIComponentDef>
  onEvent?: (event: A2UIEvent) => void
}

export function OttieA2UIRenderer({
  payload,
  catalog = DEFAULT_CATALOG,
  onEvent,
}: OttieA2UIRendererProps) {
  const { components, data } = payload

  // Build component map for ID lookup
  const componentMap = new Map<string, A2UIComponent>()
  for (const comp of components) {
    componentMap.set(comp.id, comp)
  }

  function renderComponent(comp: A2UIComponent): React.ReactElement | null {
    const def = catalog[comp.type]
    if (!def) {
      // Unknown component type — security: skip silently
      console.warn(`[A2UI] Unknown component type: ${comp.type}, skipping`)
      return null
    }

    // Resolve data bindings
    const resolvedProps = { ...comp.properties }
    for (const [key, value] of Object.entries(resolvedProps)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}') && data) {
        const dataKey = value.slice(2, -2).trim()
        resolvedProps[key] = data[dataKey] ?? value
      }
    }

    // Add event handler
    if (onEvent) {
      resolvedProps.onAction = () => {
        onEvent({
          componentId: comp.id,
          eventType: 'click',
          value: resolvedProps.value,
        })
      }
    }

    // Render children recursively
    const children = comp.children
      ?.map(childId => componentMap.get(childId))
      .filter(Boolean)
      .map(child => renderComponent(child!))
      .filter(Boolean) as React.ReactElement[] | undefined

    return React.createElement(
      React.Fragment,
      { key: comp.id },
      def.render(resolvedProps, children)
    )
  }

  // Find root component (first one, or one without parent)
  const childIds = new Set(components.flatMap(c => c.children ?? []))
  const rootComponents = components.filter(c => !childIds.has(c.id))

  if (rootComponents.length === 0 && components.length > 0) {
    // Fallback: render all
    return React.createElement('div', null, ...components.map(renderComponent).filter(Boolean))
  }

  return React.createElement('div', {
    style: { fontFamily: 'var(--font-family)' },
  }, ...rootComponents.map(renderComponent).filter(Boolean))
}
