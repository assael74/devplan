import { normalizeComparableValue } from '../../../../../services/shared/valueComparison.js'
import { buildPlayerSeasonScope } from '../../shared/playerSeasonScope.js'
import { buildSeasonKey, clean } from '../../leagues/leagueDoc.js'
import { buildPlayerSeasonIndexDoc } from './playerSeasonIndex.model.js'
import {
  buildPlayerAliases,
  hasCompletePlayerSeasonIndexIdentity,
  buildPlayerSeasonIndexLookup,
  buildPlayerSeasonIndexScope,
  findExistingPlayerSeasonIndexDoc,
  getRosterStatus,
  isSamePlayerSeasonIndexContext,
  shouldSkipNewPlayerSeasonIndex,
} from './playerSeasonIndex.identity.js'

const isUnchanged = ({ existingData = {}, nextData = {} } = {}) => Object.keys(nextData)
  .filter(key => key !== 'updatedAt')
  .every(key => JSON.stringify(normalizeComparableValue(existingData[key])) ===
    JSON.stringify(normalizeComparableValue(nextData[key])))

const rowData = row => row?.data?.() || row?.data || {}

const ROSTER_OWNED_PLAYER_INDEX_FIELDS = [
  'id',
  'entityType',
  'entityId',
  'displayName',
  'normalizedDisplayName',
  'playerId',
  'playerDocumentId',
  'externalPlayerId',
  'identityBirthYear',
  'identityKey',
  'rosterStatus',
  'isYoungerAgeGroup',
  'leagueId',
  'seasonId',
  'seasonKey',
  'clubId',
  'clubLevel',
  'clubStrengthLevel',
  'birthTeamId',
  'birthTeamDocumentId',
  'birthTeamSlot',
  'teamId',
  'teamDocumentId',
  'seasonUrl',
  'ageGroupId',
  'ageGroupLabel',
  'birthYear',
  'leagueLevel',
  'expectedLevelDelta',
  'region',
  'primaryPosition',
  'positionLayer',
  'lineClassificationLine',
  'lineClassificationPosition',
  'lineClassificationSource',
  'lineClassificationEvidenceLevel',
  'lineClassificationModelVersion',
  'numShirt',
  'sourceCollection',
  'sourceDocumentId',
  'sourceTarget',
]

const pickRosterOwnedPlayerIndexFields = value => ROSTER_OWNED_PLAYER_INDEX_FIELDS.reduce(
  (result, key) => value[key] === undefined ? result : { ...result, [key]: value[key] },
  {}
)
const rowId = row => String(row?.id || '').trim()

export const buildPlayerSeasonIndexSyncPlan = ({
  league = {}, season = {}, team = {}, target = 'current', players = [],
  clearPlayerDocumentIds = [], replaceScope = false, existingRows = [],
} = {}) => {
  const leagueId = clean(league.id || season.leagueId || team.leagueId)
  const seasonId = clean(season.seasonId)
  const seasonKey = clean(season.seasonKey) || buildSeasonKey(seasonId)
  const teamScope = buildPlayerSeasonScope({ season: { ...season, seasonId, seasonKey }, team })
  const indexScope = buildPlayerSeasonIndexScope({
    league, season: { ...season, seasonId, seasonKey, leagueId }, team,
  })
  const teamId = teamScope.birthTeamId
  if (!teamId || !seasonKey) return { teamId, seasonKey, operations: [], failures: [], duplicates: [] }

  const safePlayers = (Array.isArray(players) ? players : []).filter(player => clean(
    player.fullName || player.matchedPlayerName || player.externalPlayerId || player.playerId
  ))
  const existingDocs = (Array.isArray(existingRows) ? existingRows : []).map(row => (
    typeof row?.data === 'function' ? row : { ...row, data: () => row?.data || {} }
  )).filter(row => isSamePlayerSeasonIndexContext(rowData(row), indexScope))
  const existingLookup = buildPlayerSeasonIndexLookup(existingDocs)
  const cleared = new Set((Array.isArray(clearPlayerDocumentIds) ? clearPlayerDocumentIds : []).map(clean).filter(Boolean))
  const matched = new Set()
  const operations = []
  const failures = []
  const duplicates = []

  safePlayers.forEach(player => {
    const match = findExistingPlayerSeasonIndexDoc({
      lookup: existingLookup, player, season: { ...season, seasonId, seasonKey }, team,
    })
    const existingDoc = match.snapshot
    const existingId = rowId(existingDoc)
    if (existingId) matched.add(existingId)

    if (!hasCompletePlayerSeasonIndexIdentity(match.identity)) {
      failures.push({ code: 'PLAYER_INDEX_IDENTITY_INCOMPLETE', ...match.identity, displayName: clean(player.matchedPlayerName || player.fullName) })
      return
    }
    if (!existingDoc && shouldSkipNewPlayerSeasonIndex(player)) return
    if (match.duplicateSnapshots.length) {
      duplicates.push({ ...match.identity, documentIds: [existingId, ...match.duplicateSnapshots.map(rowId)].filter(Boolean) })
    }

    const existingData = rowData(existingDoc)
    const shouldClear = cleared.has(clean(player.playerDocumentId || existingData.playerDocumentId))
    const indexDoc = buildPlayerSeasonIndexDoc({
      league, season: { ...season, seasonId, seasonKey }, team, target,
      player: { ...player, fullName: clean(player.matchedPlayerName || existingData.displayName || player.fullName) },
    })
    const id = existingId || indexDoc.id
    if (!id || !indexDoc.teamId || !indexDoc.seasonId || !indexDoc.displayName) return

    const fullIndexDoc = {
      ...indexDoc,
      id,
      entityId: id,
      aliases: buildPlayerAliases({ player, displayName: indexDoc.displayName, existingAliases: existingData.aliases }),
      playerDocumentId: shouldClear ? '' : clean(indexDoc.playerDocumentId || existingData.playerDocumentId),
      playerUrl: clean(indexDoc.playerUrl || existingData.playerUrl),
      rosterStatus: getRosterStatus(player) || clean(existingData.rosterStatus || 'regular'),
      notes: clean(player.notes || existingData.notes),
    }
    const patch = pickRosterOwnedPlayerIndexFields(fullIndexDoc)
    if (existingDoc && isUnchanged({ existingData, nextData: patch })) return
    operations.push({
      type: 'upsert', docId: id, patch,
    })
  })

  if (replaceScope) {
    existingDocs.forEach(existingDoc => {
      const id = rowId(existingDoc)
      if (!id || matched.has(id)) return
      operations.push({
        type: 'delete', docId: id,
      })
    })
  }

  return { teamId, seasonKey, operations, failures, duplicates }
}
