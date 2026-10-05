// src/features/playersDatabase/ui/hooks/useTeamUrlEditor.js

import * as React from 'react'

import { updateTeamSeasonUrl } from '../../services/write/league/edits/updateTeamSeasonUrl.js'
import { saveEditor } from './saveEditor.js'

export default function useTeamUrlEditor({
  leagueId,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [row, setRow] = React.useState(null)
  const [saving, setSaving] = React.useState(false)

  const open = React.useCallback(teamRow => {
    setRow(teamRow)
  }, [])

  const close = React.useCallback(() => {
    if (saving) return
    setRow(null)
  }, [saving])

  const save = React.useCallback(
    async teamUrl => {
      if (!row || !selectedSeasonOption || saving) return
      await saveEditor({
        write: () =>
          updateTeamSeasonUrl({
            leagueId: selectedSeasonOption.leagueId || leagueId,
            teamId: row.teamId,
            teamSeasonDocumentId: row.teamSeasonDocumentId,
            seasonId: selectedSeasonOption.seasonId,
            teamUrl,
          }),
        reload,
        reloadAfterSuccess: false,
        notify,
        close: () => setRow(null),
        setSaving,
        title: 'קישור הקבוצה נשמר',
      })
    },
    [leagueId, reload, notify, row, selectedSeasonOption, saving],
  )

  return {
    row,
    open,
    close,
    save,
    saving,
  }
}
