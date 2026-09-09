import { buildTeamPlayerSeasonalScoutProjection } from '../../../domain/projections/playerScout.projection.js'
import { buildTeamSeasonSearchMetrics } from '../../../domain/projections/searchIndexNormalization.projection.js'
import { TEAM_DATA_ISSUE_CODE } from './teamDataRepair.catalog.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const asNumber = value => Number(value || 0)

const getSeasonKey = item => clean(item?.seasonKey || item?.seasonId)
const getLeagueId = item => clean(item?.leagueId || item?.league?.leagueId)
const getLeagueSeasonKey = item => `${getLeagueId(item)}::${getSeasonKey(item)}`
const getTeamStats = item => item?.teamStats || {}
const hasTeamDocument = teamDocument => Boolean(clean(teamDocument?.id))
const getPlayerKey = player => clean(
  player?.playerDocumentId || player?.playerId || player?.externalPlayerId || player?.id
).replace(/^external__/, '')
const getPlayerName = player => clean(player?.fullName || player?.displayName || player?.name) || 'שחקן ללא שם'

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

const resolveLeagueSeason = ({ leagueDocument = {}, seasonKey = '' } = {}) => {
  const current = leagueDocument?.current || null
  const history = Array.isArray(leagueDocument?.history) ? leagueDocument.history : []

  if (current && getSeasonKey(current) === clean(seasonKey)) {
    return { season: current, target: 'current' }
  }

  const historical = history.find(item => getSeasonKey(item) === clean(seasonKey))
  if (!historical) return null

  return {
    season: {
      ...historical,
      seasonStatus: clean(historical.seasonStatus) || 'completed',
    },
    target: 'history',
  }
}

