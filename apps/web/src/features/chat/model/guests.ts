import type { Locale } from '@/i18n/routing'

/** 一桌最多几位宾客。超过这个数，群聊会变成轮流念稿。 */
export const MAX_TABLE_GUESTS = 3

export const GUEST_IDS = [
  'steve-jobs',
  'elon-musk',
  'charlie-munger',
  'naval-ravikant',
  'nassim-taleb',
  'richard-feynman',
  'paul-graham',
  'andrej-karpathy',
  'ilya-sutskever',
  'zhang-yiming',
  'zhang-xuefeng',
  'mrbeast',
  'donald-trump',
  'justin-sun',
] as const

export type GuestId = (typeof GUEST_IDS)[number]
export type GuestGroup = 'invest' | 'tech' | 'science' | 'media' | 'education'
export type GuestGroupFilter = GuestGroup | 'all'

export type LocalizedText = {
  zh: string
  en: string
}

export type Guest = {
  id: GuestId
  name: LocalizedText
  short: LocalizedText
  field: LocalizedText
  tagline: LocalizedText
  group: GuestGroup
  initials: string
}

export const GUESTS: readonly Guest[] = [
  {
    id: 'steve-jobs',
    name: { zh: '史蒂夫·乔布斯', en: 'Steve Jobs' },
    short: { zh: '乔布斯', en: 'Jobs' },
    field: { zh: '产品与设计', en: 'Product & Design' },
    tagline: { zh: '把产品砍到只剩必要的东西。', en: 'Cut the product down to what is necessary.' },
    group: 'tech',
    initials: 'SJ',
  },
  {
    id: 'elon-musk',
    name: { zh: '埃隆·马斯克', en: 'Elon Musk' },
    short: { zh: '马斯克', en: 'Musk' },
    field: { zh: '工程与第一性原理', en: 'Engineering & First Principles' },
    tagline: { zh: '先算物理极限，再问流程为什么存在。', en: 'Check the physics first. Then question the process.' },
    group: 'tech',
    initials: 'EM',
  },
  {
    id: 'charlie-munger',
    name: { zh: '查理·芒格', en: 'Charlie Munger' },
    short: { zh: '芒格', en: 'Munger' },
    field: { zh: '投资与多元思维', en: 'Investing & Mental Models' },
    tagline: { zh: '反过来想，先避免愚蠢。', en: 'Invert, always invert. Avoid stupidity first.' },
    group: 'invest',
    initials: 'CM',
  },
  {
    id: 'naval-ravikant',
    name: { zh: '纳瓦尔·拉维坎特', en: 'Naval Ravikant' },
    short: { zh: '纳瓦尔', en: 'Naval' },
    field: { zh: '财富与杠杆', en: 'Wealth & Leverage' },
    tagline: { zh: '财富是睡觉时也在为你工作的资产。', en: 'Wealth is assets that earn while you sleep.' },
    group: 'invest',
    initials: 'NR',
  },
  {
    id: 'nassim-taleb',
    name: { zh: '纳西姆·塔勒布', en: 'Nassim Taleb' },
    short: { zh: '塔勒布', en: 'Taleb' },
    field: { zh: '风险与反脆弱', en: 'Risk & Antifragility' },
    tagline: { zh: '先问最坏的结果你扛不扛得住。', en: 'Ask whether you can survive the worst case.' },
    group: 'invest',
    initials: 'NT',
  },
  {
    id: 'richard-feynman',
    name: { zh: '理查德·费曼', en: 'Richard Feynman' },
    short: { zh: '费曼', en: 'Feynman' },
    field: { zh: '科学与学习', en: 'Science & Learning' },
    tagline: { zh: '讲不清，就是没真懂。', en: 'If you cannot explain it, you do not understand it.' },
    group: 'science',
    initials: 'RF',
  },
  {
    id: 'paul-graham',
    name: { zh: '保罗·格雷厄姆', en: 'Paul Graham' },
    short: { zh: 'Paul Graham', en: 'Paul Graham' },
    field: { zh: '创业与写作', en: 'Startups & Writing' },
    tagline: { zh: '做少数人真正想要的东西。', en: 'Make something a few people really want.' },
    group: 'tech',
    initials: 'PG',
  },
  {
    id: 'andrej-karpathy',
    name: { zh: '安德烈·卡帕西', en: 'Andrej Karpathy' },
    short: { zh: '卡帕西', en: 'Karpathy' },
    field: { zh: 'AI 工程与教育', en: 'AI Engineering & Education' },
    tagline: { zh: '让数据写出行为，而不是手写规则。', en: 'Let data write the behavior, not hand-written rules.' },
    group: 'tech',
    initials: 'AK',
  },
  {
    id: 'ilya-sutskever',
    name: { zh: '伊利亚·苏茨克维', en: 'Ilya Sutskever' },
    short: { zh: '伊利亚', en: 'Ilya' },
    field: { zh: 'AI 与规模', en: 'AI & Scaling' },
    tagline: { zh: '规模是工具，不是原则。', en: 'Scale is a tool, not a principle.' },
    group: 'tech',
    initials: 'IS',
  },
  {
    id: 'zhang-yiming',
    name: { zh: '张一鸣', en: 'Zhang Yiming' },
    short: { zh: '一鸣', en: 'Yiming' },
    field: { zh: '组织与全球化', en: 'Organizations & Globalization' },
    tagline: { zh: 'Context, not control.', en: 'Context, not control.' },
    group: 'tech',
    initials: 'ZY',
  },
  {
    id: 'zhang-xuefeng',
    name: { zh: '张雪峰', en: 'Zhang Xuefeng' },
    short: { zh: '张老师', en: 'Xuefeng' },
    field: { zh: '教育与选择', en: 'Education & Choice' },
    tagline: { zh: '先看清赔率，再谈理想。', en: 'Read the odds before you talk about dreams.' },
    group: 'education',
    initials: 'ZX',
  },
  {
    id: 'mrbeast',
    name: { zh: 'MrBeast', en: 'MrBeast' },
    short: { zh: 'MrBeast', en: 'MrBeast' },
    field: { zh: '内容与增长', en: 'Content & Growth' },
    tagline: { zh: '先赢点击，再赢观看时长。', en: 'Win the click. Then win the watch time.' },
    group: 'media',
    initials: 'MB',
  },
  {
    id: 'donald-trump',
    name: { zh: '唐纳德·特朗普', en: 'Donald Trump' },
    short: { zh: '特朗普', en: 'Trump' },
    field: { zh: '谈判与权力', en: 'Negotiation & Power' },
    tagline: { zh: '先制造不确定性，再谈条件。', en: 'Create uncertainty, then negotiate.' },
    group: 'media',
    initials: 'DT',
  },
  {
    id: 'justin-sun',
    name: { zh: '孙宇晨', en: 'Justin Sun' },
    short: { zh: '孙宇晨', en: 'Justin Sun' },
    field: { zh: '注意力与叙事', en: 'Attention & Narrative' },
    tagline: { zh: '注意力是唯一的稀缺资源。', en: 'Attention is the only scarce resource.' },
    group: 'media',
    initials: 'JS',
  },
]

