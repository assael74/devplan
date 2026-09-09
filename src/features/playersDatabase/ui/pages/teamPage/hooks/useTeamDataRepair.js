// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamDataRepair.js

import * as React from 'react'

import { readTeamSearchIndexesExport } from '../../../../services/read/index.js'
import { repairTeamDataIssue } from '../../../../services/dataRepair/team/index.js'

const cleanKey = value => String(value || '').trim()

export default function useTeamDataRepair({
  team,
  teamDoc,
  teamSeasons,
  leagueDoc,
  selectedLeagueSeason,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [teamSearchIndexes, setTeamSearchIndexes] = React.useState([])
  const [indexesLoaded, setIndexesLoaded] = React.useState(false)

  const resolveBirthTeamId = React.useCallback(() => cleanKey(
    team.birthTeamId ||
    team.teamDocumentId ||
    team.id
  ), [team.birthTeamId, team.id, team.teamDocumentId])

  const refreshIndexes = React.useCallback(async () => {
    const birthTeamId = resolveBirthTeamId()
    if (!birthTeamId) return []

    const indexes = await readTeamSearchIndexesExport({ birthTeamId })
    setTeamSearchIndexes(indexes)
    setIndexesLoaded(true)
    return indexes
  }, [resolveBirthTeamId])

  const handleOpen = React.useCallback(async () => {
    const birthTeamId = resolveBirthTeamId()
    if (!birthTeamId) return

    setOpen(true)
    setBusy(true)
    setError('')
    setIndexesLoaded(false)

    try {
      await refreshIndexes()
    } catch (repairError) {
      setTeamSearchIndexes([])
      setError(repairError?.message || 'טעינת האינדקסים של הקבוצה נכשלה')
    } finally {
      setBusy(false)
    }
  }, [refreshIndexes, resolveBirthTeamId])

  const handleRepair = React.useCallback(async issue => {
    if (busy) return

    setBusy(true)
    setError('')

    try {
      const result = await repairTeamDataIssue({
        issue,
        context: {
          teamDocument: teamDoc || team,
          teamSeasons,
          teamSearchIndexes,
          leagueDocument: leagueDoc,
          selectedLeagueSeason,
        },
      })

      await refreshIndexes()
      notify(
        result.changed ? 'התיקון נשמר בהצלחה' : 'הנתון כבר היה תקין',
        'success'
      )
      reload()
    } catch (repairError) {
      setError(repairError?.message || 'תיקון הנתונים נכשל')
    } finally {
      setBusy(false)
    }
  }, [
    busy,
    leagueDoc,
    notify,
    refreshIndexes,
    reload,
    selectedLeagueSeason,
    team,
    teamDoc,
    teamSearchIndexes,
    teamSeasons,
  ])

  const handleClose = React.useCallback(() => {
    if (busy) return
    setOpen(false)
    setError('')
  }, [busy])

  return {
    open,
    busy,
    error,
    teamSearchIndexes,
    indexesLoaded,
    openRepair: handleOpen,
    repair: handleRepair,
    close: handleClose,
  }
}
