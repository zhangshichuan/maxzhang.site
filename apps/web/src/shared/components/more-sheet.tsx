import { AnimatePresence, motion } from 'framer-motion'
import { Camera, Languages, Search, Sparkles, X } from 'lucide-react'
import { useTranslations } from '@/src/i18n/client'
import { Link } from '@/src/i18n/client'

interface MoreSheetProps {
  open: boolean
  onClose: () => void
  onLanguage: () => void
}

/**
 * 移动端「更多」面板
 *
 * 收纳低频入口：摄影、树洞、搜索、语言。
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="panel-header">
              <span className="panel-title">{t('more')}</span>
              <button type="button" className="icon-btn icon-btn-sm" onClick={onClose} aria-label={t('moreClose')}>
                <X className="size-4" />
              </button>
            </div>

            <div className="card-group">
              <Link href="/photos" className="card-row" onClick={onClose}>
                <Camera className="size-4 text-primary" />
                {t('photos')}
              </Link>
              <Link href="/chat" className="card-row" onClick={onClose}>
                <Sparkles className="size-4 text-primary" />
                {t('chat')}
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
