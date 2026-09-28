// src/features/playersDatabase/domain/statsV2/clearStatsProjectionPlan.builder.js

import { SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT } from '../../catalog/firestoreDocuments/searchIndexPlayerSeason.catalog.js'
import { SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT } from '../../catalog/firestoreDocuments/searchIndexBirthTeamSeason.catalog.js'
import {
  STATS_PLAYER_INDEX_OWNED_FIELDS,
  STATS_TEAM_INDEX_OWNED_FIELDS,
} from '../../services/writeV2/stats/support/statsProjectionOwnership.js'
import {
  STATS_ABSENT_SCOUT_PROFILES_SUMMARY,
  STATS_OWNED_RICH_SCOUT_FIELDS,
  buildStatsAbsentPlayerState,
} from './statsAbsence.builder.js'
import { resolveStatsPlayerIdentityKey } from './statsReloadDecision.builder.js'
import { countCurrentRosterPlayers } from '../../model/team/rosterStatus.model.js'
import { buildTeamSeasonDocumentId } from '../../model/team/teamIdentity.model.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const clone = value => (
  value === undefined ? undefined : JSON.parse(JSON.stringify(value))
)
const emptySummary = () => clone(STATS_ABSENT_SCOUT_PROFILES_SUMMARY)

export const resolveClearStatsPlayersCount = teamSeason => (
  Number.isInteger(teamSeason?.playersCount) && teamSeason.playersCount >= 0
    ? teamSeason.playersCount
    : countCurrentRosterPlayers(
        Array.isArray(teamSeason?.teamPlayers) ? teamSeason.teamPlayers : []
      )
)

const normalize = value => {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = normalize(value[key])
      return result
    }, {})
  }
  return value
}

const equal = (left, right) => JSON.stringify(normalize(left)) === JSON.stringify(normalize(right))

const fail = (code, message) => {
  const error = new Error(message)
  error.code = code
  throw error
}

export const CLEAR_STATS_PLAYER_DOCUMENT_SEASON_OWNED_FIELDS = Object.freeze([
  'statsStatus',
  'playerStats',
  'lineClassification',
  'primaryScoutProfileId',
  'primaryScoutProfileStrengthDepthPct',
  'professionalScoutProfileIds',
  'preliminaryScoutProfileIds',
  'scoutEffectiveImmediacyStatus',
  'scoutPlayerInterestLevel',
  'scoutEngineVersion',
  ...STATS_OWNED_RICH_SCOUT_FIELDS,
])

export const CLEAR_STATS_LEAGUE_OWNED_FIELDS = Object.freeze([
  'hasStats',
  'statsComplete',
  'playersCount',
  'scoutProfilesSummary',
])

export const CLEAR_STATS_LEAGUE_PRESERVED_FIELDS = Object.freeze([
  'teamStats',
  'rank',
])

export const CLEAR_STATS_CLUB_SEASON_OWNED_FIELDS = Object.freeze([
  'playersCount',
  'teamTaskSignals',
  'teamTaskAvailability',
  'lineStructure',
  'scoutProfilesSummary',
])

const buildOwnedDefaults = (catalog, ownedFields) => Object.fromEntries(
  [...ownedFields]
    .filter(field => Object.prototype.hasOwnProperty.call(catalog, field))
    .map(field => [field, clone(catalog[field])])
)

export const buildStatsAbsentPlayerDocumentSeasonRow = row => buildStatsAbsentPlayerState(row)

const matchesPlayerDocumentSeasonRow = ({ row, identity }) => (
  clean(row?.seasonKey) === identity.seasonKey &&
  clean(row?.birthTeamDocumentId || row?.birthTeamId) === identity.birthTeamDocumentId
)

