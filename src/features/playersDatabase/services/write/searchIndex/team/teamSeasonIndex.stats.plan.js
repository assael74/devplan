import { doc } from 'firebase/firestore'
import { trackedGetDoc } from '../../../../../../services/firestore/usage/index.js'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'
import { normalizeTeamIdentity } from '../../../../model/team/teamIdentity.model.js'
import { normalizeComparableValue } from '../../../shared/valueComparison.js'
import { buildTeamBalanceSearchIndexProjection } from '../../../../domain/projections/teamBalanceSearchIndex.projection.js'
import { buildTeamSearchIndexPerformanceProjection } from '../../../../domain/projections/teamPerformance.projection.js'
import {
  areScoutProfilesSummariesEqual,
  normalizeScoutProfilesSummary,
} from '../../../../domain/projections/teamScoutSummary.projection.js'
import { buildSeasonKey, clean, toNumberOrZero } from '../../leagues/leagueDoc.js'
import {
  buildTeamSeasonIndexId,
  resolveClubLevel,
  resolveClubStrengthLevel,
} from './teamSeasonIndex.model.js'

const readTeamSeasonIndex = ref => trackedGetDoc(ref, {
  feature: 'playersDatabase',
  collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  action: 'teamSeasonIndex-stats-plan',
  operationSubtype: 'planning-getDoc',
})

const fingerprint = value => JSON.stringify(normalizeComparableValue(value))

const pickSnapshotFields = ({ data = {}, fields = [] } = {}) => (
  fields.reduce((result, field) => {
    result[field] = data[field] === undefined ? null : data[field]
    return result
  }, {})
)

const hasSamePerformanceProjection = ({ existingData = {}, projection = {} } = {}) => (
  Object.entries(projection).every(([field, value]) => existingData[field] === value)
)

const hasSameBalanceProjection = ({ existingData = {}, projection = {} } = {}) => {
  const existingProjection = Object.keys(projection).reduce((result, key) => ({
    ...result,
    [key]: existingData[key] === undefined || existingData[key] === null
      ? ''
      : existingData[key],
  }), {})

  return JSON.stringify(existingProjection) === JSON.stringify(projection)
}


export async function prepareTeamSeasonSearchIndexStatsPlan({
  league = {},
  season = {},
  team = {},
  target = 'current',
  playersCount = null,
  scoutProfilesSummary = {},
  teamBalance = null,
  teamPerformance = null,
  teamSeasonDocumentId = '',
  sourceRevision = '',
} = {}) {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamIdentity = normalizeTeamIdentity({ team })
  const teamId = clean(teamIdentity.birthTeamId || teamIdentity.teamId)
  const clubId = clean(team.clubId)
  const linkedTeamSeasonDocumentId = clean(teamSeasonDocumentId)
  const documentId = buildTeamSeasonIndexId({
    leagueId,
    seasonKey,
    teamId,
    clubId,
  })

  if (!documentId) throw new Error('Missing team season index id')

  const ref = doc(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes, documentId)
  const snapshot = await readTeamSeasonIndex(ref)
  const exists = snapshot.exists()
  const existingData = exists ? (snapshot.data() || {}) : {}
  const normalizedSummary = normalizeScoutProfilesSummary(scoutProfilesSummary)
  const balanceProjection = buildTeamBalanceSearchIndexProjection(teamBalance)
  const performanceProjection = buildTeamSearchIndexPerformanceProjection(teamPerformance)
  const hasPlayersCount = playersCount !== null && playersCount !== undefined
  const normalizedPlayersCount = hasPlayersCount ? toNumberOrZero(playersCount) : null
  const sourceTarget = clean(target) === 'history' ? 'history' : 'current'

  const updatePatch = {
    ...(linkedTeamSeasonDocumentId
      ? { teamSeasonDocumentId: linkedTeamSeasonDocumentId }
      : {}),
    ...(hasPlayersCount
      ? { playersCount: normalizedPlayersCount }
      : {}),
    ...performanceProjection,
    scoutProfilesSummary: normalizedSummary,
    ...balanceProjection,
    sourceTarget,
  }

  const createPatch = {
    id: documentId,
    entityType: 'birthTeamSeason',
    entityId: documentId,
    leagueId,
    seasonId,
    seasonKey,
    seasonStatus: clean(season.seasonStatus) === 'completed' ? 'completed' : 'active',
    seasonDataStatus: clean(season.seasonStatus) === 'completed' ? 'historical' : 'current',
    clubId,
    clubLevel: resolveClubLevel({
      clubId,
      clubLevel: team.clubLevel,
    }),
    clubStrengthLevel: resolveClubStrengthLevel({
      clubId,
      clubLevel: team.clubLevel,
      clubStrengthLevel: team.clubStrengthLevel,
    }),
    birthTeamId: teamId,
    birthTeamDocumentId: teamIdentity.birthTeamDocumentId || teamId,
    birthTeamSlot: toNumberOrZero(team.birthTeamSlot || team.teamSlot) || 1,
    teamId,
    teamDocumentId:
      teamIdentity.birthTeamDocumentId ||
      teamIdentity.teamDocumentId ||
      teamId,
    ...(linkedTeamSeasonDocumentId
      ? { teamSeasonDocumentId: linkedTeamSeasonDocumentId }
      : {}),
    teamUrl: clean(team.teamUrl),
    seasonUrl: clean(season.seasonUrl),
    birthYear: toNumberOrZero(season.birthYear),
    leagueTotalRound: toNumberOrZero(season.leagueTotalRound),
    ...(hasPlayersCount
      ? { playersCount: normalizedPlayersCount }
      : {}),
    ...performanceProjection,
    scoutProfilesSummary: normalizedSummary,
    ...balanceProjection,
    sourceTarget,
  }

  const patch = exists ? updatePatch : createPatch
  const guardFields = exists ? Object.keys(updatePatch) : []
  const expectedSnapshot = exists
    ? pickSnapshotFields({ data: existingData, fields: guardFields })
    : null
  const teamSeasonLinkUnchanged = !linkedTeamSeasonDocumentId || (
    clean(existingData.teamSeasonDocumentId) === linkedTeamSeasonDocumentId
  )
  const playersCountUnchanged = !hasPlayersCount || (
    toNumberOrZero(existingData.playersCount) === normalizedPlayersCount
  )
  const changed = !exists || !(
    teamSeasonLinkUnchanged &&
    playersCountUnchanged &&
    hasSamePerformanceProjection({
      existingData,
      projection: performanceProjection,
    }) &&
    areScoutProfilesSummariesEqual(
      existingData.scoutProfilesSummary,
      normalizedSummary
    ) &&
    hasSameBalanceProjection({
      existingData,
      projection: balanceProjection,
    })
  )

  return {
    planType: 'teamSeasonSearchIndexStatsPlan',
    planVersion: 1,
    sourceRevision: clean(sourceRevision),
    documentId,
    operation: {
      operationType: 'teamSeasonIndex',
      operationId: `teamSeasonIndex__${documentId}__${clean(sourceRevision)}`,
      sourceRevision: clean(sourceRevision),
      documentId,
      action: 'set',
      created: !exists,
      changed,
      expected: {
        documentExists: exists,
        fields: guardFields,
        fingerprint: exists ? fingerprint(expectedSnapshot) : '',
      },
      patch,
    },
  }
}
