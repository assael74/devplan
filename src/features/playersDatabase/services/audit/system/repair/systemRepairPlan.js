// src/features/playersDatabase/services/audit/system/repair/systemRepairPlan.js

import {
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamId,
  buildTeamSeasonDocumentId,
} from '../../../../domain/identity/index.js'
import { buildClubDirectoryProjection } from '../../../../domain/projections/club/clubDirectory.projection.js'
import { buildPlayerSeasonProjection } from '../../../../domain/stats/statsProjection.builder.js'
import { getTeamSeasonPlayerIds } from '../evaluate.js'
import { buildIdentityRepairPlan } from './identityRepairPlan.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const rows = value => (Array.isArray(value) ? value : [])
const find = (actual, target, id) => rows(actual[target]).find(row => clean(row.id) === clean(id))
const guard = (target, row) => ({ target, documentId: row.id, before: row.data })

const unsupported = () => ({
  supported: false, allowed: false, label: 'תיקון', description: '', reason: '',
  fields: [], changes: [], guards: [],
})

const blocked = reason => ({ ...unsupported(), supported: true, reason })

const ready = ({ label, description, changes, guards = [] }) => ({
  supported: true, allowed: true, label, description, reason: '',
  fields: [], changes, guards,
})

const change = (target, row, after, summary) => ({
  target, documentId: row.id, before: row.data, after, summary,
})

const directoryPlan = ({ actual, finding }) => {
  const profiles = rows(actual.clubProfiles)
  if (profiles.some(row => clean(row.data && row.data.clubId) !== clean(row.id))) {
    return blocked('יש לתקן תחילה את זהות פרופילי המועדונים לפני בניית הספרייה.')
  }
  const current = find(actual, 'clubsDirectory', 'all')
  const currentData = object(current && current.data)
  const projectedClubs = object(currentData.clubsById)
  const clubsById = Object.fromEntries(profiles.map(row => [row.id, buildClubDirectoryProjection({
    profile: row.data,
    updatedAt: object(projectedClubs[row.id]).updatedAt || null,
  })]))
  const changes = [{
    target: 'clubsDirectory',
    documentId: 'all',
    before: current ? current.data : null,
    after: { ...currentData, clubsById, updatedAt: currentData.updatedAt || null },
    summary: 'בניית ספריית המועדונים מפרופילי המועדונים הקנוניים',
  }]
  if (finding.type === 'unexpected_projection' && clean(finding.documentId) !== 'all') {
    const extra = find(actual, 'clubsDirectory', finding.documentId)
    if (!extra) return unsupported()
    changes.push(change('clubsDirectory', extra, null, 'הסרת מסמך ספרייה שמזההו אינו all'))
  }
  return ready({
    label: 'תיקון ספריית המועדונים',
    description: 'הספרייה תיבנה מחדש מכל פרופילי המועדונים. רשומות שאין להן פרופיל יוסרו מהספרייה בלבד.',
    changes,
    guards: profiles.map(row => guard('clubProfiles', row)),
  })
}

const teamSeasonRef = ({ data, documentId, previous = {} }) => {
  const identity = object(data.identity)
  return {
    ...previous,
    seasonKey: clean(identity.seasonKey),
    teamSeasonDocumentId: documentId,
    leagueId: clean(identity.leagueId),
    ageGroupId: clean(identity.ageGroupId),
    seasonStatus: clean(identity.seasonStatus),
  }
}

