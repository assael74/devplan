// src/features/playersDatabase/ui/pages/playerPage/hooks/usePlayerDataRepair.js

import * as React from 'react'

import {
  canReadPlayerSearchIndexExport,
  getTeamById,
  getTeamSeason,
  readPlayerSearchIndexExport,
  readPlayerSource,
} from '../../../../services/read/index.js'
import { repairPlayerDataIssue } from '../../../../services/dataRepair/player/index.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'

const clean = value => String(value || '').trim()

const repairTeamIdOf = row => clean(
  row?.birthTeamDocumentId ||
  row?.teamDocumentId ||
  row?.birthTeamId ||
  row?.teamId
)

const repairSeasonKeyOf = row => clean(row?.seasonKey || row?.seasonId)

const repairContextKeyOf = row => [
  repairTeamIdOf(row),
  repairSeasonKeyOf(row),
  clean(row?.leagueId),
].join('::')

const playerIdentityValues = player => new Set([
  player?.id,
  player?.playerDocumentId,
  player?.playerId,
  player?.externalPlayerId,
].map(value => clean(value).replace(/^external__/, '')).filter(Boolean))

const isSameRepairPlayer = ({ teamPlayer = {}, identities = new Set() } = {}) => (
  [...playerIdentityValues(teamPlayer)].some(value => identities.has(value))
)

const buildRepairIndexPlayer = ({
  playerDocument = {},
  teamDocument = {},
  teamSeason = {},
  teamPlayer = {},
  context = {},
} = {}) => ({
  id: clean(playerDocument.id),
  playerId: clean(teamPlayer.playerId || playerDocument.playerId),
  externalPlayerId: clean(teamPlayer.externalPlayerId || playerDocument.externalPlayerId),
  fullName: clean(teamPlayer.fullName || playerDocument.fullName),
  activeSeason: {
    identity: {
      playerId: clean(teamPlayer.playerId || playerDocument.playerId),
      externalPlayerId: clean(teamPlayer.externalPlayerId || playerDocument.externalPlayerId),
      normalizedName: clean(teamPlayer.normalizedName || playerDocument.normalizedName),
      displayName: clean(teamPlayer.fullName || playerDocument.fullName),
    },
    season: {
      seasonKey: repairSeasonKeyOf(context),
      seasonId: repairSeasonKeyOf(context),
      birthYear: teamSeason.birthYear || teamDocument.birthYear || playerDocument.birthYear,
    },
    team: {
      leagueId: clean(teamSeason.leagueId || context.leagueId),
      clubId: clean(teamSeason.clubId || teamDocument.clubId || context.clubId),
      teamId: repairTeamIdOf(context),
      ageGroupId: clean(teamSeason.ageGroupId || teamDocument.ageGroupId),
      ageGroupLabel: clean(teamSeason.ageGroupLabel || teamDocument.ageGroupLabel),
      birthTeamSlot: teamSeason.birthTeamSlot || teamDocument.birthTeamSlot || 1,
    },
  },
})

export default function usePlayerDataRepair({
  player,
  playerId,
  requestedSeasonKey,
  requestedTeamId,
  notify,
  reload,
  navigate,
}) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [contexts, setContexts] = React.useState([])

  const loadSources = React.useCallback(async () => {
    const playerDocument = await readPlayerSource({ playerId })
    const contextsByKey = new Map()
    const addContext = row => {
      const teamId = repairTeamIdOf(row)
      const seasonKey = repairSeasonKeyOf(row)
      if (!teamId || !seasonKey) return

      contextsByKey.set(repairContextKeyOf(row), {
        teamId,
        seasonKey,
        leagueId: clean(row?.leagueId),
        clubId: clean(row?.clubId),
      })
    }

    ;['current', 'history'].forEach(target => {
      (Array.isArray(playerDocument?.[target]) ? playerDocument[target] : [])
        .forEach(addContext)
    })

    addContext({
      birthTeamDocumentId: requestedTeamId || player.teamId,
      seasonKey: requestedSeasonKey || player.seasonKey,
      leagueId: player.leagueId,
      clubId: player.clubId,
    })

    const identities = new Set([
      ...playerIdentityValues(player),
      ...playerIdentityValues(playerDocument),
    ])

    const nextContexts = await Promise.all(
      [...contextsByKey.values()].map(async context => {
        const [teamDocument, teamSeason] = await Promise.all([
          getTeamById(context.teamId),
          getTeamSeason({
            birthTeamDocumentId: context.teamId,
            seasonKey: context.seasonKey,
          }),
        ])
        const teamPlayer = (teamSeason?.teamPlayers || []).find(row => (
          isSameRepairPlayer({ teamPlayer: row, identities })
        )) || null
        const indexPlayer = buildRepairIndexPlayer({
          playerDocument: playerDocument || {},
          teamDocument: teamDocument || {},
          teamSeason: teamSeason || {},
          teamPlayer: teamPlayer || {},
          context,
        })
        const playerSearchIndex = canReadPlayerSearchIndexExport(indexPlayer)
          ? await readPlayerSearchIndexExport({ player: indexPlayer })
          : null

        return {
          key: repairContextKeyOf(context),
          playerDocument: playerDocument || {},
          playerSearchIndex: playerSearchIndex || {},
          teamDocument: teamDocument || {},
          teamSeason: teamSeason || null,
          teamView: teamDocument || {},
          teamPlayer,
          selectedRow: context,
          context,
        }
      })
    )

    setContexts(nextContexts)
  }, [player, playerId, requestedSeasonKey, requestedTeamId])

  const handleOpen = React.useCallback(async () => {
    if (busy) return

    setOpen(true)
    setBusy(true)
    setError('')

    try {
      await loadSources()
    } catch (loadError) {
      setError(loadError?.message || 'טעינת נתוני השחקן לבדיקה נכשלה.')
    } finally {
      setBusy(false)
    }
  }, [busy, loadSources])

  const handleRepair = React.useCallback(async (issue, context) => {
    if (busy) return

    setBusy(true)
    setError('')

    try {
      await repairPlayerDataIssue({ issue, context })
      await loadSources()
      notify({ status: 'success', message: 'נתוני השחקן סונכרנו בהצלחה.' })
      reload()
    } catch (repairError) {
      setError(repairError?.message || 'תיקון נתוני השחקן נכשל.')
    } finally {
      setBusy(false)
    }
  }, [busy, loadSources, notify, reload])

  const handleTeamOpen = React.useCallback(context => {
    const teamSeason = context?.teamSeason || {}
    const teamId = repairTeamIdOf(teamSeason) || repairTeamIdOf(context?.teamDocument)
    const seasonKey = repairSeasonKeyOf(teamSeason)
    const leagueId = clean(teamSeason.leagueId || context?.selectedRow?.leagueId)

    if (!teamId || !seasonKey || !leagueId) {
      setError('חסרים פרטי קבוצה, ליגה או עונה למעבר לתיקון.')
      return
    }

    setOpen(false)
    navigate(PLAYERS_DATABASE_UI_ROUTES.team({ leagueId, teamId, seasonKey }))
  }, [navigate])

  const handleClose = React.useCallback(() => {
    if (busy) return
    setOpen(false)
    setError('')
  }, [busy])

  return {
    open,
    busy,
    error,
    contexts,
    openRepair: handleOpen,
    repair: handleRepair,
    openTeam: handleTeamOpen,
    close: handleClose,
  }
}
