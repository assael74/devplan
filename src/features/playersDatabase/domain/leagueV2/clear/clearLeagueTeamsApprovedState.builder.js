// src/features/playersDatabase/domain/leagueV2/clear/clearLeagueTeamsApprovedState.builder.js

import { cloneValue, assertDocumentId, sameValue } from './leagueTeamsClearedState.builder.js'
import { buildClearLeagueTeamsPlan, resolveClearLeagueScope, assertClearLeagueDependencies } from './clearLeagueTeamsPlan.builder.js'

const proposals = new WeakSet()
const approved = new WeakSet()
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

// All business outputs are constructed here once, then cloned and frozen.
export const prepareClearLeagueProposal = (sources, target, preparedAt) => {
  const proposal = freeze(cloneValue(buildClearLeagueTeamsPlan(sources, target, preparedAt)))
  proposals.add(proposal)
  return proposal
}

export const buildClearLeagueTeamsApprovedState = proposal => {
  if (!proposals.has(proposal)) throw new Error('Fresh prepared proposal required')
  const scope = resolveClearLeagueScope(proposal.sources, proposal.identity)
  assertClearLeagueDependencies(scope)
  if (!sameValue(scope.identity, proposal.identity)) throw new Error('Approved identity mismatch')
  const targets = new Set()
  const kinds = ['league', 'team', 'teamIndex', 'identity', 'club', 'clubsMaster', 'leaguesMaster']
  proposal.operations.forEach(operation => {
    assertDocumentId(operation.docId)
    if (!kinds.includes(operation.kind)) throw new Error('Invalid approved operation')
    const key = `${operation.kind}:${operation.docId}`
    if (targets.has(key)) throw new Error('Duplicate approved target')
    targets.add(key)
    if (operation.kind === 'team') {
      assertDocumentId(operation.rootId)
      if (targets.has(`root:${operation.rootId}`)) throw new Error('Duplicate Root target')
      targets.add(`root:${operation.rootId}`)
    }
  })
  // The immutable, locally registered proposal cannot be replaced by a submitted payload.
  const state = freeze(cloneValue(proposal))
  approved.add(state)
  return state
}

export const assertClearLeagueApprovedState = state => {
  if (!approved.has(state)) throw new Error('Clear League Approved State required')
}