const repairTeamRootRef = ({ actual, finding }) => {
  const isRoot = finding.target === 'teamRoots'
  const root = find(actual, 'teamRoots', isRoot ? finding.documentId : finding.teamId)
  const seasonId = clean(finding.seasonId)
  const teamId = clean(isRoot ? finding.documentId : finding.teamId)
  if (!root || !teamId || !seasonId) return unsupported()
  const documentId = buildTeamSeasonDocumentId({ teamId, seasonId })
  const season = find(actual, 'teamSeasons', documentId)
  if (!season) return unsupported()
  const identity = object(season.data && season.data.identity)
  if (
    clean(identity.teamId) !== teamId || clean(identity.seasonId) !== seasonId ||
    clean(identity.teamSeasonDocumentId) !== documentId
  ) return blocked('יש לתקן תחילה את זהות עונת הקבוצה שאליה מפנים.')
  if (clean(object(root.data.identity).teamId) !== teamId) {
    return blocked('יש לתקן תחילה את זהות מסמך הקבוצה.')
  }
  const seasonRefsById = object(root.data.seasonRefsById)
  return ready({
    label: 'תיקון הפניית עונת הקבוצה',
    description: 'הפניית העונה במסמך הקבוצה תעודכן לפי עונת הקבוצה הקנונית. שאר העונות והנתונים יישמרו.',
    changes: [change('teamRoots', root, {
      ...root.data,
      seasonRefsById: {
        ...seasonRefsById,
        [seasonId]: teamSeasonRef({
          data: season.data,
          documentId,
          previous: object(seasonRefsById[seasonId]),
        }),
      },
    }, 'עדכון הפניית העונה במסמך הקבוצה')],
    guards: [guard('teamSeasons', season)],
  })
}

const repairPlayerRootRef = ({ actual, finding }) => {
  const root = find(actual, 'playerRoots', finding.documentId)
  const playerId = clean(finding.documentId)
  const seasonId = clean(finding.seasonId)
  if (!root || !seasonId) return unsupported()
  const documentId = buildPlayerSeasonDocumentId({ playerId, seasonId })
  const season = find(actual, 'playerSeasons', documentId)
  if (!season) return buildMissingPlayerSeasonPlan({ actual, playerId, seasonId })
  const identity = object(season.data && season.data.identity)
  if (
    clean(identity.playerId) !== playerId || clean(identity.seasonId) !== seasonId ||
    clean(identity.playerSeasonDocumentId) !== documentId ||
    clean(object(root.data.identity).playerId) !== playerId
  ) return blocked('יש לתקן תחילה את זהות השחקן ועונת השחקן.')
  const refs = object(root.data.seasonRefsById)
  return ready({
    label: 'תיקון הפניית עונת השחקן',
    description: 'הפניית העונה במסמך השחקן תעודכן למסמך עונת השחקן הקיים. שאר המידע יישמר.',
    changes: [change('playerRoots', root, {
      ...root.data,
      seasonRefsById: {
        ...refs,
        [seasonId]: {
          ...object(refs[seasonId]),
          seasonKey: clean(identity.seasonKey),
          seasonStatus: clean(identity.seasonStatus),
          playerSeasonDocumentId: documentId,
        },
      },
    }, 'תיקון הפניית עונת השחקן')],
    guards: [guard('playerSeasons', season)],
  })
}

