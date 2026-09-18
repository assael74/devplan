import {
  buildTeamPlayerLineClassificationEvaluation,
  isTeamLineBalanceRelevantPlayer,
  isTeamPlayerKnownGoalkeeper,
} from '../../../../../../shared/scouting/teams/index.js'

import { TEAM_STRUCTURE_FILTER } from './teamStructureFilter.model.js'
import { clean, numberOrNull, withFallback } from './teamInformation.utils.js'

const getPlayerStats = player => (
  player?.playerStats && typeof player.playerStats === 'object'
    ? player.playerStats
    : player || {}
)

const LINE_CLASSIFICATION_REASON_LABELS = Object.freeze({
  known_goalkeeper: 'שוער מוחרג מהסיווג העונתי',
  insufficient_games: 'לא עומד בתנאי מספר המשחקים לסיווג',
  missing_goals: 'חסר נתון שערים',
  missing_minutes_context: 'חסרים נתוני דקות, משחקים או הרכב פותח',
  invalid_minutes_context: 'לא ניתן לחשב את הקשר הדקות האישי',
  below_minutes_threshold: 'לא עומד בתנאי הדקות לסיווג',
  no_classification: 'לא נמצא סיווג מתאים לפי מודל הסקאוט',
})

const buildPositionRuleLabel = ({ evaluation, classification }) => {
  if (evaluation?.reasonCode !== 'classified') {
    return LINE_CLASSIFICATION_REASON_LABELS[evaluation?.reasonCode] ||
      'אין סיווג זמין לפי מודל הסקאוט'
  }

  const line = clean(classification?.line)
  const position = clean(classification?.position)
  if (position === 'ATTACKING_MIDFIELDER') return 'סווג כקשר התקפי לפי מודל הסקאוט'
  if (position === 'FULLBACK') return 'סווג כמגן לפי מודל הסקאוט'
  if (line === 'ATTACK') return 'סווג להתקפה לפי מודל הסקאוט'
  if (line === 'MIDFIELD') return 'סווג לקישור לפי מודל הסקאוט'
  if (line === 'DEFENSE') return 'סווג להגנה לפי מודל הסקאוט'
  return 'סווג לפי מודל הסקאוט'
}

const MINUTES_BAND_LABELS = Object.freeze({
  high: 'גבוה',
  medium_high: 'בינוני־גבוה',
  medium: 'בינוני',
  low: 'נמוך',
})

const SUBSTITUTION_BAND_LABELS = Object.freeze({
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
})

const resolveMinutesBand = value => MINUTES_BAND_LABELS[clean(value)] || 'לא זמין'
const resolveSubstitutionBand = value => SUBSTITUTION_BAND_LABELS[clean(value)] || 'לא זמין'

const LINE_SORT_ORDER = Object.freeze({
  DEFENSE: 0,
  MIDFIELD: 1,
  ATTACK: 2,
})

const resolveStructureFilterKeys = ({ player, classification, isGoalkeeper, evaluation }) => {
  const allSquad = [TEAM_STRUCTURE_FILTER.ALL_SQUAD]

  if (!isTeamLineBalanceRelevantPlayer(player) || clean(player?.statsStatus) !== 'loaded') return allSquad

  const line = clean(classification?.line)
  if (isGoalkeeper) {
    return [...allSquad, TEAM_STRUCTURE_FILTER.GOALKEEPER, TEAM_STRUCTURE_FILTER.CLASSIFIED]
  }
  if (line) {
    const lineFilter = {
      DEFENSE: TEAM_STRUCTURE_FILTER.DEFENSE,
      MIDFIELD: TEAM_STRUCTURE_FILTER.MIDFIELD,
      ATTACK: TEAM_STRUCTURE_FILTER.ATTACK,
    }[line]

    return [...allSquad, TEAM_STRUCTURE_FILTER.CLASSIFIED, lineFilter].filter(Boolean)
  }

  return [...allSquad, evaluation?.eligible
    ? TEAM_STRUCTURE_FILTER.UNCLASSIFIED_SUFFICIENT_SAMPLE
    : TEAM_STRUCTURE_FILTER.INSUFFICIENT_SAMPLE]
}

const resolveSquadClassificationStatus = ({
  player,
  classification,
  isGoalkeeper,
  evaluation,
}) => {
  if (!isTeamLineBalanceRelevantPlayer(player) || clean(player?.statsStatus) !== 'loaded') {
    return 'irrelevant'
  }

  return isGoalkeeper || clean(classification?.line)
    ? 'classified'
    : evaluation?.eligible
      ? 'unclassifiedSufficientSample'
      : 'insufficientSample'
}

const getPlayerIdentityKeys = player => [
  player?.playerId,
  player?.playerDocumentId,
  player?.externalPlayerId,
  player?.id,
].map(clean).filter(Boolean)

const buildScoutProfileLookup = players => {
  const lookup = new Map()

  ;(Array.isArray(players) ? players : []).forEach(player => {
    getPlayerIdentityKeys(player).forEach(key => lookup.set(key, player))
  })

  return lookup
}

