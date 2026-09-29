// src/features/playersDatabase/services/writeV2/edits/shared/validation.js

import { data, readWhere, reference } from './executeEdit.js'
import {
  array,
  clean,
  requireValue,
  seasonKey,
  teamDocumentId,
  teamId,
  unique,
  playerMatches,
} from '../../../../domain/edits/editIdentity.js'
import { buildTeamSeasonDocumentId } from '../../../../model/team/teamIdentity.model.js'

export const assertLeague = (league, id) => {
  requireValue(
    clean(league.id) === id && clean(league.leagueId) === id,
    'זהות הליגה סותרת',
  )
  return league
}

export const teamSeasonRef = (id, key) =>
  reference('teamSeasons', buildTeamSeasonDocumentId(id, key))

export const resolveTeamSeasonRef = (indexes, suppliedDocumentId, key) => {
  const teamIndex = unique(
    indexes,
    item => data(item).entityType === 'birthTeamSeason',
    'אינדקס קבוצה',
  )
  const value = data(teamIndex)
  const documentId = requireValue(
    clean(teamDocumentId(value) || suppliedDocumentId),
    'מזהה מסמך קבוצת שנתון חסר',
  )
  if (clean(suppliedDocumentId)) {
    requireValue(
      documentId === clean(suppliedDocumentId),
      'מזהה מסמך קבוצת שנתון סותר',
    )
  }
  const actualSeasonDocumentId = clean(value.teamSeasonDocumentId)
  return {
    teamIndex,
    documentId,
    ref: actualSeasonDocumentId
      ? reference('teamSeasons', actualSeasonDocumentId)
      : teamSeasonRef(documentId, key),
  }
}

export const readTeamSeasonIndex = (id, key) =>
  readWhere('searchIndexes', {
    birthTeamId: id,
    seasonKey: [
      ...new Set([
        key,
        key.replace('/', '_'),
        key.replace('/', '-'),
        ...(/^\d{2}\/\d{2}$/.test(key)
          ? ['/', '_', '-'].map(separator =>
              key.split('/').map(year => `20${year}`).join(separator),
            )
          : []),
      ]),
    ],
    entityType: 'birthTeamSeason',
  })

export const readTeamIndexes = (id, key, playerId) =>
  readWhere('searchIndexes', {
    birthTeamId: id,
    seasonKey: [
      ...new Set([
        key,
        key.replace('/', '_'),
        key.replace('/', '-'),
        ...(/^\d{2}\/\d{2}$/.test(key)
          ? ['/', '_', '-'].map(separator =>
              key
                .split('/')
                .map(year => `20${year}`)
                .join(separator),
            )
          : []),
      ]),
    ],
    ...(playerId ? { entityType: 'playerSeason', playerId } : {}),
  })

export const assertTeam = (value, id, documentId, key, leagueId) => {
  requireValue(
    teamId(value) === id &&
      teamDocumentId(value) === documentId &&
      seasonKey(value) === key,
    'זהות הקבוצה או העונה סותרת',
  )
  if (leagueId) requireValue(clean(value.leagueId) === leagueId, 'שיוך הליגה סותר')
  return value
}

// Only the selected team's direct targets; unrelated/orphan indexes belong to Audit.
export const teamTargets = ({
  get,
  seasonRef,
  indexes,
  row,
  id,
  documentId,
  key,
  leagueId,
}) => {
  const snapshot = get(seasonRef)
  const season = snapshot.exists() ? assertTeam(data(snapshot), id, documentId, key, leagueId) : null
  const actual = indexes.map(item => ({ ref: item.ref, value: data(get(item.ref)) }))
  const index = unique(
    actual,
    item => item.value.entityType === 'birthTeamSeason',
    'אינדקס קבוצה',
  )
  assertTeam(index.value, id, documentId, key, leagueId)
  requireValue(
    clean(index.value.teamSeasonDocumentId) === (season ? seasonRef.id : ''),
    'הפניית עונת הקבוצה חסרה או סותרת',
  )
  if (!season)
    requireValue(
      !row.hasPlayers && !row.hasStats && !Number(row.playersCount),
      'סגל מחויב חסר',
    )
  const used = new Set()
  const players = (season ? array(season.teamPlayers, 'סגל') : []).map(player => {
    const target = unique(
      actual,
      item =>
        item.value.entityType === 'playerSeason' && playerMatches(item.value, player),
      'אינדקס שחקן',
    )
    assertTeam(target.value, id, documentId, key, leagueId)
    requireValue(!used.has(target.ref.path), 'שחקן כפול בסגל')
    used.add(target.ref.path)
    return target
  })
  return { season, index, players }
}
