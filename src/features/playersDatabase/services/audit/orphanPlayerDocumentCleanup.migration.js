// src/features/playersDatabase/services/audit/orphanPlayerDocumentCleanup.migration.js

import {
  createPlayerDocumentCleanupMigration,
  hasRealPlayerTransfer,
} from './playerDocumentCleanup.migration.js'
import {
  resolvePlayerTrackingReasons,
} from '../write/players/scoutingPlayerLifecycle.model.js'

const orphanPlayerDocumentCleanup = createPlayerDocumentCleanupMigration({
  action: 'orphan-player-document-cleanup',
  label: 'Orphan player document cleanup',
  requiresTeamTruth: true,
  preDeleteTeamTruthScope: 'affectedTeamDocuments',
  allowLegacyTeamScopeRecoveryFromTeams: true,
  isCandidate: ({ player, teamTruth }) => (
    resolvePlayerTrackingReasons(player).length === 0 &&
    !hasRealPlayerTransfer(player) &&
    teamTruth?.eligible !== true
  ),
})

export const buildOrphanPlayerDocumentCleanupPreview = (
  orphanPlayerDocumentCleanup.buildPreview
)

export const applyOrphanPlayerDocumentTeamCleanup = (
  orphanPlayerDocumentCleanup.applyTeamCleanup
)

export const applyOrphanPlayerDocumentSearchIndexCleanup = (
  orphanPlayerDocumentCleanup.applySearchIndexCleanup
)

export const applyOrphanPlayerDocumentDelete = (
  orphanPlayerDocumentCleanup.applyPlayerDocumentDelete
)

export const verifyOrphanPlayerDocumentCleanup = (
  orphanPlayerDocumentCleanup.verifyCleanup
)
