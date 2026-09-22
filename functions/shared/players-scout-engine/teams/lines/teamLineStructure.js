// src/shared/scouting/teams/lines/teamLineStructure.js

import { TEAM_LINE_STRUCTURE_THRESHOLDS } from '../../config/lineStructureThresholds.js'
import { TEAM_PLAYER_LINE, TEAM_PLAYER_POSITION } from './teamLineClassification.model.js'
import { isTeamLineBalanceRelevantPlayer } from './teamLineBalancePlayerScope.js'
import {
  isTeamPlayerKnownGoalkeeper,
  isTeamPlayerLineClassificationEligible,
} from './teamLineClassification.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const isLoadedPlayer = player => clean(player?.statsStatus) === 'loaded'

const hasLineClassification = player => Boolean(clean(player?.lineClassification?.line))

const getPlayerGames = player => {
  const rawGames = player?.playerStats?.games
  if (rawGames === null || rawGames === undefined || rawGames === '') return null

  const games = Number(rawGames)
  return Number.isFinite(games) && games >= 0 ? games : null
}

const isClassifiedPlayer = player => (
  isTeamPlayerKnownGoalkeeper({ player }) || hasLineClassification(player)
)

const isSufficientSampleUnclassifiedPlayer = player => (
  isTeamLineBalanceRelevantPlayer(player) &&
  isLoadedPlayer(player) &&
  !isClassifiedPlayer(player) &&
  (getPlayerGames(player) || 0) >= TEAM_LINE_STRUCTURE_THRESHOLDS.MINIMUM_GAMES
)

const isInsufficientSamplePlayer = player => (
  isTeamLineBalanceRelevantPlayer(player) &&
  isLoadedPlayer(player) &&
  !isClassifiedPlayer(player) &&
  (getPlayerGames(player) || 0) < TEAM_LINE_STRUCTURE_THRESHOLDS.MINIMUM_GAMES
)

// Derived facts only. This builder deliberately does not compare the squad to
// a reference and does not decide shortage, overload, need or opportunity.
export const buildTeamLineStructure = ({ players = [] } = {}) => {
  const sourcePlayers = Array.isArray(players) ? players : []
  const operationalPlayers = sourcePlayers.filter(isTeamLineBalanceRelevantPlayer)
  const loadedRelevantPlayers = operationalPlayers.filter(isLoadedPlayer)
  const classificationEligiblePlayers = sourcePlayers.filter(player => (
    isTeamLineBalanceRelevantPlayer(player) &&
    isLoadedPlayer(player) &&
    isTeamPlayerLineClassificationEligible({ player })
  ))
  const classifiedPlayers = sourcePlayers.filter(player => (
    isTeamLineBalanceRelevantPlayer(player) &&
    isLoadedPlayer(player) &&
    isClassifiedPlayer(player)
  ))
  const goalkeeperPlayers = classifiedPlayers.filter(player => (
    isTeamPlayerKnownGoalkeeper({ player })
  ))

  const counts = classificationEligiblePlayers.reduce((result, player) => {
    const line = clean(player?.lineClassification?.line)
    const position = clean(player?.lineClassification?.position)

    if (line === TEAM_PLAYER_LINE.DEFENSE) result.defense += 1
    if (line === TEAM_PLAYER_LINE.MIDFIELD) {
      result.midfield += 1
      if (position === TEAM_PLAYER_POSITION.ATTACKING_MIDFIELDER) {
        result.attackingMidfielder += 1
      }
    }
    if (line === TEAM_PLAYER_LINE.ATTACK) result.attack += 1
    if (position === TEAM_PLAYER_POSITION.FULLBACK) result.fullback += 1

    return result
  }, {
    defense: 0,
    midfield: 0,
    attack: 0,
    fullback: 0,
    attackingMidfielder: 0,
  })

  return {
    minimumGames: TEAM_LINE_STRUCTURE_THRESHOLDS.MINIMUM_GAMES,
    relevantPlayersCount: operationalPlayers.length,
    loadedRelevantPlayersCount: loadedRelevantPlayers.length,
    goalkeeperPlayersCount: goalkeeperPlayers.length,
    eligiblePlayersCount: classificationEligiblePlayers.length,
    classifiedPlayersCount: classifiedPlayers.length,
    unclassifiedSufficientSamplePlayersCount: sourcePlayers
      .filter(isSufficientSampleUnclassifiedPlayer)
      .length,
    insufficientSamplePlayersCount: sourcePlayers
      .filter(isInsufficientSamplePlayer)
      .length,
    positions: {
      fullback: {
        playersCount: counts.fullback,
      },
      attackingMidfielder: {
        playersCount: counts.attackingMidfielder,
      },
    },
    lines: {
      defense: {
        playersCount: counts.defense,
      },
      midfield: {
        playersCount: counts.midfield,
      },
      attack: {
        playersCount: counts.attack,
      },
    },
    composition: {
      midfieldCorePlayersCount: Math.max(0, counts.midfield - counts.attackingMidfielder),
    },
  }
}
