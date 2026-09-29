import * as React from 'react'
import { updateTeamSeasonUrl } from '../../../../services/writeV2/edits/team/updateSeasonUrl.js'
import { findTeamPageTableRow } from '../../../../model/team/page/teamPageSeason.model.js'
const clean = value => String(value ?? '').trim()
export const buildTeamUrlRows = ({ leagueDocuments = [], teamId = '', birthTeamDocumentId = '' } = {}) => {
  const rows = []
  ;(Array.isArray(leagueDocuments) ? leagueDocuments : []).forEach(league => {
    const leagueId = clean(league?.leagueId || league?.id)
    const seasons = [league?.current, ...(Array.isArray(league?.history) ? league.history : [])].filter(Boolean)
    seasons.forEach(season => {
      const tableRow = findTeamPageTableRow({ season, teamId })
      if (!tableRow) return
      const seasonKey = clean(season?.seasonKey || season?.seasonId)
      const birthTeamId = clean(tableRow?.birthTeamId || tableRow?.teamId)
      if (!leagueId || !seasonKey || !birthTeamId) return
      const originalUrl = clean(tableRow?.teamUrl)
      rows.push({ key: `${leagueId}::${seasonKey}::${birthTeamId}`, leagueId, leagueName: clean(league?.leagueName || league?.name || leagueId), seasonKey, ageGroupLabel: clean(season?.ageGroupLabel || season?.ageGroupId), birthTeamId, birthTeamDocumentId: clean(birthTeamDocumentId), originalUrl, draftUrl: originalUrl, saving: false, saved: false, error: '' })
    })
  })
  return rows.sort((a, b) => b.seasonKey.localeCompare(a.seasonKey))
}
export default function useTeamPageUrlEditor({ leagueDocuments = [], team, notify, reload }) {
  const [rows, setRows] = React.useState([]); const [open, setOpen] = React.useState(false); const [saving, setSaving] = React.useState(false)
  const openDrawer = React.useCallback(() => { setRows(buildTeamUrlRows({ leagueDocuments, teamId: team?.birthTeamId || team?.id, birthTeamDocumentId: team?.domain?.identity?.birthTeamDocumentId || team?.birthTeamDocumentId || team?.teamDocumentId || team?.domain?.identity?.teamDocumentId || '' })); setOpen(true) }, [leagueDocuments, team])
  const close = React.useCallback(() => { if (!saving) setOpen(false) }, [saving])
  const change = React.useCallback((key, value) => setRows(current => current.map(row => row.key === key ? { ...row, draftUrl: value, saved: false, error: '' } : row)), [])
  const save = React.useCallback(async () => {
    if (saving) return; const dirty = rows.filter(row => clean(row.draftUrl) !== clean(row.originalUrl)); if (!dirty.length) return
    setSaving(true); let failed = 0
    for (const item of dirty) {
      setRows(current => current.map(row => row.key === item.key ? { ...row, saving: true, error: '' } : row))
      try {
        await updateTeamSeasonUrl({ leagueId: item.leagueId, birthTeamId: item.birthTeamId, birthTeamDocumentId: item.birthTeamDocumentId, seasonKey: item.seasonKey, teamUrl: clean(item.draftUrl) })
        setRows(current => current.map(row => row.key === item.key ? { ...row, originalUrl: clean(item.draftUrl), draftUrl: clean(item.draftUrl), saving: false, saved: true, error: '' } : row))
      } catch (error) { failed += 1; setRows(current => current.map(row => row.key === item.key ? { ...row, saving: false, saved: false, error: error?.message || 'שמירת הקישור נכשלה' } : row)) }
    }
    let reloadFailed = false
    try { await reload?.() } catch { reloadFailed = true } finally { setSaving(false) }
    notify?.({ status: failed || reloadFailed ? 'warning' : 'success', title: failed ? 'חלק מהקישורים לא נשמרו' : reloadFailed ? 'הקישורים נשמרו, אך רענון הנתונים נכשל' : 'קישורי הקבוצה נשמרו' })
  }, [notify, reload, rows, saving])
  return { open, rows, saving, openDrawer, close, change, save }
}