const attachScoutProfilePresentation = ({ player, scoutProfileLookup }) => {
  const presentationPlayer = getPlayerIdentityKeys(player)
    .map(key => scoutProfileLookup.get(key))
    .find(Boolean)

  if (!presentationPlayer) return player

  return {
    ...player,
    scoutProfiles: presentationPlayer.scoutProfiles,
    scoutCombinations: presentationPlayer.scoutCombinations,
    scoutCandidateSignals: presentationPlayer.scoutCandidateSignals,
    scoutProfileDisplay: presentationPlayer.scoutProfileDisplay,
    scoutPlayerInterestLevel: presentationPlayer.scoutPlayerInterestLevel,
    profile: presentationPlayer.profile,
  }
}

export const buildPositionClassificationRows = ({
  seasonDoc,
  players = [],
  playerIdsFilter = null,
}) => {
  const teamPlayers = Array.isArray(seasonDoc?.teamPlayers) ? seasonDoc.teamPlayers : []
  const scoutProfileLookup = buildScoutProfileLookup(players)
  const allowedPlayerIds = Array.isArray(playerIdsFilter)
    ? new Set(playerIdsFilter.map(clean).filter(Boolean))
    : null

  return teamPlayers
    .filter(player => (
      !allowedPlayerIds || getPlayerIdentityKeys(player).some(id => allowedPlayerIds.has(id))
    ))
    .map((player, index) => {
      const playerWithScoutProfile = attachScoutProfilePresentation({
        player,
        scoutProfileLookup,
      })
      const stats = getPlayerStats(player)
      const minutes = numberOrNull(stats.minutes)
      const teamMinutes = numberOrNull(stats.teamMinutes)
      const games = numberOrNull(stats.games)
      const teamGames = numberOrNull(stats.teamGames)
      const starts = numberOrNull(stats.starts)
      const substitutedOut = numberOrNull(stats.substitutedOut)
      const evaluation = buildTeamPlayerLineClassificationEvaluation({ player })
      const gameMinutes = numberOrNull(evaluation.gameMinutes)
      const possiblePlayerMinutes = numberOrNull(evaluation.possiblePlayerMinutes)
      // Presentation of personal usage must not depend on whether the player
      // passed every line-classification gate. It is derived from the same
      // displayed player and team context.
      const minutesRate = (
        minutes !== null && games !== null && games > 0 &&
        teamMinutes !== null && teamMinutes > 0 &&
        teamGames !== null && teamGames > 0
          ? Math.round((minutes / (games * (teamMinutes / teamGames))) * 100)
          : null
      )
      // Substitution rate is independent of the minutes context used for
      // line classification. Keeping it local prevents a missing team-minute
      // value from turning a known substitution count into an apparent 0%.
      const substitutionRate = (
        starts !== null && starts > 0 && substitutedOut !== null
          ? Math.round((substitutedOut / starts) * 100)
          : null
      )
      const primaryPosition = clean(player?.primaryPosition).toUpperCase()
      const positionLayer = clean(player?.positionLayer).toLowerCase()
      const classification = player?.lineClassification || evaluation.classification || null
      const isGoalkeeper = isTeamPlayerKnownGoalkeeper({ player })

      return {
        id: clean(player?.playerId || player?.playerDocumentId || player?.id || index),
        sourceIndex: clean(player?.index || player?.statsIndex),
        player: playerWithScoutProfile,
        name: clean(player?.fullName || player?.name || player?.playerName) || 'שחקן ללא שם',
        playerUrl: clean(player?.playerUrl),
        rosterStatus: clean(player?.rosterStatus),
        games,
        goals: numberOrNull(stats.goals),
        yellowCards: numberOrNull(stats.yellowCards),
        toto: numberOrNull(stats.toto),
        redCards: numberOrNull(stats.redCards),
        minutes,
        teamMinutes,
        teamGames,
        gameMinutes,
        possiblePlayerMinutes,
        minutesRate,
        minutesBand: resolveMinutesBand(evaluation.minutesBand),
        starts,
        substituteIn: numberOrNull(stats.substituteIn),
        substitutedOut,
        substitutionRate,
        substitutionBand: resolveSubstitutionBand(evaluation.substitutionBand),
        primaryPosition,
        positionLayer,
        isGoalkeeper,
        squadClassificationStatus: resolveSquadClassificationStatus({
          player,
          classification,
          isGoalkeeper,
          evaluation,
        }),
        classification,
        structureFilterKeys: resolveStructureFilterKeys({
          player,
          classification,
          isGoalkeeper,
          evaluation,
        }),
        rule: buildPositionRuleLabel({ evaluation, classification }),
      }
    })
    .sort((left, right) => {
      const leftOrder = left.isGoalkeeper
        ? 0
        : withFallback(LINE_SORT_ORDER[clean(left.classification?.line)], 3) + 1
      const rightOrder = right.isGoalkeeper
        ? 0
        : withFallback(LINE_SORT_ORDER[clean(right.classification?.line)], 3) + 1

      return leftOrder - rightOrder || left.name.localeCompare(right.name, 'he')
    })
}
