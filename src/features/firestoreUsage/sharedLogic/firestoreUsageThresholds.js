// src/features/firestoreUsage/sharedLogic/firestoreUsageThresholds.js

export const FIRESTORE_USAGE_THRESHOLDS = {
  reads: {
    warning: 500,
    danger: 1500,
  },

  writes: {
    warning: 100,
    danger: 500,
  },

  logicalDeletes: {
    warning: 50,
    danger: 200,
  },

  listenerUpdates: {
    warning: 100,
    danger: 500,
  },

  estimatedReadKb: {
    warning: 1000,
    danger: 5000,
  },

  estimatedWriteKb: {
    warning: 500,
    danger: 2000,
  },

  collectionReadKb: {
    warning: 500,
    danger: 1500,
  },

  actionTotalKb: {
    warning: 250,
    danger: 1000,
  },
}

export const FIRESTORE_FREE_TIER_LIMITS = {
  reads: {
    label: 'Document reads',
    limit: 50000,
    period: 'day',
  },

  writes: {
    label: 'Document writes',
    limit: 20000,
    period: 'day',
  },

  documentDeletes: {
    label: 'Document deletes',
    limit: 20000,
    period: 'day',
  },

  storedGb: {
    label: 'Stored data',
    limit: 1,
    period: 'total',
    unit: 'GiB',
  },

  networkEgressGb: {
    label: 'Outbound data transfer',
    limit: 10,
    period: 'month',
    unit: 'GiB',
  },
}

export function resolveUsageStatus(value, thresholds = {}) {
  const numericValue = Number(value || 0)
  const warning = Number(thresholds.warning || 0)
  const danger = Number(thresholds.danger || 0)

  if (danger > 0 && numericValue >= danger) {
    return 'danger'
  }

  if (warning > 0 && numericValue >= warning) {
    return 'warning'
  }

  return 'normal'
}

export function getUsageStatusColor(status) {
  if (status === 'danger') return 'danger'
  if (status === 'warning') return 'warning'

  return 'success'
}
