// src/features/playersDatabase/ui/pages/searchPage/hooks/useSearchTeamUrlEditor.js

import * as React from 'react'
import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { saveEditor } from '../../../hooks/saveEditor.js'

import { updateTeamSeasonUrl } from '../../../../services/write/league/edits/updateTeamSeasonUrl.js'

export default function useSearchTeamUrlEditor({ reload }) {
  const { notify } = useSnackbar()
  const [row, setRow] = React.useState(null)
  const [saving, setSaving] = React.useState(false)

  const open = React.useCallback(nextRow => {
    if (!nextRow || nextRow.entityType !== 'birthTeamSeason') return
    setRow(nextRow)
  }, [])

  const close = React.useCallback(() => {
    if (saving) return
    setRow(null)
  }, [saving])

  const save = React.useCallback(
    async teamUrl => {
      if (!row || saving) return
      await saveEditor({
        write: () =>
          updateTeamSeasonUrl({
            leagueId: row.league?.id || row.league?.leagueId || row.leagueId,
            teamId: row.team?.teamId || row.teamId,
            teamSeasonDocumentId:
              row.references?.teamSeasonDocumentId || row.teamSeasonDocumentId,
            seasonId: row.seasonId,
            teamUrl,
          }),
        reload: () => reload(row.id),
        notify,
        close: () => setRow(null),
        setSaving,
        title: 'קישור הקבוצה נשמר',
      })
    },
    [row, saving, reload, notify],
  )

  return {
    row,
    saving,
    open,
    close,
    save,
  }
}
