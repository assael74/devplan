import { adaptPlayerScoutEngineResult } from '../../../domain/index.js'
import { buildDbPlayerScoutResult } from '../../../domain/orchestration/buildDbPlayerScoutResult.js'
import { buildPlayerScoutCalculationContract } from '../../../domain/contracts/playerScoutInput.contract.js'
import { normalizePlayerStats } from '../../../model/playerStats.model.js'
import { clean } from '../leagues/leagueDoc.js'
import { isProfessionalScoutProfile } from '../../../../../shared/scouting/players/profiles.js'

const toNullableNumber = value => (
  Number.isFinite(Number(value))
    ? Number(value)
    : null
)

const uniqueCleanValues = values => [
  ...new Set((Array.isArray(values) ? values : []).map(clean).filter(Boolean)),
]

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
      primaryProfile?.profileStrength?.depthPct ??
      (hasRichScoutState ? null : player.primaryScoutProfileStrengthDepthPct)
    ),
    ...compactProfileIds,
    scoutEffectiveImmediacyStatus: clean(opportunity?.effectiveActionStatus),
    scoutPlayerInterestLevel: clean(player?.scoutPlayerInterest?.interestLevel),
    scoutEngineVersion: clean(player?.scoutEngineVersion) || 'scouting-v2',
  }
}

export const buildTeamPlayerSeasonalScoutProjection = ({
  player = {},
  team = {},
  season = {},
} = {}) => {
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
