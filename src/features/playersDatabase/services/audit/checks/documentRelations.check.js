// src/features/playersDatabase/services/audit/checks/documentRelations.check.js

import { isProfessionalScoutProfile } from '../../../../../shared/scouting/players/profiles.js'
import { buildPlayerDocumentId } from '../../../model/playerIdentity.model.js'
import { shouldHavePlayerDocument } from '../../write/players/scoutingPlayerLifecycle.model.js'
import {
  buildPlayerSeasonIndexIdentity,
  buildPlayerSeasonIndexIdentityKey,
  hasCompletePlayerSeasonIndexIdentity,
  shouldSkipNewPlayerSeasonIndex,
} from '../../write/searchIndex/player/playerSeasonIndex.identity.js'

const MAX_ISSUES_PER_RELATION = 1000

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [
  ...new Set((Array.isArray(values) ? values : []).map(clean).filter(Boolean)),
]

const seasonKeyOf = value => clean(value?.seasonKey || value?.seasonId)
const teamDocumentIdOf = value => clean(
  value?.birthTeamDocumentId || value?.teamDocumentId
)

const getSeasonRows = document => [
  ...(Array.isArray(document?.current)
    ? document.current
    : document?.current && typeof document.current === 'object'
      ? [document.current]
      : []),
  ...(Array.isArray(document?.history) ? document.history : []),
]

const getProfessionalProfileIds = source => {
  const hierarchyIds = Array.isArray(source?.scoutProfileHierarchy?.professionalProfileIds)
    ? source.scoutProfileHierarchy.professionalProfileIds
    : []
  const profiles = Array.isArray(source?.scoutSignals) && source.scoutSignals.length
    ? source.scoutSignals
    : Array.isArray(source?.scoutProfiles)
      ? source.scoutProfiles
      : []
  const ids = [
    ...hierarchyIds.filter(isProfessionalScoutProfile),
    ...profiles
      .filter(isProfessionalScoutProfile)
      .map(profile => clean(profile?.profileId || profile?.id)),
  ]

  return unique(ids)
}

const hasProfessionalProfile = source => getProfessionalProfileIds(source).length > 0

const buildPlayerIdentityTokens = player => unique([
  clean(player?.playerDocumentId) ? `doc:${clean(player.playerDocumentId)}` : '',
  clean(player?.matchedPlayerId || player?.playerId)
    ? `player:${clean(player?.matchedPlayerId || player?.playerId)}`
    : '',
  clean(player?.externalPlayerId) ? `external:${clean(player.externalPlayerId)}` : '',
  clean(player?.identityKey) ? `identity:${clean(player.identityKey)}` : '',
  buildPlayerDocumentId(player) ? `expectedDoc:${buildPlayerDocumentId(player)}` : '',
])

const valuesEqual = (left, right) => {
  if (Array.isArray(left) || Array.isArray(right)) {
    return JSON.stringify(unique(left).sort()) === JSON.stringify(unique(right).sort())
  }
  if (left === null || left === undefined || left === '') {
    return right === null || right === undefined || right === ''
  }
  if (typeof left === 'number' || typeof right === 'number') {
    return Number(left) === Number(right)
  }
  return clean(left) === clean(right)
}

const buildMismatchFields = pairs => pairs
  .filter(pair => !valuesEqual(pair.expected, pair.actual))
  .map(pair => pair.label)

const makeRelation = ({ id, title, description }) => ({
  id,
  title,
  description,
  checked: 0,
  exact: 0,
  affected: 0,
  issueCount: 0,
  issues: [],
})

const addRelationCheck = ({ relation, issue = null }) => {
  relation.checked += 1
  if (!issue) {
    relation.exact += 1
    return
  }

  relation.affected += 1
  relation.issueCount += 1
  if (relation.issues.length < MAX_ISSUES_PER_RELATION) {
    relation.issues.push(issue)
  }
}

const indexBy = (rows, getKeys) => {
  const result = new Map()
  rows.forEach(row => {
    unique(getKeys(row)).forEach(key => {
      const values = result.get(key) || []
      values.push(row)
      result.set(key, values)
    })
  })
  return result
}

