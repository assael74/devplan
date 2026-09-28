// src/features/playersDatabase/domain/rosterV2/clear/clearRosterApprovedState.builder.js

import { cloneClearRosterValue, applyClearRosterChanges, sameClearRosterValue } from './clearRosterPlan.builder.js'
import { getTeamSeasonRosterState, ROSTER_CLEAR_FIELDS } from './rosterAbsent.builder.js'
import { getTeamSeasonStatsState } from '../../statsV2/teamSeasonStatsState.js'
import { buildClearRosterIds, sameClearRosterSeason } from './clearRosterIdentity.js'
import { getClearRosterAllowedPaths } from './clearRosterPaths.js'

const proposedPlans = new WeakSet()
const approvedStates = new WeakSet()

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

// Immutable session values, not persisted payloads, locks or recovery tokens.
export const freezeClearRosterProposal = plan => {
  const proposal = freeze(cloneClearRosterValue(plan))
  proposedPlans.add(proposal)
  return proposal
}

export const buildClearRosterApprovedState = proposedPlan => {
  if (!proposedPlans.has(proposedPlan)) throw new Error('A freshly prepared Clear Roster proposal is required')
  const state = cloneClearRosterValue(proposedPlan)
  const { identity, sources } = state
  const ids = buildClearRosterIds(identity)
  if (
    identity.birthTeamDocumentId !== sources.teamRoot.id ||
    identity.clubId !== sources.teamRoot.clubId ||
    identity.seasonKey !== sources.teamSeason.seasonKey ||
    identity.leagueId !== sources.teamSeason.leagueId ||
    identity.leagueId !== sources.league.id ||
    ids.teamSeasonDocumentId !== sources.teamSeason.id ||
    ids.teamSearchIndexId !== sources.teamSearchIndex.id
  ) throw new Error('Approved Clear Roster identity mismatch')
  const sourceByKind = {
    teamSeason: sources.teamSeason,
    teamSearchIndex: sources.teamSearchIndex,
    league: sources.league,
    club: sources.club,
    clubsMaster: sources.clubsMaster,
    leaguesMaster: sources.leaguesMaster,
  }
  if (state.operations.length !== Object.keys(sourceByKind).length) throw new Error('Incomplete Clear Roster targets')
  const targets = new Set()
  state.operations.forEach(operation => {
    const original = sourceByKind[operation.kind]
    if (!original || original.id !== operation.docId || !sameClearRosterValue(original, operation.source)) {
      throw new Error('Approved source document differs from prepared source')
    }
    const paths = getClearRosterAllowedPaths({
      kind: operation.kind, source: original, identity,
      teamRoot: sources.teamRoot, teamSeason: sources.teamSeason,
    }).map(path => JSON.stringify(path))
    const submitted = operation.changes.map(change => JSON.stringify(change.path))
    if (
      submitted.length !== paths.length || new Set(submitted).size !== submitted.length ||
      submitted.some(path => !paths.includes(path))
    ) throw new Error('Unowned, duplicate or missing Clear Roster path')
    const target = `${operation.kind}:${operation.docId}`
    if (targets.has(target)) throw new Error('Duplicate approved document target')
    targets.add(target)
    const next = applyClearRosterChanges(operation.source, operation.changes)
    if (operation.kind === 'teamSeason') {
      if (getTeamSeasonRosterState(next) !== 'absent' || getTeamSeasonStatsState(next) !== 'absent') {
        throw new Error('Invalid approved canonical absence')
      }
      Object.keys(operation.source).filter(field => !ROSTER_CLEAR_FIELDS.includes(field)).forEach(field => {
        if (!sameClearRosterValue(next[field], operation.source[field])) throw new Error('Protected canonical field changed')
      })
    }
  })
  state.deletions.forEach(operation => {
    if (
      operation.source.id !== operation.docId ||
      operation.source.birthTeamDocumentId !== identity.birthTeamDocumentId ||
      !sameClearRosterSeason(operation.source.seasonKey || operation.source.seasonId, identity.seasonKey) ||
      operation.source.leagueId !== identity.leagueId ||
      operation.source.entityType !== 'playerSeason'
    ) throw new Error('Foreign approved Player SearchIndex')
    const target = `playerIndex:${operation.docId}`
    if (targets.has(target)) throw new Error('Duplicate player index target')
    targets.add(target)
  })
  freeze(state)
  approvedStates.add(state)
  return state
}

export const assertClearRosterApprovedState = state => {
  if (!approvedStates.has(state)) throw new Error('Clear Roster writer requires Approved State')
}
