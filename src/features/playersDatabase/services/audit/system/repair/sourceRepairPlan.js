// src/features/playersDatabase/services/audit/system/repair/sourceRepairPlan.js

import {
  buildPlayerId,
  buildPlayerSeasonDocumentId,
  buildTeamId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../../../../domain/identity/index.js'
import { buildPlayerRootDocument } from '../../../../domain/playerRoot.builder.js'
import { buildTeamRoot } from '../../../../domain/roster/rosterWritePlan.builder.js'
import { buildClubProfileDocument } from '../../../../domain/clubProfile.builder.js'
import { SEASON_STATUS } from '../../../../model/shared/season.model.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const rows = value => (Array.isArray(value) ? value : [])
const find = (actual, target, id) => rows(actual[target]).find(row => clean(row.id) === clean(id)) || null
const data = row => object(row && row.data)
const guard = (target, row) => ({ target, documentId: row.id, before: row.data })
const unsupported = () => ({ supported: false, allowed: false, fields: [], changes: [], guards: [] })
const plan = (label, description, extra = {}) => ({
  supported: true,
  allowed: false,
  label,
  description,
  reason: '',
  fields: [],
  changes: [],
  guards: [],
  ...extra,
})

const leagueSeasonEntries = (actual, teamId, seasonId) => rows(actual.leagues).flatMap(row => {
  const season = object(data(row).seasonsById)[seasonId]
  return season && object(object(season.table).teamsById)[teamId]
    ? [{ row, season }]
    : []
})

const leagueReload = ({ leagueId, seasonId, seasonKey = '', reason }) => plan(
  'טען מחדש את מקור הליגה',
  'יש לפתוח את עונת הליגה ולטעון מחדש את נתוני המקור. נתוני התצוגה אינם מקור לשחזור.',
  {
    reason,
    reload: {
      kind: 'league',
      route: `/players-database/leagues?openLeague=${encodeURIComponent(leagueId)}&auditSeasonId=${encodeURIComponent(seasonId)}&repairReload=1`,
      label: 'פתח טעינת ליגה',
      reason,
      context: { leagueId, seasonId, seasonKey, repairReload: true },
    },
  },
)

const rosterReload = ({ actual, teamId, seasonId, leagueId = '', reason }) => {
  const entries = leagueSeasonEntries(actual, teamId, seasonId)
  const entry = entries.length === 1 ? entries[0] : null
  const resolvedLeagueId = clean(entry && entry.row.id) || clean(leagueId)
  const seasonKey = clean(entry && entry.season.seasonKey)
  if (!resolvedLeagueId || !entry) {
    return leagueReload({
      leagueId: resolvedLeagueId,
      seasonId,
      reason: entries.length > 1
        ? 'יש להכריע תחילה לאיזו ליגה שייכת הקבוצה בעונה זו.'
        : 'יש לטעון תחילה מקור ליגה שמכיל את הקבוצה בעונה המבוקשת.',
    })
  }
  return plan('טען מחדש את מקור הסגל', 'מסמך עונת הקבוצה נוצר מתוך טעינת סגל מאושרת.', {
    reason,
    guards: [guard('leagues', entry.row)],
    reload: {
      kind: 'roster',
      route: `/players-database/leagues/${encodeURIComponent(resolvedLeagueId)}/teams/${encodeURIComponent(teamId)}?auditSeason=${encodeURIComponent(seasonKey)}&openRosterImport=1&repairReload=1`,
      label: 'פתח טעינת סגל',
      reason,
      context: { leagueId: resolvedLeagueId, teamId, seasonId, seasonKey, repairReload: true },
    },
  })
}

const requireTeamSeasonIdentity = row => {
  const identity = object(data(row).identity)
  const teamId = buildTeamId(identity)
  const seasonId = requireSeasonId(identity.seasonId)
  const documentId = buildTeamSeasonDocumentId({ teamId, seasonId })
  if (
    clean(identity.teamId) !== teamId || clean(identity.teamSeasonDocumentId) !== documentId ||
    clean(row.id) !== documentId || !clean(identity.leagueId) || !clean(identity.seasonKey) ||
    !Object.values(SEASON_STATUS).includes(clean(identity.seasonStatus))
  ) throw new Error('יש לתקן תחילה את זהות מסמך עונת הקבוצה')
  return identity
}

const buildMissingTeamRootPlan = ({ actual, finding }) => {
  const selected = find(actual, 'teamSeasons', finding.documentId)
  if (!selected) return unsupported()
  const identity = object(data(selected).identity)
  const teamId = clean(identity.teamId)
  if (find(actual, 'teamRoots', teamId)) return unsupported()
  const result = plan('שחזר מסמך קבוצה ראשי', 'זהות הקבוצה וההפניות לעונות ייבנו ממסמכי עונת הקבוצה הקנוניים. הערות שנמחקו אינן משוחזרות.')
  try {
    const sources = rows(actual.teamSeasons).filter(row => clean(data(row).identity && data(row).identity.teamId) === teamId)
    let document = null
    const seenSeasons = new Set()
    sources.forEach(row => {
      const sourceIdentity = requireTeamSeasonIdentity(row)
      if (seenSeasons.has(sourceIdentity.seasonId)) throw new Error('קיימות עונות כפולות לזהות הקבוצה')
      seenSeasons.add(sourceIdentity.seasonId)
      document = buildTeamRoot({
        team: sourceIdentity,
        season: sourceIdentity,
        leagueId: sourceIdentity.leagueId,
        existingTeamRoot: document,
        teamId,
        teamSeasonDocumentId: row.id,
        createdAt: null,
        updatedAt: null,
      })
    })
    return {
      ...result,
      allowed: true,
      guards: sources.map(row => guard('teamSeasons', row)),
      changes: [{ target: 'teamRoots', documentId: teamId, before: null, after: document, summary: 'יצירת זהות קבוצה והפניות לעונות קיימות' }],
    }
  } catch (error) {
    return { ...result, reason: error.message }
  }
}

const hasPlayer = (teamSeason, playerId) => ['roster', 'stats', 'scouting', 'manual'].some(section => (
  Object.prototype.hasOwnProperty.call(object(object(teamSeason[section]).playersById), playerId)
))

const buildMissingPlayerRootPlan = ({ actual, finding }) => {
  const playerId = clean(finding.playerId || finding.documentId)
  if (find(actual, 'playerRoots', playerId)) return unsupported()
  const result = plan('שחזר מסמך שחקן ראשי', 'זהות השחקן תיבנה מרשומת הסגל הקנונית וההפניות ממסמכי הקבוצות. מידע ידני שנמחק אינו משוחזר.')
  try {
    const selected = find(actual, 'teamSeasons', finding.relatedDocumentId)
    if (!selected) return { ...result, reason: 'מקור עונת הקבוצה חסר' }
    const selectedIdentity = requireTeamSeasonIdentity(selected)
    const selectedData = data(selected)
    const hasStats = Object.prototype.hasOwnProperty.call(object(object(selectedData.stats).playersById), playerId)
    const hasScouting = Object.prototype.hasOwnProperty.call(object(object(selectedData.scouting).playersById), playerId)
    if (!hasStats && !hasScouting) return { ...result, reason: 'הופעת שחקן בסגל בלבד אינה מאפשרת יצירת מסמך שחקן ראשי' }
    const rosterPlayer = object(object(object(selectedData.roster).playersById)[playerId])
    const birthYear = Number(playerId.split('__')[1])
    let rosterIdentityMatches = false
    try {
      rosterIdentityMatches = buildPlayerId({ birthYear, externalPlayerId: rosterPlayer.externalPlayerId }) === playerId
    } catch (_error) {
      rosterIdentityMatches = false
    }
    if (
      (clean(rosterPlayer.playerId) && clean(rosterPlayer.playerId) !== playerId) || !clean(rosterPlayer.fullName) ||
      !rosterIdentityMatches
    ) {
      return rosterReload({
        actual,
        teamId: selectedIdentity.teamId,
        seasonId: selectedIdentity.seasonId,
        leagueId: selectedIdentity.leagueId,
        reason: 'יש להשלים ברשומת הסגל את זהות השחקן לפני שחזור המסמך הראשי.',
      })
    }
    const sources = rows(actual.teamSeasons).filter(row => hasPlayer(data(row), playerId))
    const seasonRefsById = {}
    sources.forEach(row => {
      const identity = requireTeamSeasonIdentity(row)
      const seasonRef = {
        seasonKey: clean(identity.seasonKey),
        playerSeasonDocumentId: buildPlayerSeasonDocumentId({ playerId, seasonId: identity.seasonId }),
        seasonStatus: clean(identity.seasonStatus),
      }
      const previous = seasonRefsById[identity.seasonId]
      if (previous && (previous.seasonStatus !== seasonRef.seasonStatus || previous.seasonKey !== seasonRef.seasonKey)) {
        throw new Error('מקורות הקבוצות אינם מסכימים על זהות עונת השחקן')
      }
      seasonRefsById[identity.seasonId] = seasonRef
    })
    return {
      ...result,
      allowed: true,
      guards: sources.map(row => guard('teamSeasons', row)),
      changes: [{
        target: 'playerRoots',
        documentId: playerId,
        before: null,
        after: buildPlayerRootDocument({ playerId, rosterPlayer, seasonRefsById, updatedAt: null }),
        summary: 'יצירת זהות שחקן והפניות לעונות קיימות',
      }],
    }
  } catch (error) {
    return { ...result, reason: error.message }
  }
}

const CLUB_FIELDS = [
  { name: 'officialName', label: 'שם רשמי', type: 'text', required: true },
  { name: 'displayName', label: 'שם לתצוגה', type: 'text', required: true },
  { name: 'shortName', label: 'שם קצר', type: 'text' },
  { name: 'sourceName', label: 'שם במקור', type: 'text' },
  { name: 'externalClubId', label: 'מזהה מועדון חיצוני', type: 'text' },
  { name: 'clubUrl', label: 'כתובת מועדון', type: 'text' },
  { name: 'aliases', label: 'שמות נוספים (מופרדים בפסיקים)', type: 'text' },
  { name: 'searchAliases', label: 'שמות לחיפוש (מופרדים בפסיקים)', type: 'text' },
  { name: 'clubLevel', label: 'רמת מועדון', type: 'number' },
  { name: 'clubStrengthLevel', label: 'עוצמת מועדון', type: 'number' },
]

const buildMissingClubPlan = ({ actual, finding, input }) => {
  const clubId = clean(finding.clubId || (finding.target === 'clubProfiles' ? finding.documentId : finding.relatedDocumentId))
  if (!clubId || find(actual, 'clubProfiles', clubId)) return unsupported()
  const result = plan('השלם את מקור המועדון', 'יצירת פרופיל מועדון מהנתונים שתזין ותאשר. יש להזין גם מידע ידני שתרצה לשחזר; שדות ריקים יישמרו כריקים.', { fields: CLUB_FIELDS })
  try {
    const document = buildClubProfileDocument({ clubId, input })
    return {
      ...result,
      allowed: true,
      changes: [{ target: 'clubProfiles', documentId: clubId, before: null, after: document, summary: 'יצירת פרופיל מועדון מקלט מקור שאושר' }],
    }
  } catch (error) {
    return { ...result, reason: error.message }
  }
}

export const buildSourceRepairPlan = ({ actual = {}, finding = {}, input = {} } = {}) => {
  if (finding.owner === 'clubProfiles' && ['broken_relation', 'missing_canonical'].includes(finding.type)) {
    return buildMissingClubPlan({ actual, finding, input })
  }
  if (finding.target === 'playerRoots' && finding.type === 'missing_canonical') {
    return buildMissingPlayerRootPlan({ actual, finding })
  }
  if (finding.target === 'teamSeasons' && finding.type === 'broken_relation') {
    if (finding.owner === 'roster') return buildMissingTeamRootPlan({ actual, finding })
    if (finding.owner === 'league') {
      const source = find(actual, 'teamSeasons', finding.documentId)
      const identity = object(data(source).identity)
      const leagueId = clean(identity.leagueId || finding.leagueId)
      const seasonId = clean(identity.seasonId || finding.seasonId)
      if (object(data(find(actual, 'leagues', leagueId)).seasonsById)[seasonId]) return unsupported()
      return leagueReload({ leagueId, seasonId, seasonKey: clean(identity.seasonKey), reason: 'עונת הליגה הקנונית חסרה.' })
    }
  }
  if (finding.target === 'teamRoots' && finding.type === 'broken_relation' && finding.owner === 'roster') {
    const teamId = clean(finding.teamId || finding.documentId)
    const seasonId = clean(finding.seasonId)
    try {
      if (find(actual, 'teamSeasons', buildTeamSeasonDocumentId({ teamId, seasonId }))) return unsupported()
      return rosterReload({ actual, teamId, seasonId, reason: 'מסמך עונת הקבוצה חסר; יש לטעון מחדש את הסגל ממקור.' })
    } catch (error) {
      return plan('טען מחדש את מקור הסגל', 'יש להשלים את מקור עונת הקבוצה.', { reason: error.message })
    }
  }
  return unsupported()
}