const buildMissingPlayerSeasonPlan = ({ actual, playerId, seasonId }) => {
  const documentId = buildPlayerSeasonDocumentId({ playerId, seasonId })
  if (find(actual, 'playerSeasons', documentId)) return unsupported()
  const sources = rows(actual.teamSeasons).filter(row => (
    clean(object(row.data.identity).seasonId) === seasonId &&
    getTeamSeasonPlayerIds(row.data).has(playerId)
  )).sort((left, right) => left.id.localeCompare(right.id))
  if (!sources.length) {
    return blocked('אין עונת קבוצה קנונית שמכילה את השחקן בעונה זו. לא ניתן לשחזר עונת שחקן מההפניה בלבד.')
  }
  const root = find(actual, 'playerRoots', playerId)
  if (root && clean(object(root.data.identity).playerId) !== playerId) {
    return blocked('יש לתקן תחילה את זהות מסמך השחקן.')
  }
  const teamsById = {}
  let identity = null
  sources.forEach(source => {
    const sourceIdentity = object(source.data.identity)
    const teamId = clean(sourceIdentity.teamId)
    if (
      buildTeamId(sourceIdentity) !== teamId ||
      buildTeamSeasonDocumentId({ teamId, seasonId }) !== source.id ||
      clean(sourceIdentity.teamSeasonDocumentId) !== source.id
    ) throw new Error('זהות עונת קבוצה שמכילה את השחקן אינה תקינה; יש לתקן אותה תחילה.')
    const projection = buildPlayerSeasonProjection({
      playerId,
      playerRoot: root ? root.data : null,
      teamSeason: source.data,
      league: null,
      seasonId,
      updatedAt: object(source.data.stats).updatedAt || null,
    })
    if (identity && (
      identity.seasonStatus !== projection.identity.seasonStatus ||
      identity.seasonKey !== projection.identity.seasonKey
    )) throw new Error('פרטי העונה שונים בין קבוצות השחקן; יש לתקן את המקורות לפני שחזור עונת השחקן.')
    identity = projection.identity
    teamsById[teamId] = projection.team
  })
  const after = { identity, teamsById, timestamps: { createdAt: null, updatedAt: null } }
  const changes = [{
    target: 'playerSeasons', documentId, before: null, after,
    summary: 'יצירת עונת השחקן מכל עונות הקבוצה הקנוניות שמכילות אותו',
  }]
  if (root) {
    const refs = object(root.data.seasonRefsById)
    changes.push(change('playerRoots', root, {
      ...root.data,
      seasonRefsById: {
        ...refs,
        [seasonId]: {
          ...object(refs[seasonId]),
          playerSeasonDocumentId: documentId,
          seasonKey: identity.seasonKey,
          seasonStatus: identity.seasonStatus,
        },
      },
    }, 'עדכון הפניית עונת השחקן ששוחזרה'))
  }
  return ready({
    label: 'שחזור עונת השחקן',
    description: 'מסמך עונת השחקן ייבנה מכל קבוצות העונה שמכילות אותו במקורות הקנוניים. ההפניה במסמך השחקן תסונכרן ושאר העונות יישמרו.',
    changes,
    guards: sources.map(source => guard('teamSeasons', source)),
  })
}

const repairPlayerSeasonRef = ({ actual, finding }) => {
  const row = find(actual, 'playerSeasons', finding.documentId)
  if (!row) return unsupported()
  const identity = object(row.data.identity)
  const playerId = clean(identity.playerId)
  const seasonId = clean(identity.seasonId)
  const teamId = clean(finding.teamId)
  if (!playerId || !seasonId || !teamId) return unsupported()
  const expectedId = buildTeamSeasonDocumentId({ teamId, seasonId })
  const source = find(actual, 'teamSeasons', expectedId)
  if (!source) return unsupported()
  const sourceIdentity = object(source.data.identity)
  if (
    clean(sourceIdentity.teamId) !== teamId || clean(sourceIdentity.seasonId) !== seasonId ||
    clean(sourceIdentity.teamSeasonDocumentId) !== expectedId
  ) return blocked('יש לתקן תחילה את זהות עונת הקבוצה.')
  if (!getTeamSeasonPlayerIds(source.data).has(playerId)) {
    return blocked('השחקן אינו קיים בנתוני עונת הקבוצה; יש להשתמש בניקוי הקשר היתום.')
  }
  const teams = object(row.data.teamsById)
  if (!teams[teamId]) return unsupported()
  return ready({
    label: 'תיקון הקישור לעונת הקבוצה',
    description: 'יתוקן רק הקישור לעונת הקבוצה הקנונית שבה השחקן קיים.',
    changes: [change('playerSeasons', row, {
      ...row.data,
      teamsById: {
        ...teams,
        [teamId]: { ...teams[teamId], teamSeasonDocumentId: expectedId },
      },
    }, 'תיקון קישור עונת הקבוצה בעונת השחקן')],
    guards: [guard('teamSeasons', source)],
  })
}

