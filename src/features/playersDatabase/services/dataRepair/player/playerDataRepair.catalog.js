import { syncPlayerRoleAndScoutProfileDoc } from '../../write/players/index.js'
import { updatePlayerSeasonSearchIndexFields } from '../../write/searchIndex/index.js'
import { buildTeamPlayerSeasonalScoutProjection } from '../../../domain/projections/playerScout.projection.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

export const PLAYER_DATA_ISSUE_CODE = Object.freeze({
  PLAYER_DOCUMENT_SCOUT_PROFILE_MISMATCH: 'player_document_scout_profile_mismatch',
  PLAYER_SEARCH_INDEX_SCOUT_PROFILE_MISMATCH: 'player_search_index_scout_profile_mismatch',
  TEAM_SEASON_SCOUT_PROFILE_MISMATCH: 'team_season_scout_profile_mismatch',
})

const playerIds = player => new Set([
  player?.playerDocumentId, player?.playerId, player?.externalPlayerId, player?.id,
].map(value => clean(value).replace(/^external__/, '')).filter(Boolean))

const samePlayer = (left, right) => [...playerIds(right)].some(id => playerIds(left).has(id))
const profileId = value => clean(value && typeof value === 'object' ? value.profileId || value.id || value.profile?.id : value)

export const profilesOf = player => [...new Set([
  ...(Array.isArray(player?.professionalScoutProfileIds) ? player.professionalScoutProfileIds : []),
  ...(Array.isArray(player?.preliminaryScoutProfileIds) ? player.preliminaryScoutProfileIds : []),
  ...(Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : []),
  ...(Array.isArray(player?.scoutProfileIds) ? player.scoutProfileIds : []),
  ...(Array.isArray(player?.scoutProfileSearchIds) ? player.scoutProfileSearchIds : []),
  ...(Array.isArray(player?.scout?.profiles) ? player.scout.profiles : []),
  player?.primaryScoutProfileId,
].map(profileId).filter(Boolean))].sort()

const sameProfiles = (left, right) => JSON.stringify(profilesOf(left)) === JSON.stringify(profilesOf(right))
const profileIds = value => [...new Set((Array.isArray(value) ? value : []).map(profileId).filter(Boolean))].sort()

const hasSamePlayerSearchIndexScoutProjection = (teamPlayer = {}, playerSearchIndex = {}) => (
  JSON.stringify(profileIds(teamPlayer.professionalScoutProfileIds)) ===
    JSON.stringify(profileIds(playerSearchIndex.scoutProfileIds)) &&
  JSON.stringify(profileIds(teamPlayer.preliminaryScoutProfileIds)) ===
    JSON.stringify(profileIds(playerSearchIndex.scoutPreliminaryProfileIds)) &&
  clean(teamPlayer.primaryScoutProfileId) === clean(playerSearchIndex.primaryScoutProfileId)
)

const buildPlayerSearchIndexScoutProjection = ({ teamPlayer = {}, playerSearchIndex = {} } = {}) => {
  const scoutProfileIds = profileIds(teamPlayer.professionalScoutProfileIds)
  const scoutPreliminaryProfileIds = profileIds(teamPlayer.preliminaryScoutProfileIds)
  const scoutCombinationIds = profileIds(playerSearchIndex.scoutCombinationIds)

  return {
    primaryScoutProfileId: clean(teamPlayer.primaryScoutProfileId),
    primaryScoutProfileStrengthDepthPct: teamPlayer.primaryScoutProfileStrengthDepthPct === undefined || teamPlayer.primaryScoutProfileStrengthDepthPct === null
      ? null
      : teamPlayer.primaryScoutProfileStrengthDepthPct,
    scoutProfileIds,
    scoutPreliminaryProfileIds,
    scoutProfileSearchIds: profileIds([...scoutProfileIds, ...scoutCombinationIds]),
    scoutEffectiveImmediacyStatus: clean(teamPlayer.scoutEffectiveImmediacyStatus),
    scoutPlayerInterestLevel: clean(teamPlayer.scoutPlayerInterestLevel),
    scoutEngineVersion: clean(teamPlayer.scoutEngineVersion),
  }
}

const scopesOf = context => {
  const teamSeason = context?.teamSeason || {}
  const team = { ...(context?.teamDocument || {}), ...teamSeason, ...(context?.teamView || {}) }
  const season = {
    seasonId: clean(teamSeason.seasonId || teamSeason.seasonKey),
    seasonKey: clean(teamSeason.seasonKey || teamSeason.seasonId),
    seasonStatus: clean(teamSeason.seasonStatus) || 'active',
    leagueId: clean(teamSeason.leagueId || context?.selectedRow?.leagueId),
  }
  return { teamSeason, team, season, target: season.seasonStatus === 'completed' ? 'history' : 'current' }
}

