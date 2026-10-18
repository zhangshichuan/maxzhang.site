import { AnimatePresence, motion } from 'framer-motion'
import { Languages, Search, User, X } from 'lucide-react'
import { useTranslations } from '@/src/i18n/client'
import { Link } from '@/src/i18n/client'

interface MoreSheetProps {
  open: boolean
  onClose: () => void
  onLanguage: () => void
}

/**
 * 移动端“更多”底部 Sheet
 *
 * 收纳低频入口：关于、搜索、语言。
 */
export function MoreSheet({ open, onClose, onLanguage }: MoreSheetProps) {
  const t = useTranslations('Common.nav')

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="modal-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-label={t('more')}
            aria-modal="true"
            className="more-sheet"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="panel-header">
              <span className="panel-title">{t('more')}</span>
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
