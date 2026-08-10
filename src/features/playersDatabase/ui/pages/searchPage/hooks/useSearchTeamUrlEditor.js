// src/features/playersDatabase/ui/pages/searchPage/hooks/useSearchTeamUrlEditor.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'

export default function useSearchTeamUrlEditor({ setLoadedRows }) {
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

  const save = React.useCallback(async teamUrl => {
    if (!row || saving) return null

    const rowId = row.id
    const previousUrl = String(row.teamUrl || row.metadata?.teamUrl || '').trim()
    const nextUrl = String(teamUrl || '').trim()

    setSaving(true)
    setLoadedRows(current => current.map(item => (
      item.id === rowId
        ? {
          ...item,
          teamUrl: nextUrl,
          metadata: {
            ...(item.metadata || {}),
            teamUrl: nextUrl,
          },
        }
        : item
    )))

    try {
      const metadata = row.metadata || {}
      const identity = row.identity || {}
      const season = row.season || {}
      const league = row.league || {}

      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_TEAM_URL,
        payload: {
          target: metadata.sourceTarget || row.lifecycle?.type || 'current',
          league: {
            ...league,
            id: league.id || league.leagueId || '',
          },
          season: {
            ...season,
            seasonId: season.seasonId || row.seasonId || '',
            seasonKey: season.seasonKey || row.seasonKey || '',
          },
          team: {
            ...identity,
            birthTeamId: identity.teamId || row.birthTeamId || '',
            teamId: identity.teamId || row.birthTeamId || '',
            teamDocumentId: identity.teamDocumentId || row.id || '',
            name: row.teamName || identity.displayName || '',
            teamName: row.teamName || identity.displayName || '',
            teamUrl: nextUrl,
          },
        },
      })

      setRow(null)
      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        item.id === rowId
          ? {
            ...item,
            teamUrl: previousUrl,
            metadata: {
              ...(item.metadata || {}),
              teamUrl: previousUrl,
            },
          }
          : item
      )))
      throw error
    } finally {
      setSaving(false)
    }
  }, [row, saving, setLoadedRows])

  return {
    row,
    saving,
    open,
    close,
    save,
  }
}