const buildPlayerDocumentOperations = ({ identity, finalTeamSeasonPreview, sources }) => {
  const documents = sources.playerDocumentsById || {}
  const previewPlayers = Array.isArray(finalTeamSeasonPreview?.teamPlayers)
    ? finalTeamSeasonPreview.teamPlayers
    : []
  const playerDocumentIds = Array.from(new Set([
    ...previewPlayers.map(player => clean(player?.playerDocumentId)),
    ...Object.keys(documents).map(clean),
  ].filter(Boolean)))

  return playerDocumentIds.map(playerDocumentId => {
    const document = playerDocumentId ? documents[playerDocumentId] : null

    if (!document) {
      return {
        target: { docId: playerDocumentId, seasonKey: identity.seasonKey },
        action: 'skip',
        sourceFields: {},
        setFields: {},
        unsetFields: [],
      }
    }

    const unidentifiedSeasonRow = ['current', 'history'].some(name => (
      (Array.isArray(document[name]) ? document[name] : []).some(row => (
        clean(row?.seasonKey) === identity.seasonKey &&
        !clean(row?.birthTeamDocumentId || row?.birthTeamId)
      ))
    ))
    if (unidentifiedSeasonRow) {
      fail(
        'CLEAR_STATS_PLAYER_DOCUMENT_IDENTITY_REQUIRED',
        `CLEAR_STATS Player Document season row requires team identity: ${playerDocumentId}`
      )
    }

    const matchingTargets = ['current', 'history'].flatMap(name => (
      (Array.isArray(document[name]) ? document[name] : [])
        .map((row, index) => ({ name, index, row }))
        .filter(({ row }) => matchesPlayerDocumentSeasonRow({ row, identity }))
    ))

    if (matchingTargets.length > 1) {
      fail(
        'CLEAR_STATS_PLAYER_DOCUMENT_TARGET_AMBIGUOUS',
        `CLEAR_STATS Player Document has duplicate target season rows: ${playerDocumentId}`
      )
    }

    const targetName = matchingTargets[0]?.name

    if (!targetName) {
      return {
        target: { docId: playerDocumentId, seasonKey: identity.seasonKey },
        action: 'skip',
        sourceFields: {},
        setFields: {},
        unsetFields: [],
      }
    }

    const rows = clone(document[targetName])
    const rowIndex = matchingTargets[0].index
    rows[rowIndex] = buildStatsAbsentPlayerDocumentSeasonRow(rows[rowIndex])

    return {
      target: {
        docId: playerDocumentId,
        seasonKey: identity.seasonKey,
        birthTeamDocumentId: identity.birthTeamDocumentId,
        arrayField: targetName,
      },
      action: equal(rows, document[targetName]) ? 'skip' : 'update',
      sourceFields: { [targetName]: clone(document[targetName]) },
      setFields: { [targetName]: rows },
      unsetFields: [],
    }
  }).filter(Boolean)
}

export const buildClearStatsPlayerIndexSetFields = (
  document,
  { identity = {}, seasonStatus = '' } = {}
) => {
  const setFields = buildOwnedDefaults(
    SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT,
    STATS_PLAYER_INDEX_OWNED_FIELDS
  )
  const playerDocumentId = clean(
    document?.playerDocumentId ||
    (clean(document?.sourceCollection) === 'players'
      ? document?.sourceDocumentId
      : '')
  )
  const sourceTarget = clean(seasonStatus).toLowerCase() === 'completed'
    ? 'history'
    : 'current'

  if (Object.prototype.hasOwnProperty.call(setFields, 'playerDocumentId')) {
    setFields.playerDocumentId = playerDocumentId
  }

  setFields.seasonStatus = clean(seasonStatus)
  setFields.sourceCollection = playerDocumentId ? 'players' : 'birthTeamSeasons'
  setFields.sourceDocumentId = playerDocumentId || buildTeamSeasonDocumentId(
    identity.birthTeamDocumentId,
    identity.seasonKey
  )
  setFields.sourceTarget = sourceTarget

  return setFields
}

export const buildClearStatsTeamIndexSetFields = ({
  birthTeamDocumentId = '',
  seasonKey = '',
  playersCount = 0,
} = {}) => ({
  ...buildOwnedDefaults(
    SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT,
    STATS_TEAM_INDEX_OWNED_FIELDS
  ),
  teamSeasonDocumentId: buildTeamSeasonDocumentId(
    birthTeamDocumentId,
    seasonKey
  ),
  playersCount,
})