const guestMap = new Map<GuestId, Guest>(GUESTS.map((guest) => [guest.id, guest]))

export function getGuest(id: GuestId): Guest {
  const guest = guestMap.get(id)
  if (!guest) throw new Error(`Unknown guest: ${id}`)
  return guest
}

export function isGuestId(value: string): value is GuestId {
  return guestMap.has(value as GuestId)
}

export function localizedText(value: LocalizedText, locale: Locale): string {
  return value[locale === 'zh' ? 'zh' : 'en']
}

export function guestName(guest: Guest, locale: Locale, short = false): string {
  return localizedText(short ? guest.short : guest.name, locale)
}

export const GUEST_GROUPS: readonly { id: GuestGroupFilter; label: LocalizedText }[] = [
  { id: 'all', label: { zh: '全部', en: 'All' } },
  { id: 'tech', label: { zh: '科技与产品', en: 'Tech & Product' } },
  { id: 'invest', label: { zh: '投资与风险', en: 'Investing & Risk' } },
  { id: 'science', label: { zh: '科学与学习', en: 'Science & Learning' } },
  { id: 'media', label: { zh: '传播与权力', en: 'Media & Power' } },
  { id: 'education', label: { zh: '教育与选择', en: 'Education & Choice' } },
]

export const TABLE_PRESETS: readonly { id: string; guests: readonly GuestId[]; label: LocalizedText }[] = [
  {
    id: 'product',
    guests: ['steve-jobs', 'paul-graham', 'andrej-karpathy'],
    label: { zh: '产品桌', en: 'Product table' },
  },
  {
    id: 'invest',
    guests: ['charlie-munger', 'naval-ravikant', 'nassim-taleb'],
    label: { zh: '投资桌', en: 'Investing table' },
  },
  {
    id: 'ai',
    guests: ['andrej-karpathy', 'ilya-sutskever', 'elon-musk'],
    label: { zh: 'AI 桌', en: 'AI table' },
  },
  {
    id: 'content',
    guests: ['mrbeast', 'donald-trump', 'justin-sun'],
    label: { zh: '内容桌', en: 'Content table' },
  },
]
