import { resolvePlayersDatabaseCatalogMatches } from '../catalog/catalogResolvers.js'

export const PLAYERS_DATABASE_RESOLUTION_MODE = {
  NAME_ONLY: 'name_only',
  CANDIDATE: 'candidate',
  MANAGED: 'managed',
  IGNORED: 'ignored',
}

export const PLAYERS_DATABASE_RECORD_KIND = {
  PLAYER: 'player',
  CLUB: 'club',
  TEAM: 'team',
  LEAGUE: 'league',
  COACH_NAME: 'coach_name',
  LEAGUE_AGE_GROUP: 'league_age_group',
  SNAPSHOT: 'snapshot',
}

const clean = (value) => String(value ?? '').trim()
const hasText = (value) => clean(value).length > 0

const pick = (row = {}, keys = []) => {
  for (const key of keys) {
    const value = clean(row?.[key])
    if (value) return value
  }

  return ''
}

export function resolvePlayerEntityMode(row = {}) {
  const externalPlayerId = pick(row, ['externalPlayerId', 'playerExternalId'])
  const profileUrl = pick(row, ['profileUrl', 'playerProfileUrl', 'sourceUrl'])
  const fullName = pick(row, ['fullName', 'playerName'])

  if (externalPlayerId || profileUrl) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.PLAYER,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED,
      reason: 'player_has_stable_external_identity',
    }
  }

  if (fullName) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.PLAYER,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED,
      reason: 'player_name_only_is_not_enough_for_managed_entity',
    }
  }

  return {
    kind: PLAYERS_DATABASE_RECORD_KIND.PLAYER,
    mode: PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED,
    reason: 'missing_player_identity',
  }
}

export function resolveClubEntityMode(row = {}) {
  const externalClubId = pick(row, ['externalClubId', 'clubExternalId'])
  const clubName = pick(row, ['clubName', 'currentClubName'])

  if (externalClubId) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.CLUB,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.CANDIDATE,
      reason: 'club_has_external_identity',
    }
  }

  if (clubName) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.CLUB,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY,
      reason: 'club_name_only_reference',
    }
  }

  return {
    kind: PLAYERS_DATABASE_RECORD_KIND.CLUB,
    mode: PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED,
    reason: 'missing_club_name',
  }
}

export function resolveTeamEntityMode(row = {}) {
  const externalTeamId = pick(row, ['externalTeamId', 'teamExternalId'])
  const seasonId = pick(row, ['seasonId'])
  const teamName = pick(row, ['teamName', 'currentTeamName'])

  if (externalTeamId && seasonId) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.TEAM,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED,
      reason: 'team_has_external_identity_and_season',
    }
  }

  if (externalTeamId || teamName) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.TEAM,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY,
      reason: 'team_reference_without_stable_season_identity',
    }
  }

  return {
    kind: PLAYERS_DATABASE_RECORD_KIND.TEAM,
    mode: PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED,
    reason: 'missing_team_identity',
  }
}

export function resolveLeagueEntityMode(row = {}) {
  const externalLeagueId = pick(row, ['externalLeagueId', 'leagueExternalId'])
  const seasonId = pick(row, ['seasonId'])
  const leagueName = pick(row, ['leagueName', 'currentLeagueName'])

  if (externalLeagueId && seasonId) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.LEAGUE,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED,
      reason: 'league_has_external_identity_and_season',
    }
  }

  if (leagueName && seasonId) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.LEAGUE,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.CANDIDATE,
      reason: 'league_name_with_season',
    }
  }

  if (leagueName) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.LEAGUE,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.NAME_ONLY,
      reason: 'league_name_only_reference',
    }
  }

  return {
    kind: PLAYERS_DATABASE_RECORD_KIND.LEAGUE,
    mode: PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED,
    reason: 'missing_league_identity',
  }
}

export function resolveSnapshotRecordMode(row = {}) {
  const playerPolicy = resolvePlayerEntityMode(row)
  const hasPlayerIdentity = playerPolicy.mode === PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED
  const hasPerformanceData = [
    row.minutes,
    row.goals,
    row.appearances,
    row.starts,
    row.playingUpMinutes,
  ].some((value) => hasText(value) && Number.isFinite(Number(value)))

  if (hasPlayerIdentity && hasPerformanceData) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.SNAPSHOT,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.MANAGED,
      reason: 'snapshot_has_managed_player_and_performance_data',
    }
  }

  if (hasPlayerIdentity) {
    return {
      kind: PLAYERS_DATABASE_RECORD_KIND.SNAPSHOT,
      mode: PLAYERS_DATABASE_RESOLUTION_MODE.CANDIDATE,
      reason: 'snapshot_has_player_but_missing_performance_data',
    }
  }

  return {
    kind: PLAYERS_DATABASE_RECORD_KIND.SNAPSHOT,
    mode: PLAYERS_DATABASE_RESOLUTION_MODE.IGNORED,
    reason: 'snapshot_without_managed_player',
  }
}

export function resolvePlayersDatabaseEntityPolicy(row = {}) {
  const catalog = resolvePlayersDatabaseCatalogMatches(row)

  return {
    player: resolvePlayerEntityMode(row),
    club: {
      ...resolveClubEntityMode(row),
      catalogMatch: catalog.club,
    },
    team: {
      ...resolveTeamEntityMode(row),
      catalogMatch: catalog.team,
    },
    league: {
      ...resolveLeagueEntityMode(row),
      catalogMatch: catalog.league,
    },
    snapshot: resolveSnapshotRecordMode(row),
  }
}