const buildTeamSeasonRows = teams => teams.flatMap(team => (
  getSeasonRows(team.data).map(season => ({
    documentId: team.id,
    document: team.data,
    season,
    seasonKey: seasonKeyOf(season),
    key: `${team.id}::${seasonKeyOf(season)}`,
  }))
)).filter(row => row.seasonKey)

const buildLeagueSeasonRows = leagues => leagues.flatMap(league => (
  getSeasonRows(league.data).map(season => ({
    documentId: league.id,
    document: league.data,
    season,
    seasonKey: seasonKeyOf(season),
    leagueId: clean(league.data?.leagueId || league.id),
    key: `${clean(league.data?.leagueId || league.id)}::${seasonKeyOf(season)}`,
  }))
)).filter(row => row.seasonKey)

const buildPlayerSeasonRows = players => players.flatMap(player => (
  getSeasonRows(player.data).map(season => ({
    documentId: player.id,
    document: player.data,
    season,
    seasonKey: seasonKeyOf(season),
    key: `${player.id}::${seasonKeyOf(season)}`,
  }))
)).filter(row => row.seasonKey)

const buildTeamPlayerRows = teamSeasons => teamSeasons.flatMap(teamSeason => (
  (Array.isArray(teamSeason.season?.teamPlayers) ? teamSeason.season.teamPlayers : [])
    .map(player => {
      const playerSeasonIndexIdentity = buildPlayerSeasonIndexIdentity({
        player,
        season: teamSeason.season,
        team: teamSeason.document,
      })

      return {
        ...teamSeason,
        player,
        expectedPlayerDocumentId: clean(player?.playerDocumentId) || buildPlayerDocumentId(player),
        professionalProfileIds: getProfessionalProfileIds(player),
        hasProfessionalProfile: hasProfessionalProfile(player),
        shouldHavePlayerDocument: shouldHavePlayerDocument(player),
        playerSeasonIndexIdentity,
        hasCompletePlayerSeasonIndexIdentity: hasCompletePlayerSeasonIndexIdentity(
          playerSeasonIndexIdentity
        ),
        skipsNewPlayerSeasonIndex: shouldSkipNewPlayerSeasonIndex(player),
        identityTokens: buildPlayerIdentityTokens(player),
      }
    })
))

const buildPlayerIndexIdentityKey = row => buildPlayerSeasonIndexIdentityKey(
  buildPlayerSeasonIndexIdentity({ row: row?.data || {} })
)

const buildTeamPlayerIndexKey = row => buildPlayerSeasonIndexIdentityKey(
  row?.playerSeasonIndexIdentity
)

const compareTeamSeasonToTeamIndex = ({ teamRow, index }) => buildMismatchFields([
  { label: 'מזהה ליגה', expected: teamRow.season?.leagueId, actual: index?.leagueId },
  { label: 'עונה', expected: teamRow.seasonKey, actual: seasonKeyOf(index) },
  { label: 'מזהה קבוצת שנתון', expected: teamRow.document?.birthTeamId, actual: index?.birthTeamId },
  { label: 'מזהה קבוצה', expected: teamRow.document?.teamId, actual: index?.teamId },
  { label: 'מזהה מועדון', expected: teamRow.document?.clubId, actual: index?.clubId },
  { label: 'שנתון', expected: teamRow.season?.birthYear || teamRow.document?.birthYear, actual: index?.birthYear },
  { label: 'מספר שחקנים', expected: teamRow.season?.playersCount, actual: index?.playersCount },
])

const compareTeamPlayerToPlayerSeason = ({ teamPlayerRow, playerSeason }) => buildMismatchFields([
  { label: 'עונה', expected: teamPlayerRow.seasonKey, actual: seasonKeyOf(playerSeason) },
  { label: 'מסמך קבוצה', expected: teamPlayerRow.documentId, actual: teamDocumentIdOf(playerSeason) },
  { label: 'ליגה', expected: teamPlayerRow.season?.leagueId, actual: playerSeason?.leagueId },
  { label: 'מזהה שחקן', expected: teamPlayerRow.player?.playerId, actual: playerSeason?.playerId },
  { label: 'מזהה שחקן חיצוני', expected: teamPlayerRow.player?.externalPlayerId, actual: playerSeason?.externalPlayerId },
  { label: 'עמדה', expected: teamPlayerRow.player?.primaryPosition, actual: playerSeason?.primaryPosition },
  { label: 'משחקים', expected: teamPlayerRow.player?.playerStats?.games, actual: playerSeason?.playerStats?.games },
  { label: 'שערים', expected: teamPlayerRow.player?.playerStats?.goals, actual: playerSeason?.playerStats?.goals },
  { label: 'דקות', expected: teamPlayerRow.player?.playerStats?.minutes, actual: playerSeason?.playerStats?.minutes },
  { label: 'פרופילים מקצועיים', expected: teamPlayerRow.professionalProfileIds, actual: getProfessionalProfileIds(playerSeason) },
])

