// src/features/playersDatabase/services/audit/repair/repairStatsFinding.js

import {
  buildPlayerSearchIndexDocumentId,
  buildPlayerSeasonDocumentId,
  buildTeamSeasonDocumentId,
  requireSeasonId,
} from '../../../domain/identity/index.js'
import { arrivalSourceDocumentId, buildArrivalHistory } from '../../../domain/movement/arrivalHistory.projection.js'
import { FieldPath, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocFromServer } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { writeStatsLeagueProjection } from '../../write/stats/writeStatsLeagueProjection.js'
import { writeStatsPlayerSearchIndexes } from '../../write/stats/writeStatsPlayerSearchIndexes.js'
import { writeStatsPlayerSeasons } from '../../write/stats/writeStatsPlayerSeasons.js'
import { buildStatsAuditExpected } from '../stats/buildExpected.js'
import { readStatsAuditActual } from '../stats/readActual.js'
import { repairLeagueFinding } from './repairLeagueFinding.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const owns = (value, key) => Object.prototype.hasOwnProperty.call(object(value), key)
const SEARCH_FIELDS = new Set([
  'expectedLevelDelta',
  'scoutEffectiveImmediacyStatus',
  'scoutProfileIds',
  'scoutCombinationIds',
  'scoutProfileSearchIds',
  'stats',
  'scout',
  'scoutEvidence',
  'player.statsStatus',
  'player.numShirt',
])
const CENTER_FIELDS = new Set([
  'documentationState',
  'documentationStateUpdatedAt',
])

const requireTarget = ({ scope, finding }) => {
  const type = clean(scope.type)
  const leagueId = clean(scope.leagueId)
  const teamId = clean(scope.teamId)
  const seasonId = requireSeasonId(scope.seasonId)
  const playerId = clean(scope.playerId)
  if (!['team', 'player'].includes(type) || !leagueId || !teamId || (type === 'player' && !playerId)) {
    throw new Error('חסר יעד קבוצה או שחקן תקין לתיקון')
  }

  const target = clean(finding.target)
  const field = clean(finding.field)
  const findingType = clean(finding.type)
  const missingDocument = findingType === 'missing_document' && field === 'document'
  const missingTeam = findingType === 'missing_projection' && field === 'team'
  const mismatch = findingType === 'projection_mismatch'
  const supported = target === 'playerSeason'
    ? missingDocument || (mismatch && [`teamsById.${teamId}.stats`, `teamsById.${teamId}.scouting`, `teamsById.${teamId}.roster.numShirt`].includes(field))
    : target === 'arrivalHistory'
      ? mismatch && field.startsWith('movement.arrivalHistoryById.')
      : target === 'playerSearchIndex'
      ? missingDocument || (mismatch && SEARCH_FIELDS.has(field))
      : target === 'leagueMetadata'
        ? mismatch && ['stats', 'scouting'].includes(field)
        : target === 'leaguesCenter' || target === 'clubsCenter'
          ? missingTeam || (mismatch && (CENTER_FIELDS.has(field) || (target === 'clubsCenter' && field === 'transfers')))
          : false
  if (!supported) throw new Error('לממצא הזה אין תיקון ממוקד נתמך')

  const documentId = clean(finding.documentId)
  if (!documentId) throw new Error('לממצא חסר מזהה מסמך')
  const expectedDocumentId = target === 'leagueMetadata'
    ? leagueId
    : target === 'leaguesCenter'
      ? 'all'
      : target === 'clubsCenter'
        ? seasonId
        : ''
  if (expectedDocumentId && documentId !== expectedDocumentId) {
    throw new Error('מסמך הממצא אינו שייך ליעד הבדיקה')
  }
  return { type, leagueId, teamId, seasonId, playerId, target, documentId }
}

const requireCanonical = ({ actual, target }) => {
  const teamSeason = actual.teamSeason
  const league = actual.league
  if (!teamSeason || !league) throw new Error('חסר Team Season או League קנוני; אי אפשר לבנות את התוצר')

  const identity = object(teamSeason.identity)
  const teamSeasonDocumentId = buildTeamSeasonDocumentId(target)
  if (
    clean(identity.teamId) !== target.teamId ||
    clean(identity.leagueId) !== target.leagueId ||
    clean(identity.seasonId) !== target.seasonId ||
    clean(identity.teamSeasonDocumentId) !== teamSeasonDocumentId ||
    clean(league.id) !== target.leagueId
  ) {
    throw new Error('המקורות הקנוניים אינם תואמים ליעד התיקון')
  }
  const leagueSeason = object(object(league.seasonsById)[target.seasonId])
  if (!owns(object(leagueSeason.table).teamsById, target.teamId)) {
    throw new Error('הקבוצה אינה קיימת בטבלת הליגה הקנונית לעונה')
  }
  const teamSeasonStatus = clean(identity.seasonStatus).toLowerCase()
  const leagueSeasonStatus = clean(leagueSeason.seasonStatus).toLowerCase()
  if (teamSeasonStatus && leagueSeasonStatus && teamSeasonStatus !== leagueSeasonStatus) {
    throw new Error('מצב עונת הקבוצה סותר את מצב העונה בליגה הקנונית')
  }
  return teamSeasonDocumentId
}

