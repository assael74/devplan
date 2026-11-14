// src/application/actions/teamCascade/archiveTeamCascadePayments.js

const resolvePaymentSnapshot = ({ payment, plan }) => {
  const byPayment = plan.paymentSnapshotsById?.[payment.id]
  if (byPayment) return byPayment

  const byPlayer = plan.playerSnapshotsById?.[payment.playerId]

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

export const buildArchivePatch = ({ payment, plan, archivedAt }) => {
  const snap = resolvePaymentSnapshot({ payment, plan })

  return {
    active: false,
    archived: true,
    archiveReason: 'teamCascadeDelete',
    archivedAt: payment.archivedAt == null ? archivedAt : payment.archivedAt,

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
