import * as React from 'react'
import { updatePlayerSeasonUrl } from '../../../../services/write/roster/edits/updatePlayerSeasonManual.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export const buildPlayerUrlRows = player => {
  const contexts = Array.isArray(player?.seasonContexts) ? player.seasonContexts : []
  const rootPlayerId = clean(player?.playerId)
  return contexts.filter(row => clean(row?.seasonId) && clean(row?.teamId)).map(row => {
    const seasonKey = clean(row.seasonKey)
    const seasonId = clean(row.seasonId)
    const teamId = clean(row.teamId)
    const teamSeasonDocumentId = clean(row.teamSeasonDocumentId)
    const originalUrl = clean(row.playerUrl)
    return {
      key: `${seasonId}::${teamId}::${teamSeasonDocumentId}`,
      seasonId,
      seasonKey,
      leagueId: clean(row.leagueId),
      leagueName: clean(row.leagueName),
      teamName: clean(row.clubName || row.teamName),
      teamId,
      teamSeasonDocumentId,
      playerId: rootPlayerId || clean(row.playerId),
      originalUrl,
      draftUrl: originalUrl,
      saving: false,
      saved: false,
      error: '',
    }
  })
}

export default function usePlayerUrlEditor({ player, notify }) {
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
          playerId: item.playerId,
          teamId: item.teamId,
          teamSeasonDocumentId: item.teamSeasonDocumentId,
          seasonId: item.seasonId,
          playerUrl: clean(item.draftUrl),
        })
        setRows(current => current.map(row => row.key === item.key ? { ...row, originalUrl: clean(item.draftUrl), draftUrl: clean(item.draftUrl), saving: false, saved: true, error: '' } : row))
      } catch (error) {
        failed += 1
        setRows(current => current.map(row => row.key === item.key ? { ...row, saving: false, saved: false, error: error?.message || 'שמירת הקישור נכשלה' } : row))
      }
    }
    setSaving(false)
    notify?.({ status: failed ? 'warning' : 'success', title: failed ? 'חלק מהקישורים לא נשמרו' : 'קישורי השחקן נשמרו' })
  }, [notify, rows, saving])
  return { open: openState, rows, saving, openDrawer: open, close, change, save }
}
