import { Mermaid } from '@/src/shared/components'
import * as React from 'react'
import { getMdxModule } from '../mdx'

interface PostMdxProps {
  locale: string
  slug: string
}

/**
 * 把 React 节点树递归还原成纯文本。
 *
 * MDX 经过 rehype-pretty-code 后，代码块内容会被拆成带样式的 span，
 * 直接 String(children) 只能得到 "[object Object]"。mermaid 图文本
 * 需要从这里把分散的文本节点拼回去。
 */
function collectText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(collectText).join('')
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return collectText(node.props.children)
  }
  return ''
}

/**
 * 渲染构建期编译好的 MDX 组件。
 *
 * ```mermaid 代码块交给 Mermaid 客户端组件渲染，其余代码块原样输出。
 */
export function PostMdx({ locale, slug }: PostMdxProps) {
  const mdxPromise = getMdxModule(locale, slug)
  const MdxContent = mdxPromise ? React.use(mdxPromise).default : null

  if (!MdxContent) return null

  return (
    <MdxContent
      components={{
        pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) => {
          const codeProps =
            React.isValidElement(children) && typeof children.props === 'object' && children.props !== null
              ? (children.props as Record<string, unknown>)
              : null
          const preProps = props as Record<string, unknown>
          const language = preProps['data-language'] ?? codeProps?.['data-language'] ?? codeProps?.className

          if (language === 'mermaid' || language === 'language-mermaid') {
            const chart = codeProps ? collectText(codeProps.children as React.ReactNode).replace(/\n$/, '') : ''
            return <Mermaid chart={chart} />
          }
          return <pre {...props}>{children}</pre>
        },
        code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => (
          <code className={className} {...props}>
            {children}
          </code>
        ),
        table: (props: React.ComponentPropsWithoutRef<'table'>) => (
          <div className="table-scroll">
            <table {...props} />
          </div>
        ),
      }}
    />
  )
}
