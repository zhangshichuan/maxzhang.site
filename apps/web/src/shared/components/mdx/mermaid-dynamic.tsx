import { lazy, Suspense } from 'react'

const MermaidInner = lazy(() => import('./mermaid'))

function MermaidFallback() {
  return (
    <div className="my-12 flex items-center justify-center rounded-2xl border border-border bg-card p-10">
      <span className="text-sm font-medium text-muted-foreground">Loading diagram...</span>
    </div>
  )
}

export function Mermaid({ chart }: { chart: string }) {
  return (
    <Suspense fallback={<MermaidFallback />}>
      <MermaidInner chart={chart} />
    </Suspense>
  )
}
