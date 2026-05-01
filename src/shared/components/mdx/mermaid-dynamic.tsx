'use client'

import dynamic from 'next/dynamic'

const MermaidInner = dynamic(() => import('./mermaid'), {
  ssr: false,
  loading: () => (
    <div className="bg-card my-12 flex items-center justify-center rounded-2xl border border-border p-10">
      <span className="text-sm font-medium text-muted-foreground">Loading diagram...</span>
    </div>
  ),
})

export function Mermaid({ chart }: { chart: string }) {
  return <MermaidInner chart={chart} />
}
