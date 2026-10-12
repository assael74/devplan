// src/features/playersDatabase/services/audit/system/repair/identityRepairPlan.js

import {
  buildPlayerId,
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamId,
  buildTeamSeasonDocumentId,
} from '../../../../domain/identity/index.js'
import { SYSTEM_AUDIT_TARGETS } from '../contract.js'
import { getTeamSeasonPlayerIds } from '../evaluate.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {})
const rows = value => (Array.isArray(value) ? value : [])
const plain = value => value && typeof value === 'object' && (
  Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null
)

const IDENTITY_FIELDS = {
  teamRoots: 'teamId',
  teamSeasons: 'teamSeasonDocumentId',
  playerRoots: 'playerId',
  playerSeasons: 'playerSeasonDocumentId',
}

const REFERENCE_MAP = {
  teamId: 'teamRoots',
  fromTeamId: 'teamRoots',
  toTeamId: 'teamRoots',
  previousTeamId: 'teamRoots',
  playerId: 'playerRoots',
  teamSeasonDocumentId: 'teamSeasons',
  fromTeamSeasonDocumentId: 'teamSeasons',
  toTeamSeasonDocumentId: 'teamSeasons',
  previousTeamSeasonDocumentId: 'teamSeasons',
  playerSeasonDocumentId: 'playerSeasons',
}

const KEY_MAP = {
  teamsById: 'teamRoots',
  playersById: 'playerRoots',
  pendingById: 'playerRoots',
}

const unsupported = () => ({
  supported: false, allowed: false, label: 'תיקון זהות', description: '', reason: '',
  fields: [], changes: [], guards: [],
})

const blocked = reason => ({ ...unsupported(), supported: true, reason })

const expectedDocumentId = (target, data) => {
  const identity = object(data.identity)
  if (target === 'teamRoots') return buildTeamId(identity)
  if (target === 'teamSeasons') return buildTeamSeasonDocumentId(identity)
  if (target === 'playerRoots') return buildPlayerId(identity)
  if (target === 'playerSeasons') return buildPlayerSeasonDocumentId(identity)
  if (target === 'playerSearchIndexes') return buildPlayerSearchIndexDocumentId({
    playerId: data.playerId,
    teamSeasonDocumentId: object(data.references).teamSeasonDocumentId,
  })
  return ''
}

// Only documented identity fields and keyed relation maps are rewritten.
// Free text, timestamps and opaque movement IDs retain their exact values.
const rewriteReferences = (value, mappings, field = '') => {
  if (typeof value === 'string' && REFERENCE_MAP[field]) {
    return mappings[REFERENCE_MAP[field]].get(value) || value
  }
  if (Array.isArray(value)) {
    if (field !== 'teamIds' && field !== 'playerIds') {
      const items = value.map(item => rewriteReferences(item, mappings))
      return items.some((item, index) => item !== value[index]) ? items : value
    }
    const mapping = mappings[field === 'teamIds' ? 'teamRoots' : 'playerRoots']
    const items = value.map(item => mapping.get(item) || item)
    return items.some((item, index) => item !== value[index]) ? items : value
  }
  if (!plain(value)) return value
  const result = {}
  let changed = false
  Object.entries(value).forEach(([key, entry]) => {
    const mappedKey = KEY_MAP[field] ? mappings[KEY_MAP[field]].get(key) || key : key
    if (mappedKey !== key && Object.prototype.hasOwnProperty.call(value, mappedKey)) {
      throw new Error('קיימות שתי רשומות לאותו מזהה יעד; יש להכריע בין הנתונים לפני תיקון.')
    }
    if (Object.prototype.hasOwnProperty.call(result, mappedKey)) {
      throw new Error('מספר רשומות מנסות לעבור לאותו מזהה יעד.')
    }
    result[mappedKey] = rewriteReferences(entry, mappings, key)
    if (mappedKey !== key || result[mappedKey] !== entry) changed = true
  })
  return changed ? result : value
}

const setIdentityDocumentId = (target, data, documentId) => {
  const field = IDENTITY_FIELDS[target]
  if (!field || clean(object(data.identity)[field]) === documentId) return data
  return { ...data, identity: { ...object(data.identity), [field]: documentId } }
}

const addRelatedMappings = ({ actual, target, oldId, newId, mappings }) => {
  if (target === 'teamRoots') {
    rows(actual.teamSeasons).forEach(row => {
      const identity = object(row.data && row.data.identity)
      if (clean(identity.teamId) !== oldId) return
      if (buildTeamId(identity) !== newId) {
        throw new Error('זהות עונת קבוצה קשורה סותרת את זהות מסמך הקבוצה.')
      }
      mappings.teamSeasons.set(row.id, buildTeamSeasonDocumentId({
        teamId: newId, seasonId: identity.seasonId,
      }))
    })
  }
  if (target === 'playerRoots') {
    rows(actual.playerSeasons).forEach(row => {
      const identity = object(row.data && row.data.identity)
      if (clean(identity.playerId) !== oldId) return
      mappings.playerSeasons.set(row.id, buildPlayerSeasonDocumentId({
        playerId: newId, seasonId: identity.seasonId,
      }))
    })
    const selected = rows(actual.playerRoots).find(row => row.id === oldId)
    const externalPlayerId = clean(object(selected && selected.data.identity).externalPlayerId)
    rows(actual.teamSeasons).forEach(row => {
      const rosterPlayer = object(object(row.data.roster).playersById)[oldId]
      if (rosterPlayer && clean(rosterPlayer.externalPlayerId) && clean(rosterPlayer.externalPlayerId) !== externalPlayerId) {
        throw new Error('זהות השחקן בסגל קנוני סותרת את זהות מסמך השחקן.')
      }
    })
  }
  rows(actual.playerSearchIndexes).forEach(row => {
    const data = object(row.data)
    const references = object(data.references)
    const playerId = mappings.playerRoots.get(data.playerId) || data.playerId
    const teamSeasonDocumentId = mappings.teamSeasons.get(references.teamSeasonDocumentId) || references.teamSeasonDocumentId
    if (playerId === data.playerId && teamSeasonDocumentId === references.teamSeasonDocumentId) return
    mappings.playerSearchIndexes.set(row.id, buildPlayerSearchIndexDocumentId({
      playerId, teamSeasonDocumentId,
    }))
  })
}

