// src/features/playersDatabase/domain/edits/editIdentity.js

import { normalizeSeasonLookupKey } from '../../model/shared/season.model.js'

export const clean = value =>
  String(value === undefined || value === null ? '' : value).trim()
export const has = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key)
export const equal = (left, right) => {
  if (left === right) return true
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object')
    return false
  if (Array.isArray(left) !== Array.isArray(right)) return false
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(key => has(right, key) && equal(left[key], right[key]))
  )
}

export const requireValue = (value, message) => {
  if (!value) throw new Error(message)
  return value
}

export const unique = (rows, predicate, label, optional = false) => {
  const matches = rows.filter(predicate)
  if (matches.length > 1 || (!optional && matches.length !== 1)) {
    throw new Error(`${label}: היעד חסר או אינו חד־משמעי`)
  }
  return matches[0] || null
}

export const array = (value, label) => {
  if (!Array.isArray(value)) throw new Error(`${label}: מבנה הנתונים אינו תקין`)
  return value
}

export const seasonKey = value => {
  const key = normalizeSeasonLookupKey(clean(value?.seasonKey || value?.seasonId))
  requireValue(key, 'זהות העונה חסרה')
  const suppliedId = clean(value?.seasonId)
  if (/^(?:20)?\d{2}[/_-](?:20)?\d{2}$/.test(suppliedId)) {
    requireValue(normalizeSeasonLookupKey(suppliedId) === key, 'זהות העונה סותרת')
  }
  return key
}

export const teamId = value => {
  const ids = [value?.birthTeamId, value?.teamId].map(clean).filter(Boolean)
  requireValue(ids.length && new Set(ids).size === 1, 'מזהה הקבוצה חסר או סותר')
  return ids[0]
}

export const teamDocumentId = value => {
  const ids = [value?.birthTeamDocumentId, value?.teamDocumentId]
    .map(clean)
    .filter(Boolean)
  requireValue(
    ids.length && new Set(ids).size === 1,
    'מזהה מסמך הקבוצה חסר או סותר',
  )
  return ids[0]
}

export const findSeason = (league, key) => {
  const rows = [
    ...(league.current ? [{ field: 'current', row: league.current }] : []),
    ...array(league.history || [], 'היסטוריית הליגה').map((row, index) => ({
      field: 'history',
      row,
      index,
    })),
  ]
  return unique(rows, item => seasonKey(item.row) === key, 'עונת הליגה')
}

export const leagueSeasonPatch = (league, selected, changes) =>
  selected.field === 'current'
    ? { current: { ...selected.row, ...changes } }
    : {
        history: league.history.map((row, index) =>
          index === selected.index ? { ...row, ...changes } : row,
        ),
      }

export const playerMatches = (row, identity) => {
  const keys = ['playerId', 'externalPlayerId', 'playerDocumentId']
  const shared = keys.filter(key => clean(row[key]) && clean(identity[key]))
  const matches = shared.some(key => clean(row[key]) === clean(identity[key]))
  if (matches && shared.some(key => clean(row[key]) !== clean(identity[key]))) {
    throw new Error('זהות השחקן סותרת')
  }
  return matches
}

export const urlValue = value => {
  requireValue(typeof value === 'string', 'יש להעביר ערך קישור מפורש')
  const next = value.trim()
  requireValue(
    !next || /^https?:\/\/[^\s]+$/i.test(next),
    'יש להזין קישור http או https תקין',
  )
  return next
}

export const canonicalTeamUrl = ({ league, season, team }) => {
  const selected = findSeason(league, seasonKey(season))
  const row = unique(
    array(selected.row.tableRank, 'טבלת הליגה'),
    candidate => teamId(candidate) === teamId(team),
    'קבוצה בליגה',
  )
  return clean(row.teamUrl)
}
