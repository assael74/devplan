// src/features/playersDatabase/ui/pages/teamPage/hooks/useTeamPageUrlEditor.js

import * as React from 'react'
import { updateTeamSeasonUrl } from '../../../../services/write/league/edits/updateTeamSeasonUrl.js'
import { buildTeamSeasonDocumentId } from '../../../../domain/identity/index.js'
import { findTeamPageTableRow } from '../../../../model/team/page/teamPageSeason.model.js'
const clean = value => String(value === null || value === undefined ? '' : value).trim()
export const buildTeamUrlRows = ({ leagueDocuments = [], teamId = '' } = {}) => {
  const rows = []
  ;(Array.isArray(leagueDocuments) ? leagueDocuments : []).forEach(league => {
    const leagueId = clean(league?.leagueId || league?.id)
    const seasons = league?.seasonsById && typeof league.seasonsById === 'object'
      ? Object.entries(league.seasonsById)
      : []
    seasons.forEach(([seasonDocumentId, season]) => {
      const tableRow = findTeamPageTableRow({ season, teamId })
      if (!tableRow) return
      const seasonId = clean(season?.seasonId || seasonDocumentId)
      const seasonKey = clean(season?.seasonKey || seasonId)
      const rowTeamId = clean(tableRow?.teamId)
      if (!leagueId || !seasonId || !rowTeamId) return
      const originalUrl = clean(tableRow?.teamUrl)
      rows.push({ key: `${leagueId}::${seasonId}::${rowTeamId}`, leagueId, leagueName: clean(league?.names?.display || league?.names?.official || leagueId), seasonId, seasonKey, ageGroupLabel: clean(season?.ageGroupLabel || league?.ageGroupLabel || league?.ageGroupId), teamId: rowTeamId, teamSeasonDocumentId: buildTeamSeasonDocumentId({ teamId: rowTeamId, seasonId }), originalUrl, draftUrl: originalUrl, saving: false, saved: false, error: '' })
    })
  })
  return rows.sort((a, b) => b.seasonKey.localeCompare(a.seasonKey))
}
export default function useTeamPageUrlEditor({ leagueDocuments = [], team, notify }) {
  const [rows, setRows] = React.useState([]); const [open, setOpen] = React.useState(false); const [saving, setSaving] = React.useState(false)
  const openDrawer = React.useCallback(() => { setRows(buildTeamUrlRows({ leagueDocuments, teamId: team?.teamId || team?.id })); setOpen(true) }, [leagueDocuments, team])
  const close = React.useCallback(() => { if (!saving) setOpen(false) }, [saving])
  const change = React.useCallback((key, value) => setRows(current => current.map(row => row.key === key ? { ...row, draftUrl: value, saved: false, error: '' } : row)), [])
  const save = React.useCallback(async () => {
    if (saving) return; const dirty = rows.filter(row => clean(row.draftUrl) !== clean(row.originalUrl)); if (!dirty.length) return
    setSaving(true); let failed = 0
    for (const item of dirty) {
      setRows(current => current.map(row => row.key === item.key ? { ...row, saving: true, error: '' } : row))
      try {
        await updateTeamSeasonUrl({ leagueId: item.leagueId, teamId: item.teamId, teamSeasonDocumentId: item.teamSeasonDocumentId, seasonId: item.seasonId, teamUrl: clean(item.draftUrl) })
        setRows(current => current.map(row => row.key === item.key ? { ...row, originalUrl: clean(item.draftUrl), draftUrl: clean(item.draftUrl), saving: false, saved: true, error: '' } : row))
      } catch (error) { failed += 1; setRows(current => current.map(row => row.key === item.key ? { ...row, saving: false, saved: false, error: error?.message || 'שמירת הקישור נכשלה' } : row)) }
    }
    setSaving(false)
    notify?.({ status: failed ? 'warning' : 'success', title: failed ? 'חלק מהקישורים לא נשמרו' : 'קישורי הקבוצה נשמרו' })
  }, [notify, rows, saving])
  return { open, rows, saving, openDrawer, close, change, save }
}