const assertMigrationTargets = (actual, mappings) => {
  Object.entries(mappings).forEach(([target, mapping]) => {
    const existingIds = new Set(rows(actual[target]).map(row => row.id))
    const newIds = new Set()
    mapping.forEach((newId, oldId) => {
      if (oldId === newId) return
      if (!newId || newId.includes('/') || existingIds.has(newId) || newIds.has(newId)) {
        throw new Error('מסמך במזהה היעד כבר קיים או שמזהה היעד אינו תקין; לא יבוצע מיזוג או דריסה.')
      }
      newIds.add(newId)
    })
  })
}

export const buildIdentityRepairPlan = ({ actual = {}, finding = {} }) => {
  const target = clean(finding.target)
  const row = rows(actual[target]).find(item => clean(item.id) === clean(finding.documentId))
  if (!row) return unsupported()
  const data = object(row.data)
  if (target === 'leagues' || target === 'clubProfiles') {
    const field = target === 'leagues' ? 'leagueId' : 'clubId'
    return {
      ...unsupported(), supported: true, allowed: true,
      label: 'תיקון שדה הזהות',
      description: 'שדה הזהות יותאם למזהה המסמך הקנוני. שאר השדות יישמרו.',
      changes: [{
        target, documentId: row.id, before: row.data,
        after: { ...data, [field]: row.id }, summary: 'התאמת שדה הזהות למזהה המסמך',
      }],
    }
  }
  if (!IDENTITY_FIELDS[target] && target !== 'playerSearchIndexes') return unsupported()
  try {
    if (target === 'playerSearchIndexes') {
      const sourceId = clean(object(data.references).teamSeasonDocumentId)
      const source = rows(actual.teamSeasons).find(item => item.id === sourceId)
      const identity = object(source && source.data.identity)
      if (!source || !getTeamSeasonPlayerIds(source.data).has(clean(data.playerId))) {
        return blocked('אין מקור עונת קבוצה קנוני שמאמת את השחקן באינדקס. יש להשלים או לנקות את המקור לפני תיקון המזהה.')
      }
      if (
        buildTeamId(identity) !== clean(identity.teamId) ||
        buildTeamSeasonDocumentId(identity) !== source.id ||
        clean(identity.teamSeasonDocumentId) !== source.id
      ) return blocked('יש לתקן תחילה את זהות עונת הקבוצה שאליה מפנה האינדקס.')
    }
    const newId = expectedDocumentId(target, data)
    if (!newId || newId.includes('/')) return blocked('אין מספיק נתוני זהות קנוניים ליצירת מזהה תקין.')
    const mappings = Object.fromEntries(SYSTEM_AUDIT_TARGETS.map(key => [key, new Map()]))
    if (newId !== row.id) mappings[target].set(row.id, newId)
    addRelatedMappings({ actual, target, oldId: row.id, newId, mappings })
    assertMigrationTargets(actual, mappings)
    const changes = []
    const guards = []
    SYSTEM_AUDIT_TARGETS.forEach(currentTarget => {
      rows(actual[currentTarget]).forEach(currentRow => {
        const isSelected = currentTarget === target && currentRow.id === row.id
        const nextId = mappings[currentTarget].get(currentRow.id) || currentRow.id
        let nextData = rewriteReferences(currentRow.data, mappings)
        if (isSelected || nextId !== currentRow.id) {
          nextData = setIdentityDocumentId(currentTarget, nextData, nextId)
        }
        if (nextId !== currentRow.id) {
          changes.push({
            target: currentTarget, documentId: currentRow.id,
            before: currentRow.data, after: null, summary: 'העברת מסמך ממזהה שגוי',
          }, {
            target: currentTarget, documentId: nextId,
            before: null, after: nextData, summary: 'שמירת המסמך במזהה הקנוני',
          })
        } else if (nextData !== currentRow.data) {
          changes.push({
            target: currentTarget, documentId: currentRow.id,
            before: currentRow.data, after: nextData,
            summary: isSelected ? 'תיקון שדה הזהות' : 'עדכון הפניה מפורשת למזהה המתוקן',
          })
        } else if (newId !== row.id) {
          guards.push({ target: currentTarget, documentId: currentRow.id, before: currentRow.data })
        }
      })
    })
    return {
      ...unsupported(), supported: true, allowed: changes.length > 0,
      label: newId === row.id ? 'תיקון שדה הזהות' : 'תיקון מזהה המסמך וההפניות',
      description: newId === row.id
        ? 'שדה הזהות יתוקן לפי בונה הזהות הקנוני. שאר הנתונים יישמרו.'
        : 'המסמך יועבר למזהה הקנוני וההפניות המפורשות אליו יעודכנו באותה שמירה. נתוני מסמכים קיימים לא ימוזגו ולא יידרסו.',
      reason: changes.length ? '' : 'לא נמצא שינוי שנדרש לזהות.',
      changes, guards,
    }
  } catch (error) {
    return blocked(error.message)
  }
}
