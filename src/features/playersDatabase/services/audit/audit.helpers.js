import { resolvePlayerTrackingReasons } from './audit.projections.js'
import { AUDIT_DOMAIN, AUDIT_SCOPE_TYPE } from './audit.scope.js'

export const clean = value => String(value === undefined || value === null ? '' : value).trim()
export const seasonKeyOf = row => clean(row?.seasonKey || row?.seasonId)
export const teamIdOf = row => clean(row?.birthTeamDocumentId || row?.teamDocumentId)
export const keyOf = row => `${teamIdOf(row)}::${seasonKeyOf(row)}`
export const teamLeagueSeasonKeyOf = row => (
  `${teamIdOf(row)}::${clean(row?.leagueId || row?.league?.leagueId)}::${seasonKeyOf(row)}`
)
export const stableValue = value => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') return Object.keys(value).sort().reduce((result, key) => ({ ...result, [key]: stableValue(value[key]) }), {})
  return value
}
export const same = (left, right) => JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right))
export const masterSeasonCounts = season => ({
  seasonKey: seasonKeyOf(season),
  teamsCount: Number(season?.teamsCount || 0),
  playersCount: Number(season?.playersCount || 0),
  playersWithScoutProfileCount: Number(season?.playersWithScoutProfileCount || 0),
  scoutProfilesCount: Number(season?.scoutProfilesCount || 0),
})
export const masterLeagueCounts = league => ({
  leagueId: clean(league?.leagueId || league?.leagueDocumentId),
  seasons: (Array.isArray(league?.seasons) ? league.seasons : [])
    .map(masterSeasonCounts)
    .sort((left, right) => left.seasonKey.localeCompare(right.seasonKey)),
})
export const masterSummaryCounts = summary => ({
  leaguesCount: Number(summary?.leaguesCount || 0),
  seasonsCount: Number(summary?.seasonsCount || 0),
  teamsCount: Number(summary?.teamsCount || 0),
  playersCount: Number(summary?.playersCount || 0),
  playersWithScoutProfileCount: Number(summary?.playersWithScoutProfileCount || 0),
  scoutProfilesCount: Number(summary?.scoutProfilesCount || 0),
})
export const profilesOf = player => [
  ...(Array.isArray(player?.professionalScoutProfileIds) ? player.professionalScoutProfileIds : []),
  ...(Array.isArray(player?.preliminaryScoutProfileIds) ? player.preliminaryScoutProfileIds : []),
  ...(Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : []),
  player?.primaryScoutProfileId,
].filter(Boolean)
export const profileIdOf = value => clean(
  value && typeof value === 'object'
    ? value.profileId || value.id || value.profile?.id
    : value
)
export const normalizedProfilesOf = player => [...new Set(
  profilesOf(player).map(profileIdOf).filter(Boolean)
)].sort()
export const sameProfiles = (left, right) => (
  JSON.stringify(normalizedProfilesOf(left)) ===
  JSON.stringify(normalizedProfilesOf(right))
)
export const profileIdsOf = values => [...new Set(
  (Array.isArray(values) ? values : []).map(profileIdOf).filter(Boolean)
)].sort()
export const samePlayerSearchIndexProfiles = (teamPlayer = {}, playerIndex = {}) => (
  JSON.stringify(profileIdsOf(teamPlayer.professionalScoutProfileIds)) ===
    JSON.stringify(profileIdsOf(playerIndex.scoutProfileIds)) &&
  JSON.stringify(profileIdsOf(teamPlayer.preliminaryScoutProfileIds)) ===
    JSON.stringify(profileIdsOf(playerIndex.scoutPreliminaryProfileIds)) &&
  clean(teamPlayer.primaryScoutProfileId) === clean(playerIndex.primaryScoutProfileId)
)
export const hasTracking = player => resolvePlayerTrackingReasons(player).length > 0
export const playerSeasonTeamIdOf = row => clean(
  row?.birthTeamDocumentId ||
  row?.teamDocumentId ||
  row?.birthTeamId ||
  row?.teamId
)
export const playerSeasonLeagueIdOf = row => clean(row?.leagueId || row?.league?.leagueId)
export const findPlayerSeasonRow = ({
  playerDocument = {},
  teamId = '',
  seasonKey = '',
  leagueId = '',
} = {}) => (
  [
    ...(Array.isArray(playerDocument?.current) ? playerDocument.current : []),
    ...(Array.isArray(playerDocument?.history) ? playerDocument.history : []),
  ].find(row => (
    playerSeasonTeamIdOf(row) === clean(teamId) &&
    seasonKeyOf(row) === clean(seasonKey) &&
    (!clean(leagueId) || !playerSeasonLeagueIdOf(row) || playerSeasonLeagueIdOf(row) === clean(leagueId))
  )) || null
)
export const playerAuditDetails = ({ player = {}, rootsById = new Map() } = {}) => {
  const contexts = ['current', 'history'].flatMap(target => (
    (Array.isArray(player?.[target]) ? player[target] : []).map(season => {
      const teamDocumentId = teamIdOf(season)
      const teamRoot = rootsById.get(teamDocumentId) || {}
      return {
        teamDocumentId,
        teamName: clean(teamRoot.displayName || season?.teamName || season?.clubName),
        leagueId: clean(season?.leagueId),
        seasonKey: seasonKeyOf(season),
      }
    })
  )).filter(context => context.teamDocumentId || context.seasonKey)

  return {
    playerName: clean(player?.fullName || player?.displayName || player?.normalizedName),
    contexts,
  }
}
export const playerKeyOf = player => clean(player?.matchedPlayerId || player?.playerId || player?.externalPlayerId)
export const playerIndexKey = row => [
  playerKeyOf(row),
  seasonKeyOf(row),
  clean(row?.birthTeamId || row?.teamId),
  String(Number(row?.birthTeamSlot || row?.teamSlot || 1) || 1),
].join('::')
export const inScope = ({ scope, row }) => {
  if (scope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM) return true
  const scopes = scope.type === AUDIT_SCOPE_TYPE.TEAM_SEASON ? [scope] : scope.scopes
  return scopes.some(item => item.teamDocumentId === teamIdOf(row) && item.seasonKey === seasonKeyOf(row))
}
export const findLeagueSeason = ({ leagues = [], leagueId = '', seasonKey = '' } = {}) => {
  const league = leagues.find(row => clean(row?.data?.leagueId || row?.id) === clean(leagueId))
  if (!league) return null

  const current = league.data?.current
  if (seasonKeyOf(current) === clean(seasonKey)) {
    return {
      league,
      season: current,
      target: 'current',
    }
  }

  const historical = (league.data?.history || []).find(item => (
    seasonKeyOf(item) === clean(seasonKey)
  ))
  if (!historical) return null

  return {
    league,
    // Legacy history rows may not have seasonStatus. Their container is the
    // authoritative lifecycle signal, so they are completed by definition.
    season: {
      ...historical,
      seasonStatus: clean(historical.seasonStatus) || 'completed',
    },
    target: 'history',
  }
}
export const clubSeasonKeyOf = ({ ageGroupId = '', season = {} } = {}) => [
  clean(ageGroupId),
  seasonKeyOf(season),
  clean(season?.teamId),
].join('::')
export const leagueSeasonHasTeam = ({ leagueSeason = {}, teamId = '' } = {}) => (
  (Array.isArray(leagueSeason?.tableRank) ? leagueSeason.tableRank : []).some(row => (
    clean(row?.teamId || row?.birthTeamId) === clean(teamId)
  ))
)
// Old player indexes may omit both teamDisplayName and leagueId.  The League
// table is the canonical, already-loaded source that can restore this audit
// context without an additional read.
export const findLeagueTableTeamContext = ({ leagues = [], teamId = '', seasonKey = '' } = {}) => {
  const matches = leagues.flatMap(({ id, data }) => {
    const seasons = [
      data?.current,
      ...(Array.isArray(data?.history) ? data.history : []),
    ].filter(Boolean)

    return seasons.flatMap(season => {
      if (seasonKeyOf(season) !== clean(seasonKey)) return []
      return (Array.isArray(season?.tableRank) ? season.tableRank : [])
        .filter(row => clean(row?.teamId || row?.birthTeamId) === clean(teamId))
        .map(row => ({
          leagueId: clean(data?.leagueId || id),
          teamDisplayName: clean(row?.teamDisplayName || row?.teamName || row?.displayName),
        }))
    })
  })

  return matches.length === 1 ? matches[0] : null
}
export const auditDomainsForScope = scope => (
  scope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM
    ? Object.values(AUDIT_DOMAIN)
    : [AUDIT_DOMAIN.TEAM_RELATIONS, AUDIT_DOMAIN.PLAYER_RELATIONS]
)
export const uniqueFindings = findings => {
  const seen = new Set()
  return findings.filter(finding => {
    const key = [
      finding.type,
      finding.entityType,
      finding.documentId,
      finding.relatedDocumentId,
      finding.teamDocumentId,
      finding.playerDocumentId,
      finding.seasonKey,
      finding.relationKey,
      finding.title,
    ].join('::')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
export const toIso = value => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value?.toDate === 'function') return value.toDate().toISOString()
  if (value instanceof Date) return value.toISOString()
  return null
}
export const attachFindingTimeline = ({ findings = [], snapshot, detectedAt }) => {
  const rows = snapshot.rows
  const teamSeasonsById = new Map(rows.teamSeasons.map(row => [row.id, row.data]))
  const playerById = new Map(rows.players.map(row => [row.id, row.data]))
  const indexesById = new Map(rows.searchIndexes.map(row => [row.id, row.data]))
  const leaguesById = new Map(rows.leagues.map(row => [row.id, row.data]))

  return findings.map(finding => {
    const isIndex = /SearchIndex$/.test(clean(finding.entityType))
    const index = isIndex ? indexesById.get(finding.documentId) : null
    const source = teamSeasonsById.get(finding.relatedDocumentId) ||
      (finding.entityType === 'teamSeason' ? teamSeasonsById.get(finding.documentId) : null) ||
      (finding.entityType === 'player' ? playerById.get(finding.documentId) : null) ||
      leaguesById.get(finding.documentId) || null
    return {
      ...finding,
      detectedAt,
      sourceUpdatedAt: toIso(source?.updatedAt),
      indexUpdatedAt: toIso(index?.updatedAt),
      sourceLastWriteAction: '',
      sourceLastWriteAt: null,
      indexLastWriteAction: '',
      indexLastWriteAt: null,
    }
  })
}


export const auditHelpers = {
  clean,
  seasonKeyOf,
  teamIdOf,
  keyOf,
  teamLeagueSeasonKeyOf,
  same,
  masterLeagueCounts,
  masterSummaryCounts,
  profilesOf,
  normalizedProfilesOf,
  sameProfiles,
  profileIdsOf,
  samePlayerSearchIndexProfiles,
  hasTracking,
  findPlayerSeasonRow,
  playerAuditDetails,
  playerIndexKey,
  inScope,
  findLeagueSeason,
  clubSeasonKeyOf,
  leagueSeasonHasTeam,
  findLeagueTableTeamContext,
}
