import {
  repairTeamRootDisplayName,
  repairTeamSearchIndexSeasonStatus,
  repairTeamSeasonStatsFromLeague,
} from './teamDataRepair.write.js'
import { updateTeamSeasonPlayerSeasonalScoutProjection } from '../../write/teams/index.js'
import { buildTeamPlayerSeasonalScoutProjection } from '../../../domain/projections/playerScout.projection.js'
import { invalidateTeamDocumentCache } from '../../cache/index.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const playerKeyOf = player => clean(
  player?.playerDocumentId || player?.playerId || player?.externalPlayerId || player?.id
).replace(/^external__/, '')
const profilesOf = player => [...new Set([
  ...(Array.isArray(player?.professionalScoutProfileIds) ? player.professionalScoutProfileIds : []),
  ...(Array.isArray(player?.preliminaryScoutProfileIds) ? player.preliminaryScoutProfileIds : []),
  ...(Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : []),
  ...(Array.isArray(player?.scoutProfileIds) ? player.scoutProfileIds : []),
  player?.primaryScoutProfileId,
].map(value => clean(value && typeof value === 'object' ? value.profileId || value.id : value)).filter(Boolean))].sort()
const sameProfiles = (left, right) => (
  JSON.stringify(profilesOf(left)) === JSON.stringify(profilesOf(right))
)
const seasonKeyOf = season => clean(season?.seasonKey || season?.seasonId)
const teamIdOf = team => clean(
  team?.birthTeamDocumentId || team?.teamDocumentId || team?.birthTeamId || team?.teamId || team?.id
)

const findTeamSeasonPlayer = ({ context = {}, issue = {} } = {}) => {
  const season = (Array.isArray(context.teamSeasons) ? context.teamSeasons : []).find(item => (
    seasonKeyOf(item) === clean(issue.seasonKey)
  ))
  const player = (Array.isArray(season?.teamPlayers) ? season.teamPlayers : []).find(item => (
    playerKeyOf(item) === clean(issue.playerKey)
  ))
  return { season, player }
}

const repairTeamSeasonPlayerScoutProfile = async ({ issue = {}, teamDocument = {}, teamSeasons = [] } = {}) => {
  const { season, player } = findTeamSeasonPlayer({ context: { teamSeasons }, issue })
  const teamId = teamIdOf(teamDocument)
  if (!season || !player || !teamId) throw new Error('שורת השחקן בעונת הקבוצה אינה זמינה לתיקון')

  const seasonInput = {
    seasonId: seasonKeyOf(season),
    seasonKey: seasonKeyOf(season),
    seasonStatus: clean(season.seasonStatus) || 'active',
    leagueId: clean(season.leagueId),
  }
  const teamInput = {
    ...teamDocument,
    ...season,
    birthTeamId: teamId,
    birthTeamDocumentId: teamId,
    teamId,
    teamDocumentId: teamId,
  }
  const calculated = buildTeamPlayerSeasonalScoutProjection({
    player,
    team: teamInput,
    season: seasonInput,
  })
  const result = await updateTeamSeasonPlayerSeasonalScoutProjection({
    season: seasonInput,
    team: teamInput,
    player: { ...player, ...calculated },
  })
  if (result.updated) invalidateTeamDocumentCache(teamId)
  return result
}

export const TEAM_DATA_ISSUE_CODE = Object.freeze({
  ROOT_DISPLAY_NAME_MISSING: 'root_display_name_missing',
  ROOT_SEASON_REFERENCE_MISSING: 'root_season_reference_missing',
  TEAM_INDEX_MISSING: 'team_index_missing',
  TEAM_SEASON_STATS_MISMATCH: 'team_season_stats_mismatch',
  SCOUT_PROFILES_SUMMARY_MISMATCH: 'scout_profiles_summary_mismatch',
  TEAM_INDEX_ORPHANED: 'team_index_orphaned',
  SEASON_STATUS_MISMATCH: 'season_status_mismatch',
  TEAM_SEASON_PLAYER_SCOUT_PROFILE_MISMATCH: 'team_season_player_scout_profile_mismatch',
})

const REPAIR_CATALOG = Object.freeze({
  [TEAM_DATA_ISSUE_CODE.ROOT_DISPLAY_NAME_MISSING]: {
    label: 'תיקון שם הקבוצה',
    canRepair: context => Boolean(
      context?.teamDocument?.id &&
      !String(context?.teamDocument?.displayName || '').trim()
    ),
    repair: repairTeamRootDisplayName,
  },
  [TEAM_DATA_ISSUE_CODE.TEAM_SEASON_STATS_MISMATCH]: {
    label: 'סנכרון ביצועי העונה',
    canRepair: context => {
      const issueSeasonKey = String(context?.issue?.seasonKey || '').trim()
      const selectedSeasonKey = String(
        context?.selectedLeagueSeason?.season?.seasonKey ||
        context?.selectedLeagueSeason?.season?.seasonId || ''
      ).trim()

      return Boolean(
        context?.teamDocument?.id &&
        context?.leagueDocument?.id &&
        issueSeasonKey &&
        issueSeasonKey === selectedSeasonKey
      )
    },
    repair: repairTeamSeasonStatsFromLeague,
  },
  [TEAM_DATA_ISSUE_CODE.SEASON_STATUS_MISMATCH]: {
    label: 'עדכון סטטוס העונה',
    canRepair: context => {
      const seasonKey = String(context?.issue?.seasonKey || '').trim()
      return Boolean(
        seasonKey &&
        (Array.isArray(context?.teamSearchIndexes) ? context.teamSearchIndexes : [])
          .some(index => (
            String(index?.seasonKey || index?.seasonId || '').trim() === seasonKey &&
            String(index?.id || '').trim()
          ))
      )
    },
    repair: repairTeamSearchIndexSeasonStatus,
  },
  [TEAM_DATA_ISSUE_CODE.TEAM_SEASON_PLAYER_SCOUT_PROFILE_MISMATCH]: {
    label: 'תיקון שורת השחקן בעונת הקבוצה',
    canRepair: context => {
      const { season, player } = findTeamSeasonPlayer({ context, issue: context?.issue })
      return Boolean(season && player && teamIdOf(context?.teamDocument))
    },
    repair: repairTeamSeasonPlayerScoutProfile,
  },
})

export const getTeamDataRepair = issue => (
  REPAIR_CATALOG[issue?.code] || null
)

export const canRepairTeamDataIssue = ({ issue, context } = {}) => {
  const repair = getTeamDataRepair(issue)
  return Boolean(repair?.canRepair?.({ ...context, issue }))
}

export const getTeamDataRepairLabel = issue => (
  getTeamDataRepair(issue)?.label || ''
)

export async function repairTeamDataIssue({ issue, context } = {}) {
  const repair = getTeamDataRepair(issue)
  if (!repair || !repair.canRepair({ ...context, issue })) {
    throw new Error('לתקלה זו אין עדיין תיקון אוטומטי בטוח')
  }

  return repair.repair({ ...context, issue })
}
