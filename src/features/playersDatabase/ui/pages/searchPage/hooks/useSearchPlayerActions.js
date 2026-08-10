// src/features/playersDatabase/ui/pages/searchPage/hooks/useSearchPlayerActions.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'

const buildRowKey = row => [
  row?.playerId,
  row?.season?.seasonId || row?.seasonKey,
  row?.team?.teamId || row?.teamName,
].map(value => String(value || '').trim()).join('::')

const buildProfileKey = (row, profileId) => [
  buildRowKey(row),
  profileId,
].map(value => String(value || '').trim()).join('::')

export default function useSearchPlayerActions({
  setLoadedRows,
  setLoadRevision,
}) {
  const [pendingNoteKeys, setPendingNoteKeys] = React.useState(() => new Set())
  const [pendingScoutProfileKeys, setPendingScoutProfileKeys] = React.useState(() => new Set())
  const [roleRow, setRoleRow] = React.useState(null)
  const [roleDraft, setRoleDraft] = React.useState({
    positionLayer: '',
    primaryPosition: '',
  })
  const [roleBusy, setRoleBusy] = React.useState(false)

  const getRowKey = React.useCallback(row => buildRowKey(row), [])

  const getScoutProfileKey = React.useCallback(
    (row, profileId) => buildProfileKey(row, profileId),
    []
  )

  const saveNotes = React.useCallback(async (row, notes) => {
    if (row?.entityType === 'birthTeamSeason') return null

    const noteKey = getRowKey(row)
    if (!noteKey || pendingNoteKeys.has(noteKey)) return null

    const previousNotes = String(row?.notes || '')
    const nextNotes = String(notes || '').trim()

    setPendingNoteKeys(current => {
      const next = new Set(current)
      next.add(noteKey)
      return next
    })
    setLoadedRows(current => current.map(item => (
      getRowKey(item) === noteKey
        ? {
          ...item,
          notes: nextNotes,
        }
        : item
    )))

    try {
      const identity = row?.identity || {}
      const metadata = row?.metadata || {}
      const season = row?.season || {}
      const team = row?.team || {}

      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_NOTES,
        payload: {
          league: {
            ...(row?.league || {}),
            id: row?.league?.id || team.leagueId || '',
          },
          season: {
            ...season,
            seasonId: season.seasonId || row?.seasonId || '',
            seasonKey: season.seasonKey || row?.seasonKey || '',
          },
          team: {
            ...team,
            birthTeamId: team.birthTeamId || team.teamId || row?.birthTeamId || '',
            teamId: team.teamId || team.birthTeamId || row?.birthTeamId || '',
          },
          player: {
            ...identity,
            playerId: row?.playerId || identity.playerId,
            playerDocumentId:
              identity.playerDocumentId ||
              metadata.sourceDocumentId ||
              row?.playerDocumentId ||
              row?.id,
            fullName: row?.playerName || identity.displayName || '',
            matchedPlayerName: row?.playerName || identity.displayName || '',
          },
          target: metadata.sourceTarget || row?.lifecycle?.type || 'current',
          notes: nextNotes,
        },
      })

      if (result?.playerSeasonResult?.updated !== true) {
        const reason = result?.playerSeasonResult?.reason || 'playerSeasonNotUpdated'
        throw new Error(`ההערה לא נשמרה במסמך השחקן: ${reason}`)
      }

      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        getRowKey(item) === noteKey
          ? {
            ...item,
            notes: previousNotes,
          }
          : item
      )))
      throw error
    } finally {
      setPendingNoteKeys(current => {
        const next = new Set(current)
        next.delete(noteKey)
        return next
      })
    }
  }, [getRowKey, pendingNoteKeys, setLoadedRows])

  const removeScoutProfile = React.useCallback(async (row, profile) => {
    if (!row || row.entityType === 'birthTeamSeason') return null

    const profileId = String(profile?.id || profile?.profileId || '').trim()
    const profileKey = getScoutProfileKey(row, profileId)
    if (!profileId || pendingScoutProfileKeys.has(profileKey)) return null

    const previousProfiles = Array.isArray(row.scoutProfiles)
      ? row.scoutProfiles
      : []
    const nextProfiles = previousProfiles.filter(item => (
      String(item?.id || item?.profileId || '').trim() !== profileId
    ))

    setPendingScoutProfileKeys(current => {
      const next = new Set(current)
      next.add(profileKey)
      return next
    })
    setLoadedRows(current => current.map(item => (
      getRowKey(item) === getRowKey(row)
        ? {
          ...item,
          scoutProfiles: nextProfiles,
        }
        : item
    )))

    try {
      const identity = row.identity || {}
      const metadata = row.metadata || {}
      const season = row.season || {}
      const team = row.team || {}
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.REMOVE_PLAYER_SCOUT_PROFILE,
        payload: {
          league: {
            ...(row.league || {}),
            id: row.league?.id || team.leagueId || '',
          },
          season: {
            ...season,
            seasonId: season.seasonId || row.seasonId || '',
            seasonKey: season.seasonKey || row.seasonKey || '',
          },
          team: {
            ...team,
            birthTeamId: team.birthTeamId || team.teamId || row.birthTeamId || '',
            teamId: team.teamId || team.birthTeamId || row.birthTeamId || '',
          },
          player: {
            ...identity,
            playerId: row.playerId || identity.playerId,
            playerDocumentId:
              identity.playerDocumentId ||
              metadata.sourceDocumentId ||
              row.playerDocumentId ||
              row.id,
            fullName: row.playerName || identity.displayName || '',
            matchedPlayerName: row.playerName || identity.displayName || '',
            scoutProfiles: previousProfiles,
            scoutSignals: previousProfiles,
          },
          target: metadata.sourceTarget || row.lifecycle?.type || 'current',
          profileId,
        },
      })

      if (result?.completed !== true) {
        throw new Error(`מחיקת הפרופיל נעצרה בשלב ${result?.stoppedAt || 'לא ידוע'}`)
      }

      setLoadRevision(current => current + 1)
      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        getRowKey(item) === getRowKey(row)
          ? {
            ...item,
            scoutProfiles: previousProfiles,
          }
          : item
      )))
      throw error
    } finally {
      setPendingScoutProfileKeys(current => {
        const next = new Set(current)
        next.delete(profileKey)
        return next
      })
    }
  }, [
    getRowKey,
    getScoutProfileKey,
    pendingScoutProfileKeys,
    setLoadedRows,
    setLoadRevision,
  ])

  const openRoleEditor = React.useCallback(row => {
    if (!row || row.entityType === 'birthTeamSeason') return

    setRoleRow(row)
    setRoleDraft({
      positionLayer: row.positionLayer || row.position?.layer || '',
      primaryPosition: row.primaryPosition || row.position?.primary || '',
    })
  }, [])

  const closeRoleEditor = React.useCallback(() => {
    if (roleBusy) return

    setRoleRow(null)
    setRoleDraft({
      positionLayer: '',
      primaryPosition: '',
    })
  }, [roleBusy])

  const confirmRoleEditor = React.useCallback(async () => {
    if (!roleRow || roleBusy) return null

    const rowKey = getRowKey(roleRow)
    const previousPositionLayer = roleRow.positionLayer || roleRow.position?.layer || ''
    const previousPrimaryPosition = roleRow.primaryPosition || roleRow.position?.primary || ''

    setRoleBusy(true)
    setLoadedRows(current => current.map(item => (
      getRowKey(item) === rowKey
        ? {
          ...item,
          positionLayer: roleDraft.positionLayer,
          primaryPosition: roleDraft.primaryPosition,
          position: {
            ...(item.position || {}),
            layer: roleDraft.positionLayer,
            primary: roleDraft.primaryPosition,
          },
        }
        : item
    )))

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SEASON_ROLE,
        payload: {
          league: roleRow.league || {},
          season: roleRow.season || {},
          team: roleRow.team || {},
          player: {
            ...(roleRow.identity || {}),
            playerId: roleRow.playerId || roleRow.identity?.playerId,
            playerDocumentId: roleRow.identity?.playerDocumentId || roleRow.id,
            positionLayer: previousPositionLayer,
            primaryPosition: previousPrimaryPosition,
            numShirt: roleRow.numShirt || roleRow.position?.shirtNumber || '',
          },
          target: roleRow.metadata?.sourceTarget || roleRow.lifecycle?.type || 'current',
          positionLayer: roleDraft.positionLayer,
          primaryPosition: roleDraft.primaryPosition,
          numShirt: roleRow.numShirt || roleRow.position?.shirtNumber || '',
        },
      })

      setRoleRow(null)
      setRoleDraft({
        positionLayer: '',
        primaryPosition: '',
      })
      return result
    } catch (error) {
      setLoadedRows(current => current.map(item => (
        getRowKey(item) === rowKey
          ? {
            ...item,
            positionLayer: previousPositionLayer,
            primaryPosition: previousPrimaryPosition,
            position: {
              ...(item.position || {}),
              layer: previousPositionLayer,
              primary: previousPrimaryPosition,
            },
          }
          : item
      )))
      throw error
    } finally {
      setRoleBusy(false)
    }
  }, [getRowKey, roleBusy, roleDraft, roleRow, setLoadedRows])

  const roleChanged = Boolean(
    roleRow && (
      roleDraft.positionLayer !== (roleRow.positionLayer || roleRow.position?.layer || '') ||
      roleDraft.primaryPosition !== (roleRow.primaryPosition || roleRow.position?.primary || '')
    )
  )

  return {
    getRowKey,
    getScoutProfileKey,
    pendingNoteKeys,
    pendingScoutProfileKeys,
    saveNotes,
    removeScoutProfile,
    roleEditor: {
      row: roleRow,
      draft: roleDraft,
      busy: roleBusy,
      changed: roleChanged,
      setDraft: setRoleDraft,
      open: openRoleEditor,
      close: closeRoleEditor,
      confirm: confirmRoleEditor,
    },
  }
}
