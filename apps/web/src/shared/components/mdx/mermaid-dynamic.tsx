import { lazy, Suspense } from 'react'

const MermaidInner = lazy(() => import('./mermaid'))

function MermaidFallback() {
  return (
    <div
      className="my-12 flex items-center justify-center rounded-lg border p-10"
      style={{ borderColor: 'var(--separator)', background: 'var(--bg-secondary)' }}
    >
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
