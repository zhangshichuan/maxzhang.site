'use server'

import { incrementView as incrementViewService } from '@/src/features/engagement/services'

export async function incrementView(slug: string, locale: string, fingerprint: string) {
  return incrementViewService(slug, locale, fingerprint)
}