const pickSourceFields = ({ document, fields }) => Object.fromEntries(
  Object.keys(fields)
    .filter(field => Object.prototype.hasOwnProperty.call(document || {}, field))
    .map(field => [field, clone(document[field])])
)

const buildPlayerIndexOperations = ({
  identity,
  finalTeamSeasonPreview,
  sources,
}) => {
  const documents = sources.playerSearchIndexesById || {}

  return Object.entries(documents).map(([docId, document]) => {
    const matchesIdentity = (
      clean(document?.entityType) === 'playerSeason' &&
      clean(document?.seasonKey) === identity.seasonKey &&
      clean(document?.birthTeamDocumentId) === identity.birthTeamDocumentId &&
      clean(document?.leagueId) === identity.leagueId
    )

    if (!matchesIdentity) {
      fail(
        'CLEAR_STATS_PLAYER_INDEX_IDENTITY_MISMATCH',
        `CLEAR_STATS Player SearchIndex identity mismatch: ${docId}`
      )
    }

    const playerKey = clean(resolveStatsPlayerIdentityKey(document))
    const setFields = buildClearStatsPlayerIndexSetFields(document, {
      identity,
      seasonStatus: finalTeamSeasonPreview.seasonStatus,
    })
    const changed = Object.entries(setFields).some(([field, value]) => !equal(document[field], value))

    return {
      target: {
        docId,
        playerKey,
        seasonKey: identity.seasonKey,
        birthTeamDocumentId: identity.birthTeamDocumentId,
        leagueId: identity.leagueId,
      },
      action: changed ? 'update' : 'skip',
      sourceFields: pickSourceFields({ document, fields: setFields }),
      setFields,
      unsetFields: [],
    }
  })
}

const buildTeamIndexOperation = ({ identity, finalTeamSeasonPreview, sources }) => {
  const document = sources.teamSearchIndex
  if (!document) return null

  const setFields = buildClearStatsTeamIndexSetFields({
    birthTeamDocumentId: identity.birthTeamDocumentId,
    seasonKey: identity.seasonKey,
    playersCount: finalTeamSeasonPreview.playersCount,
  })
  const changed = Object.entries(setFields).some(([field, value]) => !equal(document[field], value))

  return {
    target: {
      docId: clean(document.id),
      seasonKey: identity.seasonKey,
      birthTeamDocumentId: identity.birthTeamDocumentId,
      leagueId: identity.leagueId,
    },
    action: changed ? 'update' : 'skip',
    sourceFields: pickSourceFields({ document, fields: setFields }),
    setFields,
    unsetFields: [],
  }
}

const resolveLeagueSeason = ({ league, seasonKey }) => {
  if (clean(league?.current?.seasonKey) === seasonKey) {
    return { field: 'current', season: league.current }
  }

  const history = Array.isArray(league?.history) ? league.history : []
  const index = history.findIndex(season => clean(season?.seasonKey) === seasonKey)
  return index >= 0 ? { field: 'history', index, season: history[index] } : null
}

export const buildStatsAbsentLeagueRow = (row, { playersCount = row?.playersCount } = {}) => ({
  ...row,
  hasStats: false,
  statsComplete: false,
  playersCount,
  scoutProfilesSummary: emptySummary(),
})

