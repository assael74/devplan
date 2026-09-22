import { cleanValue as clean, pickDefinedValue } from '../../model/shared/value.model.js'
import { SCOUTING_MODEL_VERSION } from '../../../../shared/scouting/scouting.version.js'
import { adaptPlayerScoutEngineResult } from '../index.js'
import { buildDbPlayerScoutResult } from '../orchestration/buildDbPlayerScoutResult.js'
import { buildPlayerScoutCalculationContract } from '../contracts/playerScoutInput.contract.js'
import { normalizePlayerStats } from '../../model/player/playerStats.model.js'
import { isProfessionalScoutProfile } from '../../../../shared/scouting/players/profiles.js'
import { isCurrentRosterPlayer } from '../../model/team/rosterStatus.model.js'

const toNullableNumber = value => (
  Number.isFinite(Number(value))
    ? Number(value)
    : null
)

const uniqueCleanValues = values => [
  ...new Set((Array.isArray(values) ? values : []).map(clean).filter(Boolean)),
]

// The player engine needs the same team facts in every caller: persistence,
// background projection, and audit. Keeping this small enrichment here avoids
// an audit calculation that silently loses team performance context.
export const buildTeamPlayerScoutContext = ({ player = {}, teamContext = {} } = {}) => ({
  ...player,
  playerStats: {
    ...(player.playerStats || {}),
    teamGames: Number(teamContext.teamGamePlayed) || 0,
    teamRank: teamContext.tableRank === null || teamContext.tableRank === undefined
      ? null
      : Number(teamContext.tableRank),
    teamGoalsFor: Number(teamContext.goalsFor) || 0,
    teamGoalsAgainst: Number(teamContext.goalsAgainst) || 0,
    teamAttackPerformance: teamContext.offense || null,
    teamDefensePerformance: teamContext.defense || null,
  },
})

const resolveCompactScoutProfileIds = ({ scout = {}, player = {} } = {}) => {
  const hierarchy = scout.profileHierarchy && typeof scout.profileHierarchy === 'object'
    ? scout.profileHierarchy
    : {}
  const professionalScoutProfileIds = uniqueCleanValues(
    Array.isArray(hierarchy.professionalProfileIds)
      ? hierarchy.professionalProfileIds
      : player.professionalScoutProfileIds
  ).filter(isProfessionalScoutProfile)
  const preliminaryScoutProfileIds = uniqueCleanValues(
    Array.isArray(scout.preliminaryProfileIds)
      ? scout.preliminaryProfileIds
      : Array.isArray(hierarchy.preliminaryProfileIds)
        ? hierarchy.preliminaryProfileIds
        : player.preliminaryScoutProfileIds
  )

  return {
    professionalScoutProfileIds,
    preliminaryScoutProfileIds,
  }
}

export const buildTeamPlayerScoutProjection = (player = {}) => {
  const opportunity = player?.scoutOpportunity || null
  const profilesRemoved = opportunity?.profilesRemoved === true
  const hasRichScoutState = (
    Array.isArray(player?.scoutSignals) ||
    Array.isArray(player?.scoutProfiles) ||
    Boolean(player?.scoutProfileHierarchy)
  )
  const scout = adaptPlayerScoutEngineResult({
    signals: profilesRemoved
      ? []
      : Array.isArray(player?.scoutSignals)
        ? player.scoutSignals
        : Array.isArray(player?.scoutProfiles)
          ? player.scoutProfiles
          : [],
    profileHierarchy: profilesRemoved
      ? null
      : player?.scoutProfileHierarchy || null,
    opportunity,
  })
  const primaryProfile = scout.primaryProfile
  const compactProfileIds = resolveCompactScoutProfileIds({ scout, player })

  return {
    primaryScoutProfileId: clean(
      primaryProfile?.id ||
      primaryProfile?.profileId ||
      (hasRichScoutState ? '' : player.primaryScoutProfileId)
    ),
    primaryScoutProfileStrengthDepthPct: toNullableNumber(
      pickDefinedValue(
        primaryProfile?.profileStrength?.depthPct,
        hasRichScoutState ? null : player.primaryScoutProfileStrengthDepthPct
      )
    ),
    ...compactProfileIds,
    scoutEffectiveImmediacyStatus: clean(opportunity?.effectiveActionStatus),
    scoutPlayerInterestLevel: clean(player?.scoutPlayerInterest?.interestLevel),
    scoutEngineVersion: clean(player?.scoutEngineVersion) || SCOUTING_MODEL_VERSION,
  }
}

export const buildTeamPlayerSeasonalScoutProjection = ({
  player = {},
  team = {},
  season = {},
} = {}) => {
  if (!isCurrentRosterPlayer(player)) {
    return {
      primaryScoutProfileId: '',
      primaryScoutProfileStrengthDepthPct: null,
      professionalScoutProfileIds: [],
      preliminaryScoutProfileIds: [],
    }
  }

  // Team persistence owns only the compact projection, but it must enter the
  // engine through the same canonical input contract as the stats preview and
  // Player Document calculation.
  const playerStats = normalizePlayerStats(player)
  const contract = buildPlayerScoutCalculationContract({
    player: {
      ...player,
      primaryPosition: player.primaryPosition || '',
      position: player.primaryPosition || player.position || '',
      positionLayer: player.positionLayer || '',
      numShirt: player.numShirt || '',
      games: playerStats.games,
      goals: playerStats.goals,
      yellowCards: playerStats.yellowCards,
      minutes: playerStats.minutes,
      starts: playerStats.starts,
      subIn: playerStats.substituteIn,
      subOut: playerStats.substitutedOut,
      playerStats,
    },
    team,
    season,
  })
  const result = buildDbPlayerScoutResult({
    player: contract.player,
    team: contract.team,
    season: contract.season,
    perspective: 'players_database_team_context_projection',
  })
  const scout = adaptPlayerScoutEngineResult({
    signals: result?.signals,
    profileHierarchy: result?.profileHierarchy,
  })
  const primaryProfile = scout.primaryProfile
  const compactProfileIds = resolveCompactScoutProfileIds({ scout, player })

  return {
    primaryScoutProfileId: clean(primaryProfile?.id || primaryProfile?.profileId),
    primaryScoutProfileStrengthDepthPct: toNullableNumber(
      primaryProfile?.profileStrength?.depthPct
    ),
    ...compactProfileIds,
  }
}
