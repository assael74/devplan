import * as React from 'react'
import { updatePlayerSeasonUrl } from '../../../../services/writeV2/edits/player/updateSeasonUrl.js'

const clean = value => String(value ?? '').trim()

export const buildPlayerUrlRows = player => {
  const contexts = Array.isArray(player?.seasonContexts) ? player.seasonContexts : []
  const playerDocumentId = clean(player?.domain?.identity?.playerDocumentId || player?.playerDocumentId || player?.id)
  const rootPlayerId = clean(player?.playerId)
  return contexts.filter(row => clean(row?.seasonKey) && clean(row?.birthTeamId || row?.teamId)).map(row => {
    const seasonKey = clean(row.seasonKey)
    const birthTeamId = clean(row.birthTeamId || row.teamId)
    const birthTeamDocumentId = clean(row.birthTeamDocumentId || row.teamDocumentId)
    const originalUrl = clean(row.playerUrl)
    return {
      key: `${seasonKey}::${birthTeamId}::${birthTeamDocumentId}`,
      seasonKey,
      leagueId: clean(row.leagueId),
      leagueName: clean(row.leagueName),
      teamName: clean(row.clubName || row.teamName),
      birthTeamId,
      birthTeamDocumentId,
      playerDocumentId: playerDocumentId || clean(row.playerDocumentId),
      playerId: rootPlayerId || clean(row.playerId),
      originalUrl,
      draftUrl: originalUrl,
      saving: false,
      saved: false,
      error: '',
    }
  })
}

export default function usePlayerUrlEditor({ player, notify, reload }) {
  const [rows, setRows] = React.useState([])
  const [openState, setOpenState] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const open = React.useCallback(() => { setRows(buildPlayerUrlRows(player)); setOpenState(true) }, [player])
  const close = React.useCallback(() => { if (!saving) setOpenState(false) }, [saving])
  const change = React.useCallback((key, value) => setRows(current => current.map(row => row.key === key ? { ...row, draftUrl: value, saved: false, error: '' } : row)), [])
  const save = React.useCallback(async () => {
    if (saving) return
    const dirty = rows.filter(row => clean(row.draftUrl) !== clean(row.originalUrl))
    if (!dirty.length) return
    setSaving(true)
    let failed = 0
    for (const item of dirty) {
      setRows(current => current.map(row => row.key === item.key ? { ...row, saving: true, error: '' } : row))
      try {
        await updatePlayerSeasonUrl({
          playerDocumentId: item.playerDocumentId, playerId: item.playerId,
          birthTeamId: item.birthTeamId, birthTeamDocumentId: item.birthTeamDocumentId,
          seasonKey: item.seasonKey, playerUrl: clean(item.draftUrl),
        })
        setRows(current => current.map(row => row.key === item.key ? { ...row, originalUrl: clean(item.draftUrl), draftUrl: clean(item.draftUrl), saving: false, saved: true, error: '' } : row))
      } catch (error) {
        failed += 1
        setRows(current => current.map(row => row.key === item.key ? { ...row, saving: false, saved: false, error: error?.message || 'שמירת הקישור נכשלה' } : row))
      }
    }
    let reloadFailed = false
    try { await reload?.() } catch { reloadFailed = true } finally { setSaving(false) }
    notify?.({ status: failed || reloadFailed ? 'warning' : 'success', title: failed ? 'חלק מהקישורים לא נשמרו' : reloadFailed ? 'הקישורים נשמרו, אך רענון הנתונים נכשל' : 'קישורי השחקן נשמרו' })
  }, [notify, reload, rows, saving])
  return { open: openState, rows, saving, openDrawer: open, close, change, save }
}
