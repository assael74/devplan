import {
  buildLeagueTeamPerformanceProjection,
  buildLeaguesMasterLeagueEntry,
  buildLeaguesMasterSummary,
  buildTeamBalanceSearchIndexProjection,
  buildTeamPlayerSeasonalScoutProjection,
  buildTeamSeasonSearchMetrics,
  resolvePlayerTrackingReasons,
} from './audit.projections.js'
import { buildAuditFinding, buildAuditResult, AUDIT_FINDING_TYPE } from './audit.contract.js'
import { readPlayerDatabaseAuditSnapshot } from './audit.read.js'
import { normalizeAuditScope, AUDIT_SCOPE_TYPE } from './audit.scope.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const seasonKeyOf = row => clean(row?.seasonKey || row?.seasonId)
const teamIdOf = row => clean(row?.birthTeamDocumentId || row?.teamDocumentId)
const keyOf = row => `${teamIdOf(row)}::${seasonKeyOf(row)}`
const teamLeagueSeasonKeyOf = row => (
  `${teamIdOf(row)}::${clean(row?.leagueId || row?.league?.leagueId)}::${seasonKeyOf(row)}`
)
const stableValue = value => {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object') return Object.keys(value).sort().reduce((result, key) => ({ ...result, [key]: stableValue(value[key]) }), {})
  return value
}
const same = (left, right) => JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right))
const masterSeasonCounts = season => ({
  seasonKey: seasonKeyOf(season),
  teamsCount: Number(season?.teamsCount || 0),
  playersCount: Number(season?.playersCount || 0),
  playersWithScoutProfileCount: Number(season?.playersWithScoutProfileCount || 0),
  scoutProfilesCount: Number(season?.scoutProfilesCount || 0),
})
const masterLeagueCounts = league => ({
  leagueId: clean(league?.leagueId || league?.leagueDocumentId),
  seasons: (Array.isArray(league?.seasons) ? league.seasons : [])
    .map(masterSeasonCounts)
    .sort((left, right) => left.seasonKey.localeCompare(right.seasonKey)),
})
const masterSummaryCounts = summary => ({
  leaguesCount: Number(summary?.leaguesCount || 0),
  seasonsCount: Number(summary?.seasonsCount || 0),
  teamsCount: Number(summary?.teamsCount || 0),
  playersCount: Number(summary?.playersCount || 0),
  playersWithScoutProfileCount: Number(summary?.playersWithScoutProfileCount || 0),
  scoutProfilesCount: Number(summary?.scoutProfilesCount || 0),
})
const profilesOf = player => [
  ...(Array.isArray(player?.professionalScoutProfileIds) ? player.professionalScoutProfileIds : []),
  ...(Array.isArray(player?.preliminaryScoutProfileIds) ? player.preliminaryScoutProfileIds : []),
  ...(Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : []),
  player?.primaryScoutProfileId,
].filter(Boolean)
const profileIdOf = value => clean(
  value && typeof value === 'object'
    ? value.profileId || value.id || value.profile?.id
    : value
)
const normalizedProfilesOf = player => [...new Set(
  profilesOf(player).map(profileIdOf).filter(Boolean)
)].sort()
const sameProfiles = (left, right) => (
  JSON.stringify(normalizedProfilesOf(left)) ===
  JSON.stringify(normalizedProfilesOf(right))
)
const profileIdsOf = values => [...new Set(
  (Array.isArray(values) ? values : []).map(profileIdOf).filter(Boolean)
)].sort()
const samePlayerSearchIndexProfiles = (teamPlayer = {}, playerIndex = {}) => (
  JSON.stringify(profileIdsOf(teamPlayer.professionalScoutProfileIds)) ===
    JSON.stringify(profileIdsOf(playerIndex.scoutProfileIds)) &&
  JSON.stringify(profileIdsOf(teamPlayer.preliminaryScoutProfileIds)) ===
    JSON.stringify(profileIdsOf(playerIndex.scoutPreliminaryProfileIds)) &&
  clean(teamPlayer.primaryScoutProfileId) === clean(playerIndex.primaryScoutProfileId)
)
const hasTracking = player => resolvePlayerTrackingReasons(player).length > 0
const playerSeasonTeamIdOf = row => clean(
  row?.birthTeamDocumentId ||
  row?.teamDocumentId ||
  row?.birthTeamId ||
  row?.teamId
)
const playerSeasonLeagueIdOf = row => clean(row?.leagueId || row?.league?.leagueId)
const findPlayerSeasonRow = ({
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
const playerAuditDetails = ({ player = {}, rootsById = new Map() } = {}) => {
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
const playerKeyOf = player => clean(player?.matchedPlayerId || player?.playerId || player?.externalPlayerId)
const playerIndexKey = row => [
  playerKeyOf(row),
  seasonKeyOf(row),
  clean(row?.birthTeamId || row?.teamId),
  String(Number(row?.birthTeamSlot || row?.teamSlot || 1) || 1),
].join('::')
const inScope = ({ scope, row }) => {
  if (scope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM) return true
  const scopes = scope.type === AUDIT_SCOPE_TYPE.TEAM_SEASON ? [scope] : scope.scopes
  return scopes.some(item => item.teamDocumentId === teamIdOf(row) && item.seasonKey === seasonKeyOf(row))
}
const findLeagueSeason = ({ leagues = [], leagueId = '', seasonKey = '' } = {}) => {
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
const uniqueFindings = findings => {
  const seen = new Set()
  return findings.filter(finding => {
    const key = [finding.type, finding.entityType, finding.documentId, finding.relatedDocumentId, finding.teamDocumentId, finding.playerDocumentId, finding.seasonKey, finding.title].join('::')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function runPlayerDatabaseAudit({ scope } = {}) {
  const normalizedScope = normalizeAuditScope(scope)
  const snapshot = await readPlayerDatabaseAuditSnapshot()
  const { leagues, leaguesMaster, teams, teamSeasons, players, favorites, searchIndexes } = snapshot.rows
  const rootsById = new Map(teams.map(row => [row.id, row.data]))
  const playerDocsById = new Map(players.map(row => [row.id, row.data]))
  const findings = []
  const lifecycle = []
  const scopedSeasons = teamSeasons.filter(row => inScope({ scope: normalizedScope, row: row.data }))
  const teamIndexes = searchIndexes.filter(row => row.data?.entityType === 'birthTeamSeason')
  const playerIndexes = searchIndexes.filter(row => row.data?.entityType === 'playerSeason')
  const favoriteIds = new Set((favorites.find(row => row.id === 'players')?.data?.items || []).map(item => clean(item?.entityId)).filter(Boolean))
  const masterChecked = normalizedScope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM
  const masterAvailable = leaguesMaster.some(row => row.id === 'all')

  if (normalizedScope.type === AUDIT_SCOPE_TYPE.FULL_SYSTEM) {
    leagues.forEach(({ id, data }) => {
      const leagueId = clean(data?.leagueId || id)
      const current = data?.current && typeof data.current === 'object'
        ? data.current
        : null
      const history = Array.isArray(data?.history) ? data.history : []
      const currentSeasonKey = seasonKeyOf(current)

      if (current && clean(current.seasonStatus) === 'completed') {
        findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'leagueSeason',
          documentId: id,
          seasonKey: currentSeasonKey,
          title: 'עונה שהסתיימה נמצאת ב-current של מסמך הליגה',
          explanation: 'עונה שסומנה כהסתיימה חייבת להישמר כאובייקט מלא ב-history ולא להישאר ב-current.',
          source: 'League season lifecycle',
          expected: { location: 'history', seasonStatus: 'completed' },
          actual: { leagueId, location: 'current', seasonStatus: 'completed' },
        }))
      }

      if (currentSeasonKey && history.some(season => seasonKeyOf(season) === currentSeasonKey)) {
        findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'leagueSeason',
          documentId: id,
          seasonKey: currentSeasonKey,
          title: 'אותה עונת ליגה קיימת גם ב-current וגם ב-history',
          explanation: 'לאותה עונה מותר להיות מיקום אחד בלבד במסמך הליגה.',
          source: 'League season lifecycle',
          expected: { locations: ['current'] },
          actual: { leagueId, locations: ['current', 'history'] },
        }))
      }
    })

    const master = leaguesMaster.find(row => row.id === 'all')?.data
    if (master) {
      const expectedEntries = leagues.map(({ id, data }) => buildLeaguesMasterLeagueEntry({ id, ...data }))
      const actualEntries = Array.isArray(master.leagues) ? master.leagues : []
      expectedEntries.forEach(entry => {
        const expected = masterLeagueCounts(entry)
        const actualEntry = actualEntries.find(row => clean(row?.leagueId || row?.leagueDocumentId) === expected.leagueId)
        const actual = actualEntry ? masterLeagueCounts(actualEntry) : null
        if (!same(expected, actual)) findings.push(buildAuditFinding({
          type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
          entityType: 'leaguesMasterLeague',
          documentId: 'all',
          relatedDocumentId: expected.leagueId,
          title: 'המאסטר של הליגה אינו תואם למסמך הליגה',
          source: 'League Documents → buildLeaguesMasterLeagueEntry',
          expected,
          actual,
        }))
      })
      const expectedSummary = masterSummaryCounts(buildLeaguesMasterSummary(expectedEntries))
      const actualSummary = masterSummaryCounts(master.summary)
      if (!same(expectedSummary, actualSummary)) findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'leaguesMaster',
        documentId: 'all',
        title: 'סיכום המאסטר אינו תואם למסמכי הליגה',
        source: 'League Documents → buildLeaguesMasterSummary',
        expected: expectedSummary,
        actual: actualSummary,
      }))
    }
  }

  teamIndexes.filter(row => !clean(row.data.teamSeasonDocumentId)).forEach(row => {
    const source = findLeagueSeason({
      leagues,
      leagueId: row.data?.leagueId,
      seasonKey: seasonKeyOf(row.data),
    })
    const isNotStarted = clean(source?.season?.seasonStatus) === 'not_started'
    lifecycle.push({
      entityType: 'team',
      documentId: row.id,
      teamDocumentId: teamIdOf(row.data),
      seasonKey: seasonKeyOf(row.data),
      status: isNotStarted ? 'league_only_not_started' : 'league_only',
    })
  })
  teams.filter(root => !(Array.isArray(root.data.seasons) && root.data.seasons.length)).forEach(root => {
    lifecycle.push({ entityType: 'team', documentId: root.id, teamDocumentId: root.id, seasonKey: '', status: 'root_without_seasons' })
  })

  // A league-only index is valid while a season has not started: it is the
  // league-table projection and must not be treated as a missing Team Season.
  // Its lifecycle fields still have to match the source league season.
  teamIndexes
    .filter(row => inScope({ scope: normalizedScope, row: row.data }))
    .forEach(row => {
      const source = findLeagueSeason({
        leagues,
        leagueId: row.data?.leagueId,
        seasonKey: seasonKeyOf(row.data),
      })
      if (!source) return

      const expected = buildTeamSeasonSearchMetrics({
        target: source.target,
        seasonStatus: source.season.seasonStatus,
        leagueTotalRound: source.season.leagueTotalRound,
        teamGamePlayed: row.data?.teamGamePlayed,
        points: row.data?.points,
        goalsFor: row.data?.goalsFor,
        goalsAgainst: row.data?.goalsAgainst,
      })
      const fields = [
        'seasonStatus',
        'normalizationStatus',
        'remainingTeamGames',
      ]
      const actualLifecycle = Object.fromEntries(fields.map(field => [field, row.data?.[field]]))
      const expectedLifecycle = Object.fromEntries(fields.map(field => [field, expected[field]]))

      if (!same(expectedLifecycle, actualLifecycle)) findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'teamSearchIndex',
        documentId: row.id,
        teamDocumentId: teamIdOf(row.data),
        seasonKey: seasonKeyOf(row.data),
        title: 'מצב עונת האינדקס אינו תואם למסמך הליגה',
        explanation: 'אינדקס ליגה של עונה שטרם החלה הוא תקין ללא עונת קבוצה, אך סטטוס העונה שלו חייב לשקף את מסמך הליגה.',
        source: 'League season → buildTeamSeasonSearchMetrics',
        expected: expectedLifecycle,
        actual: {
          ...actualLifecycle,
          leagueId: clean(row.data?.leagueId),
        },
      }))
    })

  scopedSeasons.forEach(({ id, data: season }) => {
    const teamId = teamIdOf(season)
    const seasonKey = seasonKeyOf(season)
    const root = rootsById.get(teamId)
    const status = clean(season.statsStatus) === 'loaded' ? 'stats_loaded' : 'roster_loaded'
    lifecycle.push({ entityType: 'team', documentId: id, teamDocumentId: teamId, seasonKey, status })
    if (!root) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.BROKEN_RELATION, entityType: 'teamSeason', documentId: id, relatedDocumentId: teamId, teamDocumentId: teamId, seasonKey, title: 'מסמך עונת קבוצה מצביע לקבוצה שאינה קיימת', explanation: 'לכל Team Season חייב להיות Team Root.' }))
    else if (!(root.seasons || []).some(entry => seasonKeyOf(entry) === seasonKey && clean(entry.seasonDocumentId) === id)) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.BROKEN_RELATION, entityType: 'teamRoot', documentId: teamId, relatedDocumentId: id, teamDocumentId: teamId, seasonKey, title: 'חסרה הפניה לעונת הקבוצה', explanation: 'Team Root חייב להפנות ל-Team Season שלו.' }))
    const matchingIndex = teamIndexes.filter(index => (
      teamLeagueSeasonKeyOf(index.data) === teamLeagueSeasonKeyOf(season)
    ))
    if (matchingIndex.length !== 1) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT, entityType: 'teamSearchIndex', documentId: id, teamDocumentId: teamId, seasonKey, title: 'חסר אינדקס קבוצה', explanation: 'סגל טעון מחייב Team SearchIndex אחד.' }))
    else if (clean(matchingIndex[0].data.teamSeasonDocumentId) !== id) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.BROKEN_RELATION, entityType: 'teamSearchIndex', documentId: matchingIndex[0].id, relatedDocumentId: id, teamDocumentId: teamId, seasonKey, title: 'אינדקס הקבוצה אינו מחובר לעונת הקבוצה', explanation: 'teamSeasonDocumentId אינו תואם.' }))
    const leagueSource = findLeagueSeason({
      leagues,
      leagueId: season.leagueId,
      seasonKey,
    })
    const expected = leagueSource ? buildLeagueTeamPerformanceProjection({
      league: leagueSource.league.data,
      season,
      target: leagueSource.target,
      team: { ...(root || {}), ...season },
    }) : null
    if (!expected) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.BROKEN_RELATION, entityType: 'teamSeason', documentId: id, teamDocumentId: teamId, seasonKey, title: 'עונת הקבוצה אינה מחוברת לטבלת ליגה', explanation: 'לא נמצאה ליגה, עונה או שורת טבלה מתאימה.' }))
    else {
      const actual = { teamGamePlayed: season.teamStats?.teamGamePlayed, goalsFor: season.teamStats?.goalsFor, goalsAgainst: season.teamStats?.goalsAgainst, goalsForPerGame: season.goalsForPerGame, goalsAgainstPerGame: season.goalsAgainstPerGame, tableRank: season.tableRank, tableAttackRank: season.tableAttackRank, tableDefenseRank: season.tableDefenseRank }
      if (!same(expected, actual)) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH, entityType: 'teamSeason', documentId: id, teamDocumentId: teamId, seasonKey, title: 'ביצועי הקבוצה אינם תואמים לטבלת הליגה', source: 'League table → buildLeagueTeamPerformanceProjection', expected, actual }))
      matchingIndex.forEach(index => {
        const indexActual = Object.fromEntries(Object.keys(expected).map(field => [field, index.data[field]]))
        if (!same(expected, indexActual)) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH, entityType: 'teamSearchIndex', documentId: index.id, relatedDocumentId: id, teamDocumentId: teamId, seasonKey, title: 'אינדקס הקבוצה אינו תואם לטבלת הליגה', source: 'League table → buildLeagueTeamPerformanceProjection', expected, actual: indexActual }))
      })
    }
    const expectedBalance = buildTeamBalanceSearchIndexProjection(season.teamBalance || {})
    matchingIndex.forEach(index => {
      const actualBalance = Object.fromEntries(Object.keys(expectedBalance).map(field => [field, index.data[field]]))
      if (!same(expectedBalance, actualBalance)) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH, entityType: 'teamSearchIndex', documentId: index.id, relatedDocumentId: id, teamDocumentId: teamId, seasonKey, title: 'Balance באינדקס הקבוצה אינו תואם לעונת הקבוצה', source: 'Team Season teamBalance → buildTeamBalanceSearchIndexProjection', expected: expectedBalance, actual: actualBalance }))
    })
    ;(Array.isArray(season.teamPlayers) ? season.teamPlayers : []).forEach(player => {
      const playerDocumentId = clean(player.playerDocumentId)
      const profiled = profilesOf(player).length > 0
      lifecycle.push({ entityType: 'player', documentId: playerDocumentId || clean(player.playerId || player.externalPlayerId), teamDocumentId: teamId, playerDocumentId, seasonKey, status: profiled ? 'profiled' : 'roster_only' })
      if (profiled && (!playerDocumentId || !playerDocsById.has(playerDocumentId))) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT, entityType: 'player', documentId: playerDocumentId, teamDocumentId: teamId, playerDocumentId, seasonKey, title: 'חסר מסמך שחקן', explanation: 'לשחקן שקיבל פרופיל סקאוט, כולל Preliminary, חייב להיות Player Document.', source: 'Team Season scout profile lifecycle' }))
      if (profiled && playerDocumentId && playerDocsById.has(playerDocumentId)) {
        const playerDocument = playerDocsById.get(playerDocumentId)
        const playerSeason = findPlayerSeasonRow({
          playerDocument,
          teamId,
          seasonKey,
          leagueId: season.leagueId,
        })

        if (!playerSeason) {
          findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.BROKEN_RELATION, entityType: 'player', documentId: playerDocumentId, relatedDocumentId: id, teamDocumentId: teamId, playerDocumentId, seasonKey, title: 'למסמך השחקן חסרה עונה תואמת', explanation: 'לשחקן עם פרופיל בעונה זו חייבת להיות אותה קבוצה ועונה גם במסמך השחקן.' }))
        } else if (!sameProfiles(player, playerSeason)) {
          findings.push(buildAuditFinding({
            type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
            entityType: 'player',
            documentId: playerDocumentId,
            relatedDocumentId: id,
            teamDocumentId: teamId,
            playerDocumentId,
            seasonKey,
            title: 'מסמך השחקן אינו תואם לעונת הקבוצה',
            explanation: 'פרופיל הסקאוט של אותה עונה וקבוצה חסר או שונה במסמך השחקן.',
            source: 'Team Season player scout profile → Player Document',
            expected: { scoutProfileIds: normalizedProfilesOf(player) },
            actual: {
              ...playerAuditDetails({ player: playerDocument, rootsById }),
              leagueId: clean(season.leagueId),
              scoutProfileIds: normalizedProfilesOf(playerSeason),
            },
          }))
        }
      }
      const expectedIndexKey = playerIndexKey({ ...player, ...season, birthTeamId: season.birthTeamId || root?.birthTeamId, birthTeamSlot: season.birthTeamSlot || root?.birthTeamSlot })
      const playerIndex = expectedIndexKey
        ? playerIndexes.find(index => playerIndexKey(index.data) === expectedIndexKey)
        : null
      if (clean(player.rosterStatus) !== 'retired' && expectedIndexKey && !playerIndex) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.MISSING_DOCUMENT, entityType: 'playerSearchIndex', documentId: '', teamDocumentId: teamId, playerDocumentId, seasonKey, title: 'חסר אינדקס שחקן', explanation: 'שחקן סגל עם זהות מלאה מחייב Player SearchIndex.' }))
      if (playerIndex && !samePlayerSearchIndexProfiles(player, playerIndex.data)) findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'playerSearchIndex',
        documentId: playerIndex.id,
        relatedDocumentId: id,
        teamDocumentId: teamId,
        playerDocumentId,
        seasonKey,
        title: 'אינדקס השחקן אינו תואם לעונת הקבוצה',
        explanation: 'פרופיל הסקאוט של אותה עונה וקבוצה חסר או שונה באינדקס השחקן.',
        source: 'Team Season player scout profile → Player SearchIndex',
        expected: {
          scoutProfileIds: profileIdsOf(player.professionalScoutProfileIds),
          scoutPreliminaryProfileIds: profileIdsOf(player.preliminaryScoutProfileIds),
          primaryScoutProfileId: clean(player.primaryScoutProfileId),
        },
        actual: {
          leagueId: clean(season.leagueId),
          scoutProfileIds: profileIdsOf(playerIndex.data.scoutProfileIds),
          scoutPreliminaryProfileIds: profileIdsOf(playerIndex.data.scoutPreliminaryProfileIds),
          primaryScoutProfileId: clean(playerIndex.data.primaryScoutProfileId),
        },
      }))
      const calculatedTeamPlayer = buildTeamPlayerSeasonalScoutProjection({
        player,
        season: {
          seasonId: season.seasonId || seasonKey,
          seasonKey,
          seasonStatus: season.seasonStatus,
          leagueId: season.leagueId,
        },
        team: { ...(root || {}), ...season },
      })
      if (!sameProfiles(player, calculatedTeamPlayer)) findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.SOURCE_MISMATCH,
        entityType: 'teamSeasonPlayer',
        documentId: id,
        relatedDocumentId: playerDocumentId,
        teamDocumentId: teamId,
        playerDocumentId,
        seasonKey,
        title: 'שחקן בעונת הקבוצה אינו תואם לחישוב הסקאוט',
        explanation: 'פרופיל הסקאוט השמור בשורת השחקן שונה מהחישוב על בסיס נתוני השחקן והקבוצה.',
        source: 'Player and Team Season data → Team Season player scout profile',
        expected: { scoutProfileIds: normalizedProfilesOf(calculatedTeamPlayer) },
        actual: {
          leagueId: clean(season.leagueId),
          scoutProfileIds: normalizedProfilesOf(player),
        },
      }))
    })
  })
  players.forEach(({ id, data }) => {
    const favorite = favoriteIds.has(clean(data.playerId))
    if (!hasTracking(data) && !favorite) {
      const details = playerAuditDetails({ player: data, rootsById })
      findings.push(buildAuditFinding({
        type: AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT,
        entityType: 'player',
        documentId: id,
        playerDocumentId: id,
        title: 'מסמך שחקן ללא סיבת מעקב',
        explanation: 'אין פרופיל סקאוט, Favorite, Watchlist או סיבת מעקב אחרת.',
        actual: details,
      }))
    }
  })
  players.forEach(({ id, data }) => {
    const appearsInRoster = scopedSeasons.some(season => (season.data.teamPlayers || []).some(player => clean(player.playerDocumentId) === id))
    if (!appearsInRoster && hasTracking(data)) lifecycle.push({ entityType: 'player', documentId: id, playerDocumentId: id, seasonKey: '', status: 'tracked_outside_current_roster' })
  })
  teamIndexes.filter(row => clean(row.data.teamSeasonDocumentId)).forEach(row => { if (!teamSeasons.some(season => season.id === clean(row.data.teamSeasonDocumentId))) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.BROKEN_RELATION, entityType: 'teamSearchIndex', documentId: row.id, relatedDocumentId: row.data.teamSeasonDocumentId, teamDocumentId: teamIdOf(row.data), seasonKey: seasonKeyOf(row.data), title: 'אינדקס קבוצה מצביע לעונה שאינה קיימת' })) })
  playerIndexes.forEach(index => {
    const indexKey = playerIndexKey(index.data)
    const owner = teamSeasons.find(season => (
      (Array.isArray(season.data.teamPlayers) ? season.data.teamPlayers : []).some(player => (
        playerIndexKey({ ...player, ...season.data, birthTeamId: season.data.birthTeamId || rootsById.get(teamIdOf(season.data))?.birthTeamId, birthTeamSlot: season.data.birthTeamSlot || rootsById.get(teamIdOf(season.data))?.birthTeamSlot }) === indexKey
      ))
    ))
    if (!owner) findings.push(buildAuditFinding({ type: AUDIT_FINDING_TYPE.UNEXPECTED_DOCUMENT, entityType: 'playerSearchIndex', documentId: index.id, teamDocumentId: teamIdOf(index.data), seasonKey: seasonKeyOf(index.data), title: 'אינדקס שחקן ללא שחקן סגל', explanation: 'אין Team Season עם שחקן תואם לאינדקס הזה.' }))
  })
  return buildAuditResult({
    scope: normalizedScope,
    generatedAt: snapshot.generatedAt,
    readsUsed: snapshot.readsUsed,
    checked: scopedSeasons.length + leaguesMaster.length + players.length + teamIndexes.length + playerIndexes.length,
    findings: uniqueFindings(findings),
    lifecycle,
    coverage: {
      leaguesMaster: {
        checked: masterChecked,
        available: masterAvailable,
        label: 'מאסטר הליגות מול מסמכי הליגה',
      },
    },
  })
}
