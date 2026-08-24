// src/features/playersDatabase/services/audit/invalidTransferPlayerCleanup.migration.js

import {
  createPlayerDocumentCleanupMigration,
  hasRealPlayerTransfer,
} from './playerDocumentCleanup.migration.js'
import {
  resolvePlayerTrackingReasons,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from '../write/players/scoutingPlayerLifecycle.model.js'

const invalidTransferCleanup = createPlayerDocumentCleanupMigration({
  action: 'invalid-transfer-player-cleanup',
  label: 'Invalid transfer cleanup',
  isCandidate: ({ player }) => {
    const reasons = resolvePlayerTrackingReasons(player)

    return (
      reasons.length === 1 &&
      reasons[0] === SCOUTING_PLAYER_TRACKING_REASONS.TRANSFER &&
      !hasRealPlayerTransfer(player)
    )
  },
})

export const buildInvalidTransferPlayerCleanupPreview = (
  invalidTransferCleanup.buildPreview
)

export const applyInvalidTransferPlayerTeamCleanup = (
  invalidTransferCleanup.applyTeamCleanup
)

export const applyInvalidTransferPlayerSearchIndexCleanup = (
  invalidTransferCleanup.applySearchIndexCleanup
)

export const applyInvalidTransferPlayerDocumentDelete = (
  invalidTransferCleanup.applyPlayerDocumentDelete
)

export const verifyInvalidTransferPlayerCleanup = (
  invalidTransferCleanup.verifyCleanup
)
