import * as React from 'react'

import {
  readLeaguePageData,
  readLeaguesMasterDocument,
} from '../../../../services/read/index.js'
import { invalidateLeagueDocumentCache } from '../../../../services/cache/index.js'

export default function useLeagueJsonViewer({
  league,
  leagueDoc,
  notify,
}) {
  const [downloading, setDownloading] = React.useState(false)
  const [data, setData] = React.useState(null)

  const open = React.useCallback(async () => {
    if (downloading) return

    setDownloading(true)
    try {
      const leagueId = String(league.id || league.leagueId || '').trim()
      if (!leagueId) throw new Error('חסר מזהה ליגה להורדה')

      invalidateLeagueDocumentCache(leagueId)
      const [leagueResult, leaguesMaster] = await Promise.all([
        readLeaguePageData({ leagueId }),
        readLeaguesMasterDocument({ fresh: true }),
      ])

      setData({
        exportedAt: new Date().toISOString(),
        leagueDocument: leagueResult.leagueDoc || leagueDoc || league,
        leaguesMaster,
      })
    } catch (downloadError) {
      notify(
        downloadError?.message || 'טעינת מסמך הליגה נכשלה',
        'danger'
      )
    } finally {
      setDownloading(false)
    }
  }, [downloading, league, leagueDoc, notify])

  const close = React.useCallback(() => {
    setData(null)
  }, [])

  return {
    downloading,
    data,
    open,
    close,
  }
}