const resolvePlayerId = ({ actual, target, teamSeasonDocumentId }) => {
  const teamSeason = actual.teamSeason
  const rosterIds = Object.keys(object(object(teamSeason.roster).playersById))
  const candidateIds = target.type === 'player' ? [target.playerId] : rosterIds
  const playerId = candidateIds.find(id => target.documentId === (
    target.target === 'playerSeason'
      ? buildPlayerSeasonDocumentId({ playerId: id, seasonId: target.seasonId })
      : buildPlayerSearchIndexDocumentId({ playerId: id, teamSeasonDocumentId })
  ))
  const hasCanonicalPlayer = playerId && ['roster', 'stats', 'scouting', 'manual']
    .some(section => owns(object(teamSeason[section]).playersById, playerId))
  if (!hasCanonicalPlayer) throw new Error('השחקן שבממצא אינו שייך להקשר הקנוני שנבחר')
  return playerId
}

const requirePlayerSeasonIdentity = ({ current, playerId, target }) => {
  if (!current) return
  const identity = object(current.identity)
  const expected = {
    playerId,
    seasonId: target.seasonId,
    playerSeasonDocumentId: target.documentId,
  }
  const conflicts = Object.entries(expected).some(([field, value]) => (
    clean(identity[field]) && clean(identity[field]) !== value
  ))
  if (conflicts || (clean(current.id) && clean(current.id) !== target.documentId)) {
    throw new Error('זהות Player Season הקיים סותרת את יעד התיקון; המסמך לא יישכתב')
  }
}

export const repairStatsFinding = async ({ scope = {}, finding = {} } = {}) => {
  const target = requireTarget({ scope, finding })
  if (target.target === 'arrivalHistory') {
    const movementId = clean(finding.field).slice('movement.arrivalHistoryById.'.length)
    const teamSeasonDocumentId = buildTeamSeasonDocumentId(target)
    if (!movementId || target.documentId !== teamSeasonDocumentId) throw new Error('יעד תיקון העבר אינו תואם לקבוצה')
    const teamSnapshot = await trackedGetDocFromServer(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId),
      { feature: 'playersDatabase', collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons, action: 'repair-arrival-history-read-team', operationSubtype: 'repair-getDoc' }
    )
    if (!teamSnapshot.exists()) throw new Error('עונת קבוצת היעד אינה קיימת')
    const teamSeason = teamSnapshot.data()
    const fact = object(object(teamSeason.movement).transfersInById)[movementId]
    const current = object(object(teamSeason.movement).arrivalHistoryById)[movementId]
    if (!fact || !current) throw new Error('מעבר או תקציר עבר אינם קיימים')
    const sourceId = arrivalSourceDocumentId({ teamId: fact.fromTeamId, seasonId: target.seasonId })
    if (!sourceId) throw new Error('חסר מזהה מקור לעונת העבר')
    const sourceSnapshot = await trackedGetDocFromServer(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, sourceId),
      { feature: 'playersDatabase', collection: PLAYERS_DATABASE_COLLECTIONS.teamSeasons, action: 'repair-arrival-history-read-source', operationSubtype: 'repair-getDoc' }
    )
    if (!sourceSnapshot.exists()) throw new Error('עונת המקור אינה זמינה לתיקון')
    const next = buildArrivalHistory({
      movementId,
      playerId: fact.playerId,
      fromTeamId: fact.fromTeamId,
      seasonId: target.seasonId,
      sourceTeamSeason: sourceSnapshot.data(),
      updatedAt: current.updatedAt,
    })
    await updateDoc(
      doc(db, PLAYERS_DATABASE_COLLECTIONS.teamSeasons, teamSeasonDocumentId),
      new FieldPath('movement', 'arrivalHistoryById', movementId),
      next
    )
    return { target: target.target, documentId: teamSeasonDocumentId, result: { written: true } }
  }
  const actual = await readStatsAuditActual({
    leagueId: target.leagueId,
    teamId: target.teamId,
    seasonId: target.seasonId,
    scopedPlayerIds: target.type === 'player' ? [target.playerId] : [],
  })
  const teamSeasonDocumentId = requireCanonical({ actual, target })

  if (['leaguesCenter', 'clubsCenter'].includes(target.target)) {
    // The league writer can recreate complete Center parents and retains League-owned timestamps.
    return repairLeagueFinding({
      scope: { ...scope, type: 'league', leagueId: target.leagueId, seasonId: target.seasonId },
      finding,
    })
  }

  const playerId = target.target.startsWith('player')
    ? resolvePlayerId({ actual, target, teamSeasonDocumentId })
    : ''
  const expectedState = buildStatsAuditExpected({
    actual,
    seasonId: target.seasonId,
    scopedPlayerIds: playerId ? [playerId] : [],
  })
  if (!expectedState.complete) throw new Error('חסרים מקורות קנוניים לבניית התוצר')

  const expected = expectedState.expected
  const updatedAt = object(actual.teamSeason.stats).updatedAt || null
  let result
  if (target.target === 'playerSeason') {
    const current = object(actual.playerSeasonsById)[playerId]
    requirePlayerSeasonIdentity({ current, playerId, target })
    result = await writeStatsPlayerSeasons({
      approvedState: {
        updatedAt,
        playerSeasonPlans: [{
          playerId,
          documentId: target.documentId,
          exists: Boolean(current),
          teamExists: owns(current && current.teamsById, target.teamId),
          projection: expected.playerSeasonsById[playerId],
        }],
      },
    })
  } else if (target.target === 'playerSearchIndex') {
    result = await writeStatsPlayerSearchIndexes({
      approvedState: {
        updatedAt,
        playerSearchIndexPlans: [{ playerId, projection: expected.playerSearchIndexesById[playerId] }],
      },
    })
  } else {
    result = await writeStatsLeagueProjection({
      approvedState: {
        leagueProjection: {
          leagueId: target.leagueId,
          seasonId: target.seasonId,
          teamId: target.teamId,
          patch: expected.leagueTeamPatch,
        },
      },
    })
  }

  return { target: target.target, documentId: target.documentId, result }
}
