// src/features/playersDatabase/ui/pages/searchPage/hooks/useCanonicalSearchAudit.js

import * as React from 'react'

import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'
import { auditLeague } from '../../../../services/audit/league/index.js'
import { auditStats } from '../../../../services/audit/stats/index.js'
import { auditSystem } from '../../../../services/audit/system/index.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const buildDefaults = rows => {
  const safeRows = Array.isArray(rows) ? rows : []
  const scopes = [
    ...new Map(safeRows.map(row => {
      const scope = {
        leagueId: clean(row?.leagueId),
        teamId: clean(row?.teamId),
        seasonId: clean(row?.seasonId),
      }
      return [`${scope.leagueId}::${scope.teamId}::${scope.seasonId}`, scope]
    })).values(),
  ].filter(scope => scope.leagueId && scope.seasonId)

  return scopes.length === 1
    ? scopes[0]
    : { leagueId: '', teamId: '', seasonId: '' }
}

export default function useCanonicalSearchAudit({ rows }) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [result, setResult] = React.useState(null)

  const defaults = React.useMemo(() => buildDefaults(rows), [rows])

  const openAudit = React.useCallback(() => {
    setOpen(true)
    setError('')
  }, [])

  const closeAudit = React.useCallback(() => setOpen(false), [])

  const handleScopeChange = React.useCallback(() => {
    setResult(null)
    setError('')
  }, [])

  const runAudit = React.useCallback(async ({
    type = '',
    leagueId = '',
    teamId = '',
    seasonId = '',
  } = {}) => {
    if (busy) return

    const league = clean(leagueId)
    const team = clean(teamId)
    const season = clean(seasonId)
    if (type !== 'system' && (!league || !season || (type === 'stats' && !team))) {
      setError('חסרים מזהי ליגה, קבוצה או עונה לבדיקה.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const nextResult = type === 'league'
        ? await auditLeague({ leagueId: league, seasonId: season })
        : type === 'stats'
          ? await auditStats({ leagueId: league, teamId: team, seasonId: season })
          : type === 'system'
            ? await auditSystem()
            : null
      if (!nextResult) throw new Error('סוג הבדיקה אינו נתמך')
      setResult(nextResult)
    } catch (auditError) {
      console.error('[playersDatabase] Canonical audit failed:', auditError)
      setError(auditError instanceof Error ? auditError.message : 'הבדיקה נכשלה')
    } finally {
      setBusy(false)
    }
  }, [busy])

  const openTeam = React.useCallback((finding, context = {}) => {
    const teamId = clean(context?.teamId || finding?.teamId || finding?.target?.teamId)
    const leagueId = clean(context?.leagueId || finding?.leagueId)
    if (!teamId || !leagueId) return
    window.open(
      PLAYERS_DATABASE_UI_ROUTES.team({ leagueId, teamId }),
      '_blank',
      'popup=yes,width=1280,height=900,noopener,noreferrer',
    )
  }, [])

  const openLeague = React.useCallback(finding => {
    const leagueId = clean(finding?.leagueId || finding?.target?.leagueId)
    if (!leagueId) return
    window.open(
      PLAYERS_DATABASE_UI_ROUTES.league(leagueId),
      '_blank',
      'popup=yes,width=1280,height=900,noopener,noreferrer',
    )
  }, [])

  return {
    open,
    busy,
    error,
    result,
    defaults,
    openAudit,
    closeAudit,
    handleScopeChange,
    runAudit,
    openTeam,
    openLeague,
  }
}
