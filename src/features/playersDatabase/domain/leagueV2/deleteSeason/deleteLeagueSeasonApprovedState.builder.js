// src/features/playersDatabase/domain/leagueV2/deleteSeason/deleteLeagueSeasonApprovedState.builder.js

import { cloneValue, sameValue } from '../clear/leagueTeamsClearedState.builder.js'
import { buildDeleteLeagueSeasonPlan } from './deleteLeagueSeason.builder.js'

const proposals = new WeakSet()
const approved = new WeakSet()
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

export const prepareDeleteSeasonProposal = (sources, target, preparedAt) => {
  const proposal = freeze(cloneValue(buildDeleteLeagueSeasonPlan(sources, target, preparedAt)))
  proposals.add(proposal)
  return proposal
}

export const approveDeleteSeason = proposal => {
  if (!proposals.has(proposal)) throw new Error('Fresh registered proposal required')
  const seen = new Set()
  for (const operation of proposal.operations) {
    if (seen.has(operation.kind)) throw new Error('Duplicate target')
    seen.add(operation.kind)
    if (operation.kind === 'league') {
      if (operation.docId !== proposal.identity.leagueId || Object.keys(operation.patch).length !== 2 || !operation.patch.updatedAt ||
          !['current', 'history'].includes(Object.keys(operation.patch).find(key => key !== 'updatedAt'))) throw new Error('Invalid League target')
      const source = proposal.sources.leagues.find(row => row.docId === operation.docId)
      if (!source || !sameValue(source.data, operation.before)) throw new Error('Source mismatch')
    } else if (operation.kind !== 'leaguesMaster' || operation.docId !== 'all' ||
        Object.keys(operation.patch).sort().join(',') !== 'leagues,summary') {
      throw new Error('Invalid Master target')
    }
  }
  if (!seen.has('leaguesMaster')) throw new Error('Master target required')
  // Trusted proposal is already immutable. Validation does not recompute outputs.
  const state = freeze(cloneValue(proposal))
  approved.add(state)
  return state
}

export const assertApprovedDeleteSeason = state => {
  if (!approved.has(state)) throw new Error('Approved Delete Season State required')
}