const buildLeagueOperation = ({ identity, finalTeamSeasonPreview, sources }) => {
  const league = sources.league
  if (!league) return null

  const resolved = resolveLeagueSeason({ league, seasonKey: identity.seasonKey })
  if (!resolved) return null

  const rows = Array.isArray(resolved.season?.tableRank) ? clone(resolved.season.tableRank) : []
  const rowIndex = rows.findIndex(row => clean(row?.birthTeamId || row?.birthTeamDocumentId) === identity.birthTeamDocumentId)
  if (rowIndex < 0) return null

  const nextRow = buildStatsAbsentLeagueRow(rows[rowIndex], {
    playersCount: finalTeamSeasonPreview.playersCount,
  })
  rows[rowIndex] = nextRow

  const setFields = resolved.field === 'current'
    ? { current: { ...clone(league.current), tableRank: rows } }
    : {
        history: clone(league.history).map((season, index) => (
          index === resolved.index ? { ...season, tableRank: rows } : season
        )),
      }

  return {
    target: {
      docId: clean(league.id || league.leagueId),
      seasonKey: identity.seasonKey,
      birthTeamDocumentId: identity.birthTeamDocumentId,
    },
    action: equal(nextRow, resolved.season.tableRank[rowIndex]) ? 'skip' : 'update',
    sourceFields: resolved.field === 'current'
      ? { current: clone(league.current) }
      : { history: clone(league.history) },
    setFields,
    unsetFields: [],
  }
}

export const buildStatsAbsentClubSeason = (season, { playersCount = season?.playersCount } = {}) => ({
  ...season,
  playersCount,
  teamTaskSignals: { offense: false, defense: false },
  teamTaskAvailability: { availability: 'unavailable', reason: 'stats_not_loaded' },
  lineStructure: {
    lines: {
      attack: { playersCount: 0 },
      defense: { playersCount: 0 },
      midfield: { playersCount: 0 },
    },
  },
  scoutProfilesSummary: emptySummary(),
})

const clearClubAgeGroups = ({ ageGroups, identity, playersCount, compact = false }) => (
  (Array.isArray(ageGroups) ? clone(ageGroups) : []).map(group => {
    if (compact) {
      const clearRows = rows => (Array.isArray(rows) ? rows : []).map(row => (
        clean(row?.seasonKey) === identity.seasonKey && clean(row?.teamId) === identity.birthTeamDocumentId
          ? buildStatsAbsentClubSeason(row, { playersCount })
          : row
      ))
      return { ...group, current: clearRows(group.current), previous: clearRows(group.previous) }
    }

    return {
      ...group,
      seasons: (Array.isArray(group.seasons) ? group.seasons : []).map(season => (
        clean(season?.seasonKey) === identity.seasonKey && clean(season?.teamId) === identity.birthTeamDocumentId
          ? buildStatsAbsentClubSeason(season, { playersCount })
          : season
      )),
    }
  })
)

const buildClubOperations = ({ identity, finalTeamSeasonPreview, sources }) => Object.entries(sources.clubsById || {}).map(([docId, club]) => {
  const ageGroups = clearClubAgeGroups({
    ageGroups: club?.ageGroups,
    identity,
    playersCount: finalTeamSeasonPreview.playersCount,
  })
  return {
    target: {
      docId,
      clubId: identity.clubId,
      seasonKey: identity.seasonKey,
      birthTeamDocumentId: identity.birthTeamDocumentId,
    },
    action: equal(ageGroups, club?.ageGroups || []) ? 'skip' : 'update',
    sourceFields: { ageGroups: clone(club?.ageGroups || []) },
    setFields: { ageGroups },
    unsetFields: [],
  }
})

const buildClubsMasterOperation = ({ identity, finalTeamSeasonPreview, sources }) => {
  const master = sources.clubsMaster
  if (!master) return null

  const clubs = (Array.isArray(master.clubs) ? clone(master.clubs) : []).map(club => (
    clean(club?.clubId) === identity.clubId
      ? {
          ...club,
          ageGroups: clearClubAgeGroups({
            ageGroups: club.ageGroups,
            identity,
            playersCount: finalTeamSeasonPreview.playersCount,
            compact: true,
          }),
        }
      : club
  ))

  return {
    target: {
      docId: 'all',
      clubId: identity.clubId,
      seasonKey: identity.seasonKey,
      birthTeamDocumentId: identity.birthTeamDocumentId,
    },
    action: equal(clubs, master.clubs || []) ? 'skip' : 'update',
    sourceFields: { clubs: clone(master.clubs || []) },
    setFields: { clubs },
    unsetFields: [],
  }
}