export const buildTeamDataRepairIssues = ({
  teamDocument = {},
  teamSeasons = [],
  teamSearchIndexes = [],
  indexesLoaded = false,
  leagueDocument = {},
} = {}) => {
  const issues = []
  const seasonRefs = new Map(
    (Array.isArray(teamDocument?.seasons) ? teamDocument.seasons : [])
      .map(item => [getSeasonKey(item), item])
      .filter(([seasonKey]) => seasonKey)
  )
  const seasonsByKey = new Map(
    (Array.isArray(teamSeasons) ? teamSeasons : [])
      .map(item => [getSeasonKey(item), item])
      .filter(([seasonKey]) => seasonKey)
  )
  const indexesByLeagueSeason = new Map(
    (Array.isArray(teamSearchIndexes) ? teamSearchIndexes : [])
      .map(item => [getLeagueSeasonKey(item), item])
      .filter(([leagueSeasonKey]) => leagueSeasonKey !== '::')
  )

  if (hasTeamDocument(teamDocument) && !clean(teamDocument?.displayName)) {
    issues.push({
      severity: 'danger',
      code: TEAM_DATA_ISSUE_CODE.ROOT_DISPLAY_NAME_MISSING,
      title: 'שם הקבוצה חסר במסמך הקבוצה',
      description: 'יש שם קבוצה בעונות או באינדקס, אך המסמך הראשי ריק.',
      action: 'להשלים את שם הקבוצה ממקור הליגה',
    })
  }

  seasonsByKey.forEach((season, seasonKey) => {
    const index = indexesByLeagueSeason.get(getLeagueSeasonKey(season))
    const seasonStats = getTeamStats(season)
    const teamId = clean(
      teamDocument?.birthTeamDocumentId ||
      teamDocument?.teamDocumentId ||
      teamDocument?.birthTeamId ||
      teamDocument?.id
    )
    const seasonInput = {
      seasonId: seasonKey,
      seasonKey,
      seasonStatus: clean(season.seasonStatus) || 'active',
      leagueId: getLeagueId(season),
    }
    const teamInput = {
      ...teamDocument,
      ...season,
      birthTeamId: teamId,
      birthTeamDocumentId: teamId,
      teamId,
      teamDocumentId: teamId,
    }

    ;(Array.isArray(season.teamPlayers) ? season.teamPlayers : []).forEach(player => {
      const playerKey = getPlayerKey(player)
      if (!playerKey) return

      const calculated = buildTeamPlayerSeasonalScoutProjection({
        player,
        team: teamInput,
        season: seasonInput,
      })

      if (!sameProfiles(player, calculated)) {
        issues.push({
          severity: 'danger',
          code: TEAM_DATA_ISSUE_CODE.TEAM_SEASON_PLAYER_SCOUT_PROFILE_MISMATCH,
          seasonKey,
          leagueId: getLeagueId(season),
          playerKey,
          title: `פרופיל ${getPlayerName(player)} אינו מסונכרן בעונת ${seasonKey}`,
          description: 'פרופיל הסקאוט בשורת השחקן אינו תואם לחישוב מתוך נתוני השחקן והקבוצה.',
          action: 'לעדכן רק את שורת השחקן במסמך עונת הקבוצה.',
        })
      }
    })

    if (!seasonRefs.has(seasonKey)) {
      issues.push({
        severity: 'danger',
        code: TEAM_DATA_ISSUE_CODE.ROOT_SEASON_REFERENCE_MISSING,
        seasonKey,
        leagueId: getLeagueId(season),
        title: `עונת ${seasonKey} חסרה במסמך הקבוצה`,
        description: 'מסמך העונה קיים, אך הקישור אליו חסר במסמך הקבוצה.',
        action: 'לחבר את העונה למסמך הקבוצה',
      })
    }

    if (indexesLoaded && !index) {
      issues.push({
        severity: 'warning',
        code: TEAM_DATA_ISSUE_CODE.TEAM_INDEX_MISSING,
        seasonKey,
        leagueId: getLeagueId(season),
        title: `חסר אינדקס לעונת ${seasonKey}`,
        description: 'לעונה יש מסמך קבוצה, אך אין לה מסמך אינדקס לחיפוש.',
        action: 'ליצור אינדקס מהנתונים הקיימים',
      })
      return
    }

    if (!indexesLoaded || !index) return

    const fields = [
      ['teamGamePlayed', 'משחקים'],
      ['goalsFor', 'שערי זכות'],
      ['goalsAgainst', 'שערי חובה'],
      ['points', 'נקודות'],
    ]
    const differences = fields
      .filter(([field]) => asNumber(seasonStats[field]) !== asNumber(index[field]))
      .map(([, label]) => label)

    if (differences.length) {
      issues.push({
        severity: 'danger',
        code: TEAM_DATA_ISSUE_CODE.TEAM_SEASON_STATS_MISMATCH,
        seasonKey,
        leagueId: getLeagueId(season),
        title: `נתוני עונת ${seasonKey} אינם תואמים`,
        description: `יש הבדל בין מסמך העונה לאינדקס: ${differences.join(', ')}.`,
        action: 'לסנכרן את ביצועי הקבוצה מטבלת הליגה',
      })
    }

    const seasonProfiles = asNumber(season?.scoutProfilesSummary?.total)
    const indexProfiles = asNumber(index?.scoutProfilesSummary?.total)

    if (seasonProfiles !== indexProfiles) {
      issues.push({
        severity: 'warning',
        code: TEAM_DATA_ISSUE_CODE.SCOUT_PROFILES_SUMMARY_MISMATCH,
        seasonKey,
        leagueId: getLeagueId(season),
        title: `סיכום הפרופילים בעונת ${seasonKey} שונה`,
        description: `בעונה רשומים ${seasonProfiles} פרופילים ובאינדקס ${indexProfiles}.`,
        action: 'לבדוק ולסנכרן את סיכום הפרופילים',
      })
    }
  })

  if (!indexesLoaded) return issues

  indexesByLeagueSeason.forEach(index => {
    const seasonKey = getSeasonKey(index)
    const seasonReference = seasonRefs.get(seasonKey)
    const seasonDocument = [...seasonsByKey.values()].find(season => (
      getLeagueSeasonKey(season) === getLeagueSeasonKey(index)
    ))

    if (
      !seasonReference &&
      !seasonDocument &&
      clean(index?.teamSeasonDocumentId)
    ) {
      issues.push({
        severity: 'danger',
        code: TEAM_DATA_ISSUE_CODE.TEAM_INDEX_ORPHANED,
        seasonKey,
        leagueId: getLeagueId(index),
        title: `קיים אינדקס לעונת ${seasonKey} ללא עונת קבוצה`,
        description: 'האינדקס קיים, אך אין מסמך עונה ואין קישור לעונה במסמך הקבוצה.',
        action: 'ליצור או לטעון את עונת הקבוצה',
      })
    }

    const leagueSeason = resolveLeagueSeason({ leagueDocument, seasonKey })
    if (!leagueSeason) return

    const expected = buildTeamSeasonSearchMetrics({
      target: leagueSeason.target,
      seasonStatus: leagueSeason.season.seasonStatus,
      leagueTotalRound: leagueSeason.season.leagueTotalRound,
      teamGamePlayed: index.teamGamePlayed,
      points: index.points,
      goalsFor: index.goalsFor,
      goalsAgainst: index.goalsAgainst,
    })

    if (
      clean(index?.seasonStatus) !== clean(expected.seasonStatus) ||
      clean(index?.normalizationStatus) !== clean(expected.normalizationStatus)
    ) {
      issues.push({
        severity: 'danger',
        code: TEAM_DATA_ISSUE_CODE.SEASON_STATUS_MISMATCH,
        seasonKey,
        leagueId: getLeagueId(index),
        title: `סטטוס אינדקס עונת ${seasonKey} אינו תואם לליגה`,
        description: `באינדקס: ${clean(index?.seasonStatus) || 'ריק'} / ${clean(index?.normalizationStatus) || 'ריק'}. לפי הליגה: ${expected.seasonStatus} / ${expected.normalizationStatus}.`,
        action: 'לעדכן רק את שדות הסטטוס המחושבים במסמך אינדקס הקבוצה.',
      })
    }
  })

  return issues
}