const findPlayerSeasonRow = ({ playerDocument = {}, teamPlayer = {}, seasonKey = '', teamId = '' } = {}) => (
  [
    ...(Array.isArray(playerDocument?.current) ? playerDocument.current : []),
    ...(Array.isArray(playerDocument?.history) ? playerDocument.history : []),
  ].find(row => {
    const rowHasPlayerIdentity = playerIds(row).size > 0
    return (!rowHasPlayerIdentity || samePlayer(row, teamPlayer)) &&
      clean(row?.seasonKey || row?.seasonId) === clean(seasonKey) &&
      (!clean(teamId) || clean(row?.birthTeamDocumentId || row?.teamDocumentId || row?.teamId) === clean(teamId))
  }) || null
)

export const hasPlayerDocumentProfileMismatch = (context = {}) => {
  const { teamSeason, team } = scopesOf(context)
  const playerRow = findPlayerSeasonRow({
    playerDocument: context.playerDocument,
    teamPlayer: context.teamPlayer,
    seasonKey: teamSeason.seasonKey || teamSeason.seasonId,
    teamId: team.birthTeamDocumentId || team.teamDocumentId || team.teamId,
  })
  return Boolean(profilesOf(context.teamPlayer).length && !sameProfiles(context.teamPlayer, playerRow))
}

export const hasPlayerSearchIndexProfileMismatch = (context = {}) => Boolean(
  context.teamPlayer && context.playerSearchIndex &&
  !hasSamePlayerSearchIndexScoutProjection(context.teamPlayer, context.playerSearchIndex)
)

export const hasTeamSeasonProfileMismatch = (context = {}) => {
  const { team, season } = scopesOf(context)
  if (!context.teamPlayer || !season.seasonId) return false
  const calculated = buildTeamPlayerSeasonalScoutProjection({ player: context.teamPlayer, team, season })
  return !sameProfiles(context.teamPlayer, calculated)
}

const hasRequiredContext = context => Boolean(
  context?.teamSeason?.id && context?.teamPlayer &&
  clean(context?.teamSeason?.seasonKey || context?.teamSeason?.seasonId) &&
  clean(context?.teamSeason?.birthTeamDocumentId || context?.teamSeason?.teamDocumentId || context?.teamSeason?.teamId)
)

const repairPlayerDocument = ({ context = {} } = {}) => {
  const { teamSeason, team, season, target } = scopesOf(context)
  return syncPlayerRoleAndScoutProfileDoc({ season, team, target, player: context.teamPlayer, teamSeasonDocument: teamSeason })
}

const repairPlayerSearchIndex = async ({ context = {} } = {}) => {
  const { team, season } = scopesOf(context)
  const result = await updatePlayerSeasonSearchIndexFields({
    league: { id: season.leagueId, level: team.leagueLevel || 0 },
    season,
    team,
    player: context.teamPlayer,
    fields: buildPlayerSearchIndexScoutProjection({
      teamPlayer: context.teamPlayer,
      playerSearchIndex: context.playerSearchIndex,
    }),
  })
  if (!result.updated) throw new Error('לא נמצא אינדקס שחקן תואם לתיקון')
  return result
}

const REPAIR_CATALOG = Object.freeze({
  [PLAYER_DATA_ISSUE_CODE.PLAYER_DOCUMENT_SCOUT_PROFILE_MISMATCH]: {
    label: 'תיקון מסמך השחקן',
    canRepair: context => Boolean(context?.playerDocument?.id && hasRequiredContext(context) && hasPlayerDocumentProfileMismatch(context)),
    repair: repairPlayerDocument,
  },
  [PLAYER_DATA_ISSUE_CODE.PLAYER_SEARCH_INDEX_SCOUT_PROFILE_MISMATCH]: {
    label: 'תיקון אינדקס השחקן',
    canRepair: context => Boolean(hasRequiredContext(context) && context?.playerSearchIndex && hasPlayerSearchIndexProfileMismatch(context)),
    repair: repairPlayerSearchIndex,
  },
})

export const getPlayerDataRepair = issue => REPAIR_CATALOG[issue?.code] || null
export const canRepairPlayerDataIssue = ({ issue, context } = {}) => Boolean(getPlayerDataRepair(issue)?.canRepair?.(context))
export const getPlayerDataRepairLabel = issue => getPlayerDataRepair(issue)?.label || ''

export async function repairPlayerDataIssue({ issue, context } = {}) {
  const repair = getPlayerDataRepair(issue)
  if (!repair?.canRepair?.(context)) throw new Error('לתקלה זו אין תיקון אוטומטי בטוח')
  return repair.repair({ issue, context })
}