const compareTeamPlayerToPlayerIndex = ({ teamPlayerRow, index }) => buildMismatchFields([
  { label: 'עונה', expected: teamPlayerRow.seasonKey, actual: seasonKeyOf(index) },
  { label: 'מסמך קבוצה', expected: teamPlayerRow.documentId, actual: teamDocumentIdOf(index) },
  { label: 'ליגה', expected: teamPlayerRow.season?.leagueId, actual: index?.leagueId },
  {
    label: 'מזהה שחקן',
    expected: teamPlayerRow.player?.matchedPlayerId || teamPlayerRow.player?.playerId,
    actual: index?.playerId,
  },
  { label: 'מזהה שחקן חיצוני', expected: teamPlayerRow.player?.externalPlayerId, actual: index?.externalPlayerId },
  { label: 'עמדה', expected: teamPlayerRow.player?.primaryPosition, actual: index?.primaryPosition },
  { label: 'משחקים', expected: teamPlayerRow.player?.playerStats?.games, actual: index?.games },
  { label: 'שערים', expected: teamPlayerRow.player?.playerStats?.goals, actual: index?.goals },
  { label: 'דקות', expected: teamPlayerRow.player?.playerStats?.minutes, actual: index?.minutes },
  { label: 'פרופילים מקצועיים', expected: teamPlayerRow.professionalProfileIds, actual: index?.scoutProfileIds },
])

const comparePlayerSeasonToIndex = ({ playerRow, index }) => buildMismatchFields([
  { label: 'עונה', expected: playerRow.seasonKey, actual: seasonKeyOf(index) },
  { label: 'מסמך שחקן', expected: playerRow.documentId, actual: clean(index?.playerDocumentId || index?.sourceDocumentId) },
  { label: 'מסמך קבוצה', expected: teamDocumentIdOf(playerRow.season), actual: teamDocumentIdOf(index) },
  { label: 'ליגה', expected: playerRow.season?.leagueId, actual: index?.leagueId },
  { label: 'משחקים', expected: playerRow.season?.playerStats?.games, actual: index?.games },
  { label: 'שערים', expected: playerRow.season?.playerStats?.goals, actual: index?.goals },
  { label: 'דקות', expected: playerRow.season?.playerStats?.minutes, actual: index?.minutes },
  { label: 'פרופילים מקצועיים', expected: getProfessionalProfileIds(playerRow.season), actual: index?.scoutProfileIds },
])

const issue = ({ type, message, collectionNames, documentIds, seasonKey, fields = [] }) => ({
  type,
  message,
  collectionNames,
  documentIds: unique(documentIds),
  seasonKey: clean(seasonKey),
  fields,
})


