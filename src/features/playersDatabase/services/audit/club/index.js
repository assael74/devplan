// src/features/playersDatabase/services/audit/club/index.js

import { compareClubBootstrapState } from '../../../domain/club/bootstrapClubCatalog.builder.js'
import { readClubBootstrapActual } from './readActual.js'

export const auditClubBootstrap = async ({ approvedState }) => {
  if (!approvedState || approvedState.kind !== 'clubBootstrapApprovedState') {
    throw new Error('Approved Club bootstrap state is required')
  }

  const actual = await readClubBootstrapActual()
  const findings = compareClubBootstrapState({
    approvedState,
    profiles: actual.profiles,
    directory: actual.directory,
  })

  return {
    flowType: 'clubBootstrap',
    status: findings.length ? 'FINDINGS' : 'CLEAN',
    findings,
    coverage: {
      complete: true,
      coveredTargets: ['clubProfiles', 'clubsDirectory'],
      uncoveredTargets: [],
    },
    summary: {
      findingsCount: findings.length,
      expectedClubs: approvedState.summary.clubsCount,
      checkedClubs: actual.profiles.length,
    },
  }
}
