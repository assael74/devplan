// src/shared/entityLifecycle/cascade/team/archiveTeamCascadePayments.js

import { patchShortItemsByIds } from '../../../../services/firestore/shorts/shortsPatchMany.js'
import { TEAM_CASCADE_DELETE_KEYS } from './teamCascadeDelete.keys.js'

const now = () => Date.now()

const resolvePaymentSnapshot = ({ payment, plan }) => {
  const byPayment = plan?.paymentSnapshotsById[payment?.id]
  if (byPayment) return byPayment

  const byPlayer = plan?.playerSnapshotsById[payment?.playerId]

  return {
    id: payment?.id || '',
    playerId: byPlayer?.id || payment?.playerId || '',
    playerName: byPlayer?.name || payment?.playerName || payment?.playerFullName || '',
    teamId: plan?.teamSnapshot?.id || payment?.teamId || '',
    teamName: plan?.teamSnapshot?.name || payment?.teamName || '',
    clubId: plan?.teamSnapshot?.clubId || payment?.clubId || '',
    clubName: plan?.teamSnapshot?.clubName || payment?.clubName || '',
  }
}

const buildArchivePatch = ({ payment, plan, archivedAt }) => {
  const snap = resolvePaymentSnapshot({ payment, plan })

  return {
    active: false,
    archived: true,
    archiveReason: 'teamCascadeDelete',
    archivedAt,

    sourceDeleted: true,
    sourceDeletedType: 'team',
    sourceDeletedId: plan.teamId,

    playerId: snap.playerId,
    playerName: snap.playerName,

    teamId: snap.teamId,
    teamName: snap.teamName,

    clubId: snap.clubId,
    clubName: snap.clubName,

    playerSnapshot: {
      id: snap.playerId,
      name: snap.playerName,
    },

    teamSnapshot: {
      id: snap.teamId,
      name: snap.teamName,
    },

    clubSnapshot: {
      id: snap.clubId,
      name: snap.clubName,
    },
  }
}

export async function archiveTeamCascadePayments({ plan }) {
  const paymentIds = Array.from(new Set((plan?.paymentIds || []).filter(Boolean)))

  if (!paymentIds.length) {
    return {
      label: 'paymentsArchive',
      skipped: true,
      ids: [],
      totalPatched: 0,
    }
  }

  const archivedAt = now()

  const res = await patchShortItemsByIds({
    shortKeys: TEAM_CASCADE_DELETE_KEYS.payments,
    ids: paymentIds,
    requireAnyPatched: false,
    patch: ({ item }) => buildArchivePatch({ payment: item, plan, archivedAt }),
  })

  return {
    label: 'paymentsArchive',
    skipped: false,
    ...res,
  }
}