export async function buildDocumentRelationsCheck({
  relationId = '',
  snapshot = null,
} = {}) {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('בדיקת הקשרים דורשת Snapshot שהוכן על ידי Audit V2.')
  }

  const providedRows = snapshot.rows || {}
  const leagues = Array.isArray(providedRows.leagues) ? providedRows.leagues : []
  const teams = Array.isArray(providedRows.teams) ? providedRows.teams : []
  const players = Array.isArray(providedRows.players) ? providedRows.players : []
  const searchIndexes = Array.isArray(providedRows.searchIndexes)
    ? providedRows.searchIndexes
    : []

  const teamIndexes = searchIndexes.filter(row => clean(row.data?.entityType) === 'birthTeamSeason')
  const playerIndexes = searchIndexes.filter(row => clean(row.data?.entityType) === 'playerSeason')
  const teamSeasons = buildTeamSeasonRows(teams)
  const leagueSeasons = buildLeagueSeasonRows(leagues)
  const playerSeasons = buildPlayerSeasonRows(players)
  const teamPlayers = buildTeamPlayerRows(teamSeasons)

  const relations = {
    leagueTeams: makeRelation({
      id: 'leagueTeams',
      title: 'ליגות מול קבוצות',
      description: 'בודק שכל קבוצת שנתון ועונה קיימת בטבלת הליגה המתאימה ושאין קבוצות ליגה ללא מסמך קבוצה.',
    }),
    leagueTeamIndexes: makeRelation({
      id: 'leagueTeamIndexes',
      title: 'ליגות מול אינדקסי קבוצות',
      description: 'בודק שלכל קבוצת שנתון בטבלת ליגה קיים אינדקס קבוצה ועונה מתאים.',
    }),
    teamsTeamIndexes: makeRelation({
      id: 'teamsTeamIndexes',
      title: 'קבוצות מול אינדקסי קבוצות',
      description: 'בודק קיום והתאמה של כל אינדקס קבוצה למצב העונתי במסמך הקבוצה.',
    }),
    teamsPlayers: makeRelation({
      id: 'teamsPlayers',
      title: 'קבוצות מול מסמכי שחקנים',
      description: 'בודק שלשחקן שזכאי למסמך לפי מדיניות המעקב קיים מסמך שחקן, ושמסמך קיים משקף את אותה עונה וקבוצה.',
    }),
    teamsPlayerIndexes: makeRelation({
      id: 'teamsPlayerIndexes',
      title: 'קבוצות מול אינדקסי שחקנים',
      description: 'בודק שכל שחקן ועונה בקבוצה מיוצגים באינדקס השחקנים עם הנתונים הקנוניים של הקבוצה.',
    }),
    playersPlayerIndexes: makeRelation({
      id: 'playersPlayerIndexes',
      title: 'מסמכי שחקנים מול אינדקסי שחקנים',
      description: 'בודק שכל עונה במסמך שחקן מיוצגת באינדקס ושקישור המסמך והנתונים תואמים.',
    }),
  }

  const teamSeasonByKey = new Map(teamSeasons.map(row => [row.key, row]))
  const playerDocsByIdentityToken = indexBy(players, row => unique([
    `doc:${row.id}`,
    `expectedDoc:${row.id}`,
    ...buildPlayerIdentityTokens({
      ...row.data,
      playerDocumentId: row.id,
    }),
  ]))
  const playerSeasonsByDocSeason = new Map(playerSeasons.map(row => [row.key, row]))
  const teamIndexesByTeamSeason = indexBy(teamIndexes, row => [
    `${teamDocumentIdOf(row.data)}::${seasonKeyOf(row.data)}`,
  ])
  const playerIndexesByIdentityKey = indexBy(playerIndexes, row => {
    const identityKey = buildPlayerIndexIdentityKey(row)
    return identityKey ? [identityKey] : []
  })
  const playerIndexesByPlayerDocSeason = indexBy(playerIndexes, row => {
    const playerDocumentId = clean(row.data?.playerDocumentId || row.data?.sourceDocumentId)
    return playerDocumentId ? [`${playerDocumentId}::${seasonKeyOf(row.data)}`] : []
  })
  const playerIndexesByTeamSeason = indexBy(playerIndexes, row => [
    `${teamDocumentIdOf(row.data)}::${seasonKeyOf(row.data)}`,
  ])

  // League <-> Team and League <-> Team Index.
  leagueSeasons.forEach(leagueRow => {
    const tableRows = Array.isArray(leagueRow.season?.tableRank) ? leagueRow.season.tableRank : []
    tableRows.forEach(tableRow => {
      const teamMatches = teamSeasons.filter(teamRow => (
        clean(teamRow.season?.leagueId) === leagueRow.leagueId &&
        teamRow.seasonKey === leagueRow.seasonKey &&
        (
          clean(teamRow.document?.birthTeamId) === clean(tableRow?.birthTeamId) ||
          clean(teamRow.document?.teamId) === clean(tableRow?.teamId)
        )
      ))
      addRelationCheck({
        relation: relations.leagueTeams,
        issue: teamMatches.length === 1
          ? null
          : issue({
            type: teamMatches.length ? 'duplicate_team_match' : 'missing_team_document',
            message: teamMatches.length
              ? 'נמצאו כמה מסמכי קבוצה לאותה קבוצת ליגה ועונה.'
              : 'קבוצה שמופיעה בטבלת הליגה אינה מחוברת למסמך קבוצה.',
            collectionNames: ['dbLeagues', 'dbBirthTeams'],
            documentIds: [leagueRow.documentId, ...teamMatches.map(row => row.documentId)],
            seasonKey: leagueRow.seasonKey,
          }),
      })

      const matchingTeamIndexes = teamIndexes.filter(indexRow => (
        clean(indexRow.data?.leagueId) === leagueRow.leagueId &&
        seasonKeyOf(indexRow.data) === leagueRow.seasonKey &&
        (
          clean(indexRow.data?.birthTeamId) === clean(tableRow?.birthTeamId) ||
          clean(indexRow.data?.teamId) === clean(tableRow?.teamId)
        )
      ))
      addRelationCheck({
        relation: relations.leagueTeamIndexes,
        issue: matchingTeamIndexes.length === 1
          ? null
          : issue({
            type: matchingTeamIndexes.length ? 'duplicate_team_index' : 'missing_team_index',
            message: matchingTeamIndexes.length
              ? 'נמצאו כמה אינדקסי קבוצה לאותה קבוצה ועונה.'
              : 'חסר אינדקס קבוצה לקבוצה שמופיעה בטבלת הליגה.',
            collectionNames: ['dbLeagues', 'dbSearchIndexes'],
            documentIds: [leagueRow.documentId, ...matchingTeamIndexes.map(row => row.id)],
            seasonKey: leagueRow.seasonKey,
          }),
      })
    })
  })

  teamSeasons.forEach(teamRow => {
    const leagueKey = `${clean(teamRow.season?.leagueId)}::${teamRow.seasonKey}`
    const leagueRow = leagueSeasons.find(row => row.key === leagueKey)
    const tableMatch = leagueRow && (Array.isArray(leagueRow.season?.tableRank) ? leagueRow.season.tableRank : [])
      .some(tableRow => (
        clean(tableRow?.birthTeamId) === clean(teamRow.document?.birthTeamId) ||
        clean(tableRow?.teamId) === clean(teamRow.document?.teamId)
      ))

    addRelationCheck({
      relation: relations.leagueTeams,
      issue: leagueRow && tableMatch
        ? null
        : issue({
          type: leagueRow ? 'team_missing_from_league_table' : 'missing_league_season',
          message: leagueRow
            ? 'מסמך הקבוצה קיים אך הקבוצה אינה מופיעה בטבלת הליגה של אותה עונה.'
            : 'מסמך הקבוצה מפנה לליגה או לעונה שלא נמצאה במסמכי הליגה.',
          collectionNames: ['dbBirthTeams', 'dbLeagues'],
          documentIds: [teamRow.documentId, leagueRow?.documentId],
          seasonKey: teamRow.seasonKey,
        }),
    })
  })

  teamIndexes.forEach(indexRow => {
    const leagueKey = `${clean(indexRow.data?.leagueId)}::${seasonKeyOf(indexRow.data)}`
    const leagueRow = leagueSeasons.find(row => row.key === leagueKey)
    const tableMatch = leagueRow && (Array.isArray(leagueRow.season?.tableRank) ? leagueRow.season.tableRank : [])
      .some(tableRow => (
        clean(tableRow?.birthTeamId) === clean(indexRow.data?.birthTeamId) ||
        clean(tableRow?.teamId) === clean(indexRow.data?.teamId)
      ))

    addRelationCheck({
      relation: relations.leagueTeamIndexes,
      issue: leagueRow && tableMatch
        ? null
        : issue({
          type: leagueRow ? 'team_index_missing_from_league_table' : 'team_index_missing_league_season',
          message: leagueRow
            ? 'אינדקס הקבוצה קיים אך אינו תואם לקבוצה בטבלת הליגה.'
            : 'אינדקס הקבוצה מפנה לליגה או לעונה שלא נמצאה.',
          collectionNames: ['dbSearchIndexes', 'dbLeagues'],
          documentIds: [indexRow.id, leagueRow?.documentId],
          seasonKey: seasonKeyOf(indexRow.data),
        }),
    })
  })

  // Team <-> Team Index.
  teamSeasons.forEach(teamRow => {
    const matches = teamIndexesByTeamSeason.get(teamRow.key) || []
    let relationIssue = null
    if (matches.length !== 1) {
      relationIssue = issue({
        type: matches.length ? 'duplicate_team_index' : 'missing_team_index',
        message: matches.length ? 'נמצאו כמה אינדקסים למסמך הקבוצה ולעונה.' : 'חסר אינדקס קבוצה לעונה.',
        collectionNames: ['dbBirthTeams', 'dbSearchIndexes'],
        documentIds: [teamRow.documentId, ...matches.map(row => row.id)],
        seasonKey: teamRow.seasonKey,
      })
    } else {
      const fields = compareTeamSeasonToTeamIndex({ teamRow, index: matches[0].data })
      if (fields.length) {
        relationIssue = issue({
          type: 'team_index_mismatch',
          message: 'אינדקס הקבוצה קיים אבל אינו תואם למצב הקבוצה.',
          collectionNames: ['dbBirthTeams', 'dbSearchIndexes'],
          documentIds: [teamRow.documentId, matches[0].id],
          seasonKey: teamRow.seasonKey,
          fields,
        })
      }
    }
    addRelationCheck({ relation: relations.teamsTeamIndexes, issue: relationIssue })
  })

  teamIndexes.forEach(indexRow => {
    const key = `${teamDocumentIdOf(indexRow.data)}::${seasonKeyOf(indexRow.data)}`
    if (teamSeasonByKey.has(key)) return
    addRelationCheck({
      relation: relations.teamsTeamIndexes,
      issue: issue({
        type: 'orphan_team_index',
        message: 'אינדקס קבוצה מצביע לעונה שאינה קיימת במסמך הקבוצה.',
        collectionNames: ['dbSearchIndexes', 'dbBirthTeams'],
        documentIds: [indexRow.id, teamDocumentIdOf(indexRow.data)],
        seasonKey: seasonKeyOf(indexRow.data),
      }),
    })
  })

  // Team <-> Player Document, profile-only eligibility.
  const expectedProfiledPlayerDocumentIds = new Set()
  teamPlayers.forEach(teamPlayerRow => {
    if (!teamPlayerRow.shouldHavePlayerDocument) return

    const expectedId = teamPlayerRow.expectedPlayerDocumentId
    const playerCandidateMap = new Map()
    unique([
      ...teamPlayerRow.identityTokens,
      expectedId ? `doc:${expectedId}` : '',
      expectedId ? `expectedDoc:${expectedId}` : '',
    ]).forEach(token => {
      ;(playerDocsByIdentityToken.get(token) || []).forEach(row => {
        playerCandidateMap.set(row.id, row)
      })
    })
    const playerCandidates = [...playerCandidateMap.values()]
    const resolvedPlayerDocumentId = playerCandidates.length === 1
      ? playerCandidates[0].id
      : ''
    if (resolvedPlayerDocumentId) {
      expectedProfiledPlayerDocumentIds.add(resolvedPlayerDocumentId)
    }
    let relationIssue = null

    if (!expectedId && !teamPlayerRow.identityTokens.length) {
      relationIssue = issue({
        type: 'missing_player_identity',
        message: 'לשחקן שזכאי למסמך שחקן אין מזהה שמאפשר לקבוע את המסמך הצפוי.',
        collectionNames: ['dbBirthTeams'],
        documentIds: [teamPlayerRow.documentId],
        seasonKey: teamPlayerRow.seasonKey,
      })
    } else if (playerCandidates.length > 1) {
      relationIssue = issue({
        type: 'ambiguous_player_document_identity',
        message: 'נמצאו כמה מסמכי שחקן שמתאימים לאותה זהות בקבוצה, ולכן לא ניתן לקבוע התאמה בטוחה.',
        collectionNames: ['dbBirthTeams', 'dbPlayers'],
        documentIds: [teamPlayerRow.documentId, ...playerCandidates.map(row => row.id)],
        seasonKey: teamPlayerRow.seasonKey,
      })
    } else if (!resolvedPlayerDocumentId) {
      relationIssue = issue({
        type: 'missing_player_document',
        message: 'לשחקן שזכאי למסמך לפי מדיניות המעקב חסר מסמך שחקן.',
        collectionNames: ['dbBirthTeams', 'dbPlayers'],
        documentIds: [teamPlayerRow.documentId, expectedId],
        seasonKey: teamPlayerRow.seasonKey,
      })
    } else {
      const playerSeason = playerSeasonsByDocSeason.get(`${resolvedPlayerDocumentId}::${teamPlayerRow.seasonKey}`)
      if (!playerSeason) {
        relationIssue = issue({
          type: 'missing_player_season_projection',
          message: 'מסמך השחקן קיים אך חסרה בו העונה שמופיעה במסמך הקבוצה.',
          collectionNames: ['dbBirthTeams', 'dbPlayers'],
          documentIds: [teamPlayerRow.documentId, resolvedPlayerDocumentId],
          seasonKey: teamPlayerRow.seasonKey,
        })
      } else {
        const fields = compareTeamPlayerToPlayerSeason({
          teamPlayerRow,
          playerSeason: playerSeason.season,
        })
        if (fields.length) {
          relationIssue = issue({
            type: 'player_projection_mismatch',
            message: 'מסמך השחקן קיים אבל העונה שבו אינה תואמת למצב הקנוני בקבוצה.',
            collectionNames: ['dbBirthTeams', 'dbPlayers'],
            documentIds: [teamPlayerRow.documentId, resolvedPlayerDocumentId],
            seasonKey: teamPlayerRow.seasonKey,
            fields,
          })
        }
      }
    }

    addRelationCheck({ relation: relations.teamsPlayers, issue: relationIssue })
  })

  players.forEach(playerRow => {
    if (expectedProfiledPlayerDocumentIds.has(playerRow.id)) return
    if (shouldHavePlayerDocument(playerRow.data)) return
    addRelationCheck({
      relation: relations.teamsPlayers,
      issue: issue({
        type: 'player_document_without_tracking_truth',
        message: 'קיים מסמך שחקן שאין עבורו סיבת מעקב תקפה לפי מדיניות מסמכי השחקנים.',
        collectionNames: ['dbPlayers', 'dbBirthTeams'],
        documentIds: [playerRow.id],
        seasonKey: '',
      }),
    })
  })

  // Team <-> Player Index.
  const matchedPlayerIndexIds = new Set()
  teamPlayers.forEach(teamPlayerRow => {
    const identityKey = buildTeamPlayerIndexKey(teamPlayerRow)
    const matches = identityKey
      ? [...(playerIndexesByIdentityKey.get(identityKey) || [])]
      : []
    let relationIssue = null

    if (!teamPlayerRow.hasCompletePlayerSeasonIndexIdentity) {
      relationIssue = issue({
        type: 'player_index_identity_incomplete',
        message: 'לשחקן בקבוצה חסרה זהות מלאה הנדרשת ליצירת אינדקס שחקן.',
        collectionNames: ['dbBirthTeams'],
        documentIds: [teamPlayerRow.documentId],
        seasonKey: teamPlayerRow.seasonKey,
      })
    } else if (!matches.length && teamPlayerRow.skipsNewPlayerSeasonIndex) {
      relationIssue = null
    } else if (matches.length !== 1) {
      relationIssue = issue({
        type: matches.length ? 'duplicate_player_index' : 'missing_player_index',
        message: matches.length
          ? 'נמצאו כמה אינדקסי שחקן לאותו שחקן, קבוצה ועונה.'
          : 'חסר אינדקס שחקן לשחקן שמופיע במסמך הקבוצה ונדרש עבורו אינדקס.',
        collectionNames: ['dbBirthTeams', 'dbSearchIndexes'],
        documentIds: [teamPlayerRow.documentId, ...matches.map(row => row.id)],
        seasonKey: teamPlayerRow.seasonKey,
      })
    } else {
      matchedPlayerIndexIds.add(matches[0].id)
      const fields = compareTeamPlayerToPlayerIndex({ teamPlayerRow, index: matches[0].data })
      if (fields.length) {
        relationIssue = issue({
          type: 'player_index_mismatch',
          message: 'אינדקס השחקן קיים אבל אינו תואם למצב השחקן בקבוצה.',
          collectionNames: ['dbBirthTeams', 'dbSearchIndexes'],
          documentIds: [teamPlayerRow.documentId, matches[0].id],
          seasonKey: teamPlayerRow.seasonKey,
          fields,
        })
      }

    }

    addRelationCheck({ relation: relations.teamsPlayerIndexes, issue: relationIssue })
  })

  playerIndexes.forEach(indexRow => {
    if (matchedPlayerIndexIds.has(indexRow.id)) return
    addRelationCheck({
      relation: relations.teamsPlayerIndexes,
      issue: issue({
        type: 'player_index_without_team_truth',
        message: 'קיים אינדקס שחקן שלא נמצאה עבורו רשומת שחקן תואמת במסמך הקבוצה ובעונה.',
        collectionNames: ['dbSearchIndexes', 'dbBirthTeams'],
        documentIds: [indexRow.id, teamDocumentIdOf(indexRow.data)],
        seasonKey: seasonKeyOf(indexRow.data),
      }),
    })
  })

  // Player Document <-> Player Index.
  playerSeasons.forEach(playerRow => {
    const matches = playerIndexesByPlayerDocSeason.get(playerRow.key) || []
    let relationIssue = null
    if (matches.length !== 1) {
      relationIssue = issue({
        type: matches.length ? 'duplicate_player_index_for_document' : 'missing_player_index_for_document',
        message: matches.length
          ? 'נמצאו כמה אינדקסים לאותה עונה במסמך השחקן.'
          : 'לעונה במסמך השחקן חסר אינדקס שחקן.',
        collectionNames: ['dbPlayers', 'dbSearchIndexes'],
        documentIds: [playerRow.documentId, ...matches.map(row => row.id)],
        seasonKey: playerRow.seasonKey,
      })
    } else {
      const fields = comparePlayerSeasonToIndex({ playerRow, index: matches[0].data })
      if (fields.length) {
        relationIssue = issue({
          type: 'player_document_index_mismatch',
          message: 'אינדקס השחקן אינו תואם לעונה במסמך השחקן.',
          collectionNames: ['dbPlayers', 'dbSearchIndexes'],
          documentIds: [playerRow.documentId, matches[0].id],
          seasonKey: playerRow.seasonKey,
          fields,
        })
      }
    }
    addRelationCheck({ relation: relations.playersPlayerIndexes, issue: relationIssue })
  })

  // Aggregate Player Index counts are intentionally not persisted or reconciled.
  // Presence/duplicates are checked per canonical Team Player above.

  const relationList = Object.values(relations)
    .filter(relation => !relationId || relation.id === relationId)
    .map(relation => ({
      ...relation,
      exactRate: relation.checked
        ? Math.round((relation.exact / relation.checked) * 1000) / 10
        : null,
      issuesTruncated: relation.issueCount > relation.issues.length,
    }))
  const totalChecked = relationList.reduce((sum, relation) => sum + relation.checked, 0)
  const totalExact = relationList.reduce((sum, relation) => sum + relation.exact, 0)
  const totalAffected = relationList.reduce((sum, relation) => sum + relation.affected, 0)

  return {
    generatedAt: new Date().toISOString(),
    relationId: clean(relationId),
    readCollections: Array.isArray(snapshot.readCollections)
      ? snapshot.readCollections
      : [],
    readsUsed: Number(snapshot.readsUsed || 0),
    collections: {
      dbLeagues: leagues.length,
      dbBirthTeams: teams.length,
      dbPlayers: players.length,
      dbSearchIndexes: searchIndexes.length,
      teamIndexes: teamIndexes.length,
      playerIndexes: playerIndexes.length,
    },
    checked: totalChecked,
    exact: totalExact,
    affected: totalAffected,
    exactRate: totalChecked
      ? Math.round((totalExact / totalChecked) * 1000) / 10
      : 100,
    relations: relationList,
    policy: {
      playerDocumentEligibility: 'tracking_reasons',
      sourceOfTruth: 'shouldHavePlayerDocument',
    },
  }
}