const repairSearchIndexRef = ({ actual, finding }) => {
  const row = find(actual, 'playerSearchIndexes', finding.documentId)
  if (!row) return unsupported()
  const data = row.data
  const references = object(data.references)
  const source = find(actual, 'teamSeasons', references.teamSeasonDocumentId)
  if (!source) return unsupported()
  const identity = object(source.data.identity)
  const teamId = clean(identity.teamId)
  const seasonId = clean(identity.seasonId)
  const playerId = clean(data.playerId)
  const expectedTeamSeasonId = buildTeamSeasonDocumentId({ teamId, seasonId })
  if (source.id !== expectedTeamSeasonId || clean(identity.teamSeasonDocumentId) !== source.id) {
    return blocked('יש לתקן תחילה את זהות עונת הקבוצה.')
  }
  if (!getTeamSeasonPlayerIds(source.data).has(playerId)) {
    return blocked('השחקן אינו קיים בעונת הקבוצה; יש לבדוק את הקשר היתום לפני תיקון הפניה.')
  }
  const expectedIndexId = buildPlayerSearchIndexDocumentId({ playerId, teamSeasonDocumentId: source.id })
  if (expectedIndexId !== row.id) return blocked('יש לתקן תחילה את מזהה אינדקס השחקן.')
  const playerSeasonId = buildPlayerSeasonDocumentId({ playerId, seasonId })
  let playerSeason = find(actual, 'playerSeasons', playerSeasonId)
  let reconstruction = null
  if (!playerSeason) {
    reconstruction = buildMissingPlayerSeasonPlan({ actual, playerId, seasonId })
    if (!reconstruction.allowed) return reconstruction
    playerSeason = {
      id: playerSeasonId,
      data: reconstruction.changes.find(item => item.target === 'playerSeasons').after,
    }
  }
  const playerIdentity = object(playerSeason.data.identity)
  if (
    clean(playerIdentity.playerId) !== playerId || clean(playerIdentity.seasonId) !== seasonId ||
    clean(playerIdentity.playerSeasonDocumentId) !== playerSeasonId
  ) return blocked('יש לתקן תחילה את זהות עונת השחקן.')
  return ready({
    label: 'תיקון הפניות אינדקס השחקן',
    description: reconstruction
      ? 'עונת השחקן החסרה תשוחזר מכל קבוצותיו הקנוניות, והאינדקס יפנה למסמך החדש באותה שמירה.'
      : 'העונה וההפניה לעונת השחקן יותאמו לעונת הקבוצה הקנונית. שאר השדות באינדקס יישמרו.',
    changes: [...(reconstruction ? reconstruction.changes : []), change('playerSearchIndexes', row, {
      ...data,
      seasonId,
      season: {
        ...object(data.season),
        seasonKey: clean(identity.seasonKey),
        seasonStatus: clean(identity.seasonStatus),
      },
      references: { ...references, playerSeasonDocumentId: playerSeasonId },
    }, 'תיקון העונה והפניית עונת השחקן באינדקס')],
    guards: reconstruction
      ? reconstruction.guards
      : [guard('teamSeasons', source), guard('playerSeasons', playerSeason)],
  })
}

export const buildSystemRepairPlan = ({ actual = {}, finding = {}, input = {} }) => {
  try {
    if (finding.target === 'clubsDirectory') return directoryPlan({ actual, finding })
    if (finding.type === 'invalid_identity') return buildIdentityRepairPlan({ actual, finding, input })
    if (finding.target === 'playerSeasons' && finding.type === 'missing_projection') {
      return buildMissingPlayerSeasonPlan({
        actual,
        playerId: clean(finding.playerId),
        seasonId: clean(finding.seasonId),
      })
    }
    if (finding.target === 'playerSearchIndexes' && (
      finding.type === 'broken_relation' || finding.type === 'orphan_projection'
    )) return repairSearchIndexRef({ actual, finding })
    if (finding.type !== 'broken_relation') return unsupported()
    if (finding.target === 'teamRoots' && finding.seasonId) {
      return repairTeamRootRef({ actual, finding })
    }
    if (
      finding.target === 'teamSeasons' && finding.teamId &&
      clean(finding.relatedDocumentId) === clean(finding.teamId)
    ) return repairTeamRootRef({ actual, finding })
    if (finding.target === 'playerRoots' && finding.seasonId) {
      return repairPlayerRootRef({ actual, finding })
    }
    if (finding.target === 'playerSeasons') return repairPlayerSeasonRef({ actual, finding })
    return unsupported()
  } catch (error) {
    return blocked(`לא ניתן לבנות תיקון חד משמעי: ${error.message}`)
  }
}
