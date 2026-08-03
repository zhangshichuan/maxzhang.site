import type { ComponentType } from 'react'

/**
 * 构建期编译后的 MDX 模块形状。
 * 组件接受 components prop，用于注入 pre/code 等自定义渲染。
 */
export type MdxModule = {
  default: ComponentType<{ components?: Record<string, unknown> }>
}
