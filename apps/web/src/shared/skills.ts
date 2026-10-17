export const skillMatrix = [
  {
    icon: '⚙',
    title: '语言与框架',
    titleEn: 'Languages & Frameworks',
    items: ['TypeScript', 'Python', 'Go', 'Next.js', 'FastAPI', 'Tailwind'],
  },
  {
    icon: '▣',
    title: 'AI 工程',
    titleEn: 'AI Engineering',
    items: ['多智能体系统', 'MCP · A2A', 'Docker 沙箱', 'Playwright', 'Agent 任务流'],
  },
  {
    icon: '☁',
    title: '数据与基础设施',
    titleEn: 'Data & Infrastructure',
    items: [
      'PostgreSQL · pgvector',
      'Redis',
      'Kafka · RabbitMQ',
      'S3',
      'Elasticsearch',
      'Docker · K8s',
      'AWS · 腾讯云',
      'OpenTelemetry',
    ],
  },
]

export const flattenSkills = (items: string[]) => items.flatMap((item) => item.split(' · '))

export const marqueeTechs = skillMatrix.flatMap((s) => flattenSkills(s.items)).map((name) => name.toUpperCase())
