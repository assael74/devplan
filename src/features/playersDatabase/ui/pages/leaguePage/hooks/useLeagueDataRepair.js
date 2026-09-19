// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueDataRepair.js

import * as React from 'react'

import {
  readLeaguePageData,
  readLeaguesMasterDocument,
} from '../../../../services/read/index.js'
import { invalidateLeagueDocumentCache } from '../../../../services/cache/index.js'
import { syncLeaguesMasterDocument } from '../../../../services/write/leagues/index.js'
import { rebuildClubProjectionsForLeagueTable } from '../../../../services/dataRepair/club/index.js'
import { readActiveAuditFindingById } from '../../../../services/audit/index.js'

const clean = value => String(value || '').trim()

export const leagueAuditFindingBelongsToLeague = ({ finding, leagueId } = {}) => {
  const findingLeagueId = clean(
    finding?.leagueId ||
    finding?.actual?.leagueId ||
    finding?.relatedDocumentId
  )

  return Boolean(findingLeagueId && findingLeagueId === clean(leagueId))
}

export const loadLeagueAuditFinding = async ({
  auditFindingId = '',
  leagueId = '',
  readFinding = readActiveAuditFindingById,
} = {}) => {
  if (!clean(auditFindingId) || !clean(leagueId)) return null

  const finding = await readFinding({ findingId: auditFindingId })
  return leagueAuditFindingBelongsToLeague({ finding, leagueId }) ? finding : null
}

export default function useLeagueDataRepair({
  league,
  leagueDoc,
  selectedSeasonKey,
  leagueImport,
  auditFindingId = '',
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [auditFinding, setAuditFinding] = React.useState(null)
  const [sources, setSources] = React.useState({
    leagueDocument: null,
    leaguesMaster: null,
  })

  React.useEffect(() => {
    setAuditFinding(null)
  }, [auditFindingId, league.id, league.leagueId])

  const loadSources = React.useCallback(async leagueId => {
    invalidateLeagueDocumentCache(leagueId)
    const [leagueResult, leaguesMaster] = await Promise.all([
      readLeaguePageData({ leagueId }),
      readLeaguesMasterDocument({ fresh: true }),
    ])

    setSources({
      leagueDocument: leagueResult.leagueDoc || null,
      leaguesMaster: leaguesMaster || null,
    })
  }, [])

  const openRepair = React.useCallback(async () => {
    const leagueId = String(league.id || league.leagueId || '').trim()
    if (!leagueId || busy) return

    setOpen(true)
    setBusy(true)
    setError('')

    try {
      const finding = await loadLeagueAuditFinding({
        auditFindingId,
        leagueId,
      })
      setAuditFinding(finding)
      await loadSources(leagueId)
    } catch (repairError) {
      setSources({
        leagueDocument: null,
        leaguesMaster: null,
      })
      setAuditFinding(null)
      setError(
        repairError?.message ||
        'טעינת מסמכי הליגה להשוואה נכשלה'
      )
    } finally {
      setBusy(false)
    }
  }, [auditFindingId, busy, league, loadSources])

  const close = React.useCallback(() => {
    setOpen(false)
  }, [])

  const openLeagueLoad = React.useCallback(() => {
    setOpen(false)
    leagueImport.handleOpen()
  }, [leagueImport])

  const syncLeaguesMaster = React.useCallback(async () => {
    const leagueId = String(league.id || league.leagueId || '').trim()
    if (!leagueId || busy) return

    setBusy(true)
    setError('')

    try {
      await syncLeaguesMasterDocument({
        leagues: [{ id: leagueId }],
      })
      await loadSources(leagueId)
      await reload()
      notify('מאסטר הליגות סונכרן', 'success')
    } catch (repairError) {
      setError(repairError?.message || 'סנכרון מאסטר הליגות נכשל')
    } finally {
      setBusy(false)
    }
  }, [busy, league, loadSources, notify, reload])

  const syncClubProjections = React.useCallback(async () => {
    const leagueId = String(league.id || league.leagueId || '').trim()
    if (!leagueId || busy) return

    const sourceLeague = sources.leagueDocument || leagueDoc || league
    const current = sourceLeague?.current
    const history = Array.isArray(sourceLeague?.history)
      ? sourceLeague.history
      : []
    const currentSeasonKey = String(
      current?.seasonKey || current?.seasonId || ''
    )
    const selectedKey = String(selectedSeasonKey || '')
    const sourceSeason = currentSeasonKey === selectedKey
      ? current
      : history.find(item => (
        String(item?.seasonKey || item?.seasonId || '') === selectedKey
      ))
    const rows = Array.isArray(sourceSeason?.tableRank)
      ? sourceSeason.tableRank
      : []

    if (!sourceSeason || !rows.length) {
      setError('אין טבלת ליגה זמינה לסנכרון בעונה הנבחרת')
      return
    }

    setBusy(true)
    setError('')

    try {
      const result = await rebuildClubProjectionsForLeagueTable({
        league: {
          ...sourceLeague,
          id: leagueId,
        },
        season: sourceSeason,
        rows,
        leagueSeasonDocument: sourceSeason,
      })

      if (!result?.completed) {
        await reload()
        const conflictsCount = Array.isArray(result?.conflicts)
          ? result.conflicts.length
          : 0

        throw new Error(
          conflictsCount
            ? `${conflictsCount} קבוצות לא סונכרנו כי הן מופיעות ביותר מליגה אחת באותה עונה`
            : 'סנכרון קבוצות הליגה למועדונים לא הושלם'
        )
      }

      await reload()
      notify('קבוצות הליגה ומאסטר המועדונים סונכרנו', 'success')
    } catch (repairError) {
      setError(
        repairError?.message ||
        'סנכרון קבוצות הליגה למועדונים נכשל'
      )
    } finally {
      setBusy(false)
    }
  }, [
    busy,
    league,
    leagueDoc,
    notify,
    reload,
    selectedSeasonKey,
    sources.leagueDocument,
  ])

  return {
    open,
    busy,
    error,
    auditFinding,
    sources,
    openRepair,
    close,
    openLeagueLoad,
    syncLeaguesMaster,
    syncClubProjections,
  }
}