const countOperations = plan => [
  ...plan.playerDocumentOperations,
  ...plan.playerSearchIndexOperations,
  plan.teamSearchIndexOperation,
  plan.leagueOperation,
  ...plan.clubOperations,
  plan.clubsMasterOperation,
].filter(operation => operation?.action === 'update').length

const assertProjectionSourceIdentity = ({ identity, finalTeamSeasonPreview, sources }) => {
  const assertRequiredMatch = (actual, expected, label) => {
    const value = clean(actual)
    if (!value) {
      fail('CLEAR_STATS_PROJECTION_IDENTITY_REQUIRED', `CLEAR_STATS projection identity required: ${label}`)
    }
    if (value !== clean(expected)) {
      fail('CLEAR_STATS_PROJECTION_IDENTITY_MISMATCH', `CLEAR_STATS projection identity mismatch: ${label}`)
    }
  }

  const teamIndex = sources.teamSearchIndex
  if (teamIndex) {
    assertRequiredMatch(teamIndex.birthTeamDocumentId || teamIndex.birthTeamId, identity.birthTeamDocumentId, 'teamSearchIndex.birthTeamDocumentId')
    assertRequiredMatch(teamIndex.seasonKey, identity.seasonKey, 'teamSearchIndex.seasonKey')
    assertRequiredMatch(teamIndex.leagueId, identity.leagueId, 'teamSearchIndex.leagueId')
  }

  const league = sources.league
  if (league) {
    assertRequiredMatch(league.id || league.leagueId, identity.leagueId, 'league.leagueId')
  }

  const expectedClubId = clean(
    identity.clubId ||
    finalTeamSeasonPreview?.clubId ||
    finalTeamSeasonPreview?.scoutIdentityContext?.clubId
  )
  const hasClubSources = Object.keys(sources.clubsById || {}).length > 0 || Boolean(sources.clubsMaster)
  if (hasClubSources && !expectedClubId) {
    fail('CLEAR_STATS_PROJECTION_IDENTITY_REQUIRED', 'CLEAR_STATS projection identity required: clubId')
  }
  Object.entries(sources.clubsById || {}).forEach(([docId, club]) => {
    assertRequiredMatch(club?.clubId || docId, expectedClubId, 'club.clubId')
  })

  return expectedClubId
}

export const buildClearStatsProjectionPlanV2 = ({
  identity = {},
  finalTeamSeasonPreview = {},
  projectionSources = {},
} = {}) => {
  const source = projectionSources || {}

  const clubId = assertProjectionSourceIdentity({
    identity,
    finalTeamSeasonPreview,
    sources: source,
  })
  const projectionIdentity = { ...identity, clubId }
  const playersCount = resolveClearStatsPlayersCount(finalTeamSeasonPreview)
  const preview = {
    ...finalTeamSeasonPreview,
    playersCount,
  }

  const plan = {
    planVersion: 1,
    playerDocumentOperations: buildPlayerDocumentOperations({ identity: projectionIdentity, finalTeamSeasonPreview: preview, sources: source }),
    playerSearchIndexOperations: buildPlayerIndexOperations({ identity: projectionIdentity, finalTeamSeasonPreview: preview, sources: source }),
    teamSearchIndexOperation: buildTeamIndexOperation({ identity: projectionIdentity, finalTeamSeasonPreview: preview, sources: source }),
    leagueOperation: buildLeagueOperation({ identity: projectionIdentity, finalTeamSeasonPreview: preview, sources: source }),
    clubOperations: buildClubOperations({ identity: projectionIdentity, finalTeamSeasonPreview: preview, sources: source }),
    clubsMasterOperation: buildClubsMasterOperation({ identity: projectionIdentity, finalTeamSeasonPreview: preview, sources: source }),
    impact: { documentsAffected: 0, operationsRequired: 0 },
  }

  const operationsRequired = countOperations(plan)
  return {
    ...plan,
    impact: {
      documentsAffected: operationsRequired,
      operationsRequired,
    },
  }
}
