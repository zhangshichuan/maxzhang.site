import { Mermaid } from '@/src/shared/components'
import * as React from 'react'
import { getMdxModule } from '../mdx'

interface PostMdxProps {
  locale: string
  slug: string
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
          if (
            React.isValidElement(children) &&
            typeof children.props === 'object' &&
            children.props !== null &&
            'className' in children.props &&
            children.props.className === 'language-mermaid'
          ) {
            const chart = 'children' in children.props ? String(children.props.children) : ''
            return <Mermaid chart={chart.replace(/\n$/, '')} />
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
