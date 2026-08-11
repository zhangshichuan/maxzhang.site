import { AnimatePresence, motion } from 'framer-motion'
import { Languages, Search, SlidersHorizontal, User, X } from 'lucide-react'
import { useTranslations } from '@/src/i18n/client'
import { Link } from '@/src/i18n/client'

interface MoreSheetProps {
  open: boolean
  onClose: () => void
  onLanguage: () => void
  onAppearance: () => void
}

/**
 * 移动端“更多”底部 Sheet
 *
 * 收纳低频入口：关于、搜索、语言、外观。
 * 与外观面板同形态：桌面端为弹出卡片，移动端为底部 Sheet。
 */
export function MoreSheet({ open, onClose, onLanguage, onAppearance }: MoreSheetProps) {
  const t = useTranslations('Common.nav')

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="appearance-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label={t('more')}
            aria-modal="true"
            className="more-sheet glass-panel"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="appearance-panel-header">
              <span className="appearance-panel-title">{t('more')}</span>
              <button type="button" className="icon-btn icon-btn-sm" onClick={onClose} aria-label={t('moreClose')}>
                <X className="size-4" />
              </button>
            </div>

            <div className="card-group">
              <Link href="/about" className="card-row" onClick={onClose}>
                <User className="size-4 text-primary" />
                {t('about')}
              </Link>
              <Link href="/search" className="card-row" onClick={onClose}>
                <Search className="size-4 text-primary" />
                {t('search')}
              </Link>
              <button
                type="button"
                className="card-row w-full cursor-pointer border-none bg-transparent text-left"
                onClick={onLanguage}
              >
                <Languages className="size-4 text-primary" />
                {t('language')}
              </button>
              <button
                type="button"
                className="card-row w-full cursor-pointer border-none bg-transparent text-left"
                onClick={() => {
                  onClose()
                  onAppearance()
                }}
              >
                <SlidersHorizontal className="size-4 text-primary" />
                {t('appearance')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
