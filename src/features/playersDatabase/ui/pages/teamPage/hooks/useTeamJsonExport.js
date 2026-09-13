import * as React from 'react'

import { readTeamSearchIndexesExport } from '../../../../services/read/index.js'
import { downloadTeamDataBundleJson } from '../logic/teamJson.logic.js'

const cleanKey = value => String(value || '').trim()

export default function useTeamJsonExport({
  team,
  teamDoc,
  teamSeasons,
  notify,
}) {
  const [downloading, setDownloading] = React.useState(false)

  const download = React.useCallback(async () => {
    const birthTeamId = cleanKey(
      team.birthTeamId ||
      team.teamDocumentId ||
      team.id
    )
    if (!birthTeamId || downloading) return

    setDownloading(true)
    try {
      const teamSearchIndexes = await readTeamSearchIndexesExport({
        birthTeamId,
      })
      downloadTeamDataBundleJson({
        teamDocument: teamDoc || team,
        teamSeasons,
        teamSearchIndexes,
      })
      notify('קובץ JSON של הקבוצה הורד', 'success')
    } catch (downloadError) {
      notify(
        downloadError?.message || 'הורדת קובץ הקבוצה נכשלה',
        'danger'
      )
    } finally {
      setDownloading(false)
    }
  }, [
    downloading,
    notify,
    team,
    teamDoc,
    teamSeasons,
  ])

  return {
    downloading,
    download,
  }
}
