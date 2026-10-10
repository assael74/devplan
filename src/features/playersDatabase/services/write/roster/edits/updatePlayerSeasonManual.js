// src/features/playersDatabase/services/write/roster/edits/updatePlayerSeasonManual.js

import {
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
} from '../../../../domain/identity/index.js'
import { clean, equal, requireValue, urlValue } from '../../../../domain/edits/editIdentity.js'
import {
  executeManualEdit,
  manualEditRef,
  requireManualEditDocument,
} from '../../shared/manualEdit.write.js'

const requireIdentity = ({ playerId, teamId, teamSeasonDocumentId, seasonId }) => ({
  playerId: requireValue(clean(playerId), 'מזהה שחקן חסר'),
  teamId: requireValue(clean(teamId), 'מזהה קבוצה חסר'),
  teamSeasonDocumentId: requireValue(
    clean(teamSeasonDocumentId),
    'מזהה עונת קבוצה חסר',
  ),
  seasonId: requireValue(clean(seasonId), 'מזהה עונה טכני חסר'),
})

const buildTargets = identity => ({
  teamSeasonRef: manualEditRef('teamSeasons', identity.teamSeasonDocumentId),
  playerSeasonRef: manualEditRef('playerSeasons', buildPlayerSeasonDocumentId(identity)),
  searchIndexRef: manualEditRef(
    'playerSearchIndexes',
    buildPlayerSearchIndexDocumentId(identity),
  ),
})

const assertDocuments = ({ get, identity, targets }) => {
  const teamSeason = requireManualEditDocument(get(targets.teamSeasonRef))
  const playerSeason = requireManualEditDocument(get(targets.playerSeasonRef))
  const searchIndex = requireManualEditDocument(get(targets.searchIndexRef))
  requireValue(
    clean(teamSeason.identity?.teamSeasonDocumentId) === identity.teamSeasonDocumentId &&
      clean(teamSeason.identity?.teamId) === identity.teamId &&
      clean(teamSeason.identity?.seasonId) === identity.seasonId,
    'זהות עונת הקבוצה סותרת',
  )
  requireValue(
    clean(playerSeason.identity?.playerId) === identity.playerId &&
      clean(playerSeason.identity?.seasonId) === identity.seasonId,
    'זהות עונת השחקן סותרת',
  )
  requireValue(
    clean(searchIndex.playerId) === identity.playerId &&
      clean(searchIndex.seasonId) === identity.seasonId &&
      clean(searchIndex.references?.teamSeasonDocumentId) === identity.teamSeasonDocumentId,
    'זהות תוצר החיפוש סותרת',
  )
  requireValue(
    Boolean(teamSeason.roster?.playersById?.[identity.playerId]),
    'השחקן חסר בסגל עונת הקבוצה',
  )
  requireValue(
    Boolean(playerSeason.teamsById?.[identity.teamId]),
    'הקבוצה חסרה בעונת השחקן',
  )
  return { teamSeason, playerSeason, searchIndex }
}

export const updatePlayerSeasonUrl = input => {
  const identity = requireIdentity(input)
  const playerUrl = urlValue(input.playerUrl)
  const targets = buildTargets(identity)

  return executeManualEdit({
    refs: Object.values(targets),
    build: ({ get, updatedAt }) => {
      const { teamSeason, playerSeason, searchIndex } = assertDocuments({
        get,
        identity,
        targets,
      })
      const teamManual = teamSeason.manual || {}
      const teamPlayerManual = teamManual.playersById?.[identity.playerId] || {}
      const playerTeam = playerSeason.teamsById[identity.teamId]
      const changes = []
      if (clean(teamPlayerManual.playerUrl) !== playerUrl) {
        changes.push({
          ref: targets.teamSeasonRef,
          patch: {
            manual: {
              ...teamManual,
              playersById: {
                ...(teamManual.playersById || {}),
                [identity.playerId]: { ...teamPlayerManual, playerUrl, updatedAt },
              },
              updatedAt,
            },
          },
        })
      }
      if (clean(playerTeam.manual?.playerUrl) !== playerUrl) {
        changes.push({
          ref: targets.playerSeasonRef,
          patch: {
            teamsById: {
              ...playerSeason.teamsById,
              [identity.teamId]: {
                ...playerTeam,
                manual: { ...(playerTeam.manual || {}), playerUrl },
                updatedAt,
              },
            },
          },
        })
      }
      if (clean(searchIndex.player?.playerUrl) !== playerUrl) {
        changes.push({
          ref: targets.searchIndexRef,
          patch: { player: { ...(searchIndex.player || {}), playerUrl } },
        })
      }
      return changes
    },
  })
}

const toNonNegativeInteger = value => {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null
}

export const updatePlayerSeasonGoalDistribution = input => {
  const identity = requireIdentity(input)
  const scoringGames = toNonNegativeInteger(input.scoringGames)
  const targets = buildTargets(identity)

  return executeManualEdit({
    refs: Object.values(targets),
    build: ({ get, updatedAt }) => {
      const { teamSeason, playerSeason } = assertDocuments({ get, identity, targets })
      const playerStats = teamSeason.stats?.playersById?.[identity.playerId]?.playerStats || {}
      const games = toNonNegativeInteger(playerStats.games) || 0
      const goals = toNonNegativeInteger(playerStats.goals) || 0
      requireValue(scoringGames === null || scoringGames <= games, 'מספר משחקי ההבקעה אינו יכול לעלות על מספר ההופעות')
      requireValue(scoringGames === null || scoringGames <= goals, 'מספר משחקי ההבקעה אינו יכול לעלות על מספר השערים')
      const goalDistribution = {
        scoringGames,
        distributionPct: scoringGames === null || !games
          ? null
          : Math.round((scoringGames / games) * 100),
        updatedAt,
      }
      const teamManual = teamSeason.manual || {}
      const teamPlayerManual = teamManual.playersById?.[identity.playerId] || {}
      const playerTeam = playerSeason.teamsById[identity.teamId]
      const current = teamPlayerManual.goalDistribution || {}
      const canonicalMatches = equal(
        { scoringGames: current.scoringGames, distributionPct: current.distributionPct },
        { scoringGames: goalDistribution.scoringGames, distributionPct: goalDistribution.distributionPct },
      )
      const projected = playerTeam.manual?.goalDistribution || {}
      const projectionMatches = equal(
        { scoringGames: projected.scoringGames, distributionPct: projected.distributionPct },
        { scoringGames: goalDistribution.scoringGames, distributionPct: goalDistribution.distributionPct },
      )
      const changes = []
      if (!canonicalMatches) changes.push({
          ref: targets.teamSeasonRef,
          patch: {
            manual: {
              ...teamManual,
              playersById: {
                ...(teamManual.playersById || {}),
                [identity.playerId]: {
                  ...teamPlayerManual,
                  goalDistribution,
                  updatedAt,
                },
              },
              updatedAt,
            },
          },
        })
      if (!projectionMatches) changes.push({
          ref: targets.playerSeasonRef,
          patch: {
            teamsById: {
              ...playerSeason.teamsById,
              [identity.teamId]: {
                ...playerTeam,
                manual: { ...(playerTeam.manual || {}), goalDistribution },
                updatedAt,
              },
            },
          },
        })
      return changes
    },
  })
}
