export const skillMatrix = [
  { icon: '⚙', title: 'Languages', items: ['TypeScript', 'Python', 'Go'] },
  {
    icon: '▣',
    title: 'Frameworks',
    items: ['Next.js', 'shadcn', 'Tailwind', 'FastAPI'],
  },
  {
    icon: '☁',
    title: 'Infrastructure',
    items: ['Docker · K8s', 'AWS · 腾讯云', 'MCP · A2A', 'Playwright', 'CI/CD · Git', 'OpenTelemetry'],
  },
  {
    icon: '◇',
    title: 'Data Layer',
    items: ['PostgreSQL · pgvector', 'Redis', 'Kafka · RabbitMQ', 'S3', 'Prisma · SQLAlchemy', 'zod', 'Elasticsearch'],
  },
]

export const flattenSkills = (items: string[]) => items.flatMap((item) => item.split(' · '))

export const marqueeTechs = skillMatrix.flatMap((s) => flattenSkills(s.items)).map((name) => name.toUpperCase())
