import { getFirestoreUsageCoverage } from '../../../services/firestore/usage/index.js'
import {
  FIRESTORE_FREE_TIER_LIMITS,
  FIRESTORE_USAGE_THRESHOLDS,
  resolveUsageStatus,
} from './firestoreUsageThresholds.js'

const EMPTY_BUCKET = {
  calls: 0,
  failures: 0,
  durationMs: 0,
  reads: 0,
  writes: 0,
  documentDeletes: 0,
  logicalDeletes: 0,
  listeners: 0,
  activeListeners: 0,
  listenerCloses: 0,
  listenerInitials: 0,
  listenerUpdates: 0,
  estimatedReadKb: 0,
  estimatedWriteKb: 0,
}

const toNumber = value => Number(value || 0)
const roundKb = value => Number(toNumber(value).toFixed(2))

const normalizeBucket = bucket => ({
  ...EMPTY_BUCKET,
  ...(bucket || {}),
  calls: toNumber(bucket?.calls),
  failures: toNumber(bucket?.failures),
  durationMs: toNumber(bucket?.durationMs),
  reads: toNumber(bucket?.reads),
  writes: toNumber(bucket?.writes),
  documentDeletes: toNumber(bucket?.documentDeletes),
  logicalDeletes: toNumber(bucket?.logicalDeletes),
  listeners: toNumber(bucket?.listeners),
  activeListeners: toNumber(bucket?.activeListeners),
  listenerCloses: toNumber(bucket?.listenerCloses),
  listenerInitials: toNumber(bucket?.listenerInitials),
  listenerUpdates: toNumber(bucket?.listenerUpdates),
  estimatedReadKb: roundKb(bucket?.estimatedReadKb),
  estimatedWriteKb: roundKb(bucket?.estimatedWriteKb),
})

const bucketTotalOperations = bucket =>
  toNumber(bucket.reads) +
  toNumber(bucket.writes) +
  toNumber(bucket.documentDeletes) +
  toNumber(bucket.listenerUpdates)

const bucketTotalKb = bucket =>
  roundKb(
    toNumber(bucket.estimatedReadKb) +
      toNumber(bucket.estimatedWriteKb)
  )

const mapBucketRecord = record =>
  Object.entries(record || {}).map(([key, rawBucket]) => {
    const bucket = normalizeBucket(rawBucket)

    return {
      key,
      name: key,
      ...bucket,
      totalOperations: bucketTotalOperations(bucket),
      totalEstimatedKb: bucketTotalKb(bucket),
    }
  })

const mapProcessRecord = record =>
  Object.entries(record || {}).map(([key, rawBucket]) => {
    const [feature, action, collection] = String(key).split('::')
    const bucket = normalizeBucket(rawBucket)
    const calls = Math.max(1, bucket.calls)

    return {
      key,
      name: action || 'unknown',
      feature: feature || 'unknown',
      action: action || 'unknown',
      collection: collection || 'unknown',
      ...bucket,
      totalOperations: bucketTotalOperations(bucket),
      totalEstimatedKb: bucketTotalKb(bucket),
      averageReads: Number((bucket.reads / calls).toFixed(2)),
      averageWrites: Number((bucket.writes / calls).toFixed(2)),
      averageDurationMs: Number((bucket.durationMs / calls).toFixed(2)),
    }
  })

const resolveProcessRisk = row => {
  if (row.failures > 0 || row.averageReads >= 500 || row.writes >= 1000) {
    return 'danger'
  }

  if (row.averageReads >= 100 || row.writes >= 250 || row.calls >= 100) {
    return 'warning'
  }

  return 'success'
}

const sortRows = (rows, field = 'totalEstimatedKb') =>
  [...rows].sort((a, b) => {
    const fieldDiff = toNumber(b?.[field]) - toNumber(a?.[field])
    if (fieldDiff !== 0) return fieldDiff

    return String(a?.name || '').localeCompare(String(b?.name || ''))
  })

const buildKpis = totals => [
  {
    id: 'reads',
    label: 'Tracked Reads בסשן',
    value: totals.reads,
    format: 'number',
    status: resolveUsageStatus(
      totals.reads,
      FIRESTORE_USAGE_THRESHOLDS.reads
    ),
  },
  {
    id: 'writes',
    label: 'Tracked Writes בסשן',
    value: totals.writes,
    format: 'number',
    status: resolveUsageStatus(
      totals.writes,
      FIRESTORE_USAGE_THRESHOLDS.writes
    ),
  },
  {
    id: 'documentDeletes',
    label: 'Document Deletes',
    value: totals.documentDeletes,
    format: 'number',
    status: resolveUsageStatus(
      totals.documentDeletes,
      FIRESTORE_USAGE_THRESHOLDS.documentDeletes
    ),
  },
  {
    id: 'activeListeners',
    label: 'Listeners פעילים כרגע',
    value: totals.activeListeners,
    format: 'number',
    status: resolveUsageStatus(
      totals.activeListeners,
      FIRESTORE_USAGE_THRESHOLDS.activeListeners
    ),
  },
]

const buildExpensiveActions = actions =>
  (Array.isArray(actions) ? actions : []).map((action, index) => ({
    id: action?.id || action?.createdAt || `${action?.action || 'action'}-${index}`,
    collection: action?.collection || 'unknown',
    shortKey: action?.shortKey || null,
    feature: action?.feature || 'unknown',
    action: action?.action || 'unknown',
    operation: action?.operation || 'unknown',
    reads: toNumber(action?.readsCount) || toNumber(action?.docsCount),
    writes: toNumber(action?.writesCount),
    logicalDeletes: toNumber(action?.logicalDeletesCount),
    documentDeletes: toNumber(action?.documentDeletesCount),
    estimatedReadKb: roundKb(action?.estimatedReadKb),
    estimatedWriteKb: roundKb(action?.estimatedWriteKb),
    totalEstimatedKb: roundKb(action?.totalEstimatedKb),
    createdAt: action?.createdAt || null,
    meta: action?.meta || null,
  }))

const buildRecentEntries = entries =>
  (Array.isArray(entries) ? entries : []).map((entry, index) => ({
    id: entry?.id || entry?.createdAt || `${entry?.action || 'entry'}-${index}`,
    createdAt: entry?.createdAt || null,
    collection: entry?.collection || 'unknown',
    shortKey: entry?.shortKey || null,
    feature: entry?.feature || 'unknown',
    action: entry?.action || 'unknown',
    operation: entry?.operation || 'unknown',
    displayOperation:
      entry?.operation === 'listener-update' && entry?.listenerPhase === 'initial'
        ? 'listener-initial'
        : entry?.operation || 'unknown',
    operationSubtype: entry?.operationSubtype || null,
    listenerId: entry?.listenerId || null,
    listenerPhase: entry?.listenerPhase || null,
    fromCache: Boolean(entry?.fromCache),
    status: entry?.status || 'success',
    reads: toNumber(entry?.readsCount) || toNumber(entry?.docsCount),
    writes: toNumber(entry?.writesCount),
    logicalDeletes: toNumber(entry?.logicalDeletesCount),
    documentDeletes: toNumber(entry?.documentDeletesCount),
    estimatedReadKb: roundKb(entry?.estimatedReadKb || entry?.estimatedKb),
    estimatedWriteKb: roundKb(entry?.estimatedWriteKb),
    totalEstimatedKb: roundKb(
      toNumber(entry?.estimatedKb) +
        toNumber(entry?.estimatedReadKb) +
        toNumber(entry?.estimatedWriteKb)
    ),
    meta: entry?.meta || null,
  }))

const buildFilterOptions = snapshot => ({
  features: [
    { id: 'all', label: 'הכל' },
    ...Object.keys(snapshot?.byFeature || {})
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(feature => ({ id: feature, label: feature })),
  ],
})

const buildBillingLimits = totals => {
  const rows = [
    {
      id: 'reads',
      label: 'Reads שנמדדו בסשן',
      value: toNumber(totals.reads),
      limit: FIRESTORE_FREE_TIER_LIMITS.reads.limit,
      unit: 'reads',
      period: 'day',
    },
    {
      id: 'writes',
      label: 'Writes שנמדדו בסשן',
      value: toNumber(totals.writes),
      limit: FIRESTORE_FREE_TIER_LIMITS.writes.limit,
      unit: 'writes',
      period: 'day',
    },
    {
      id: 'deletes',
      label: 'Deletes שנמדדו בסשן',
      value: toNumber(totals.documentDeletes),
      limit: FIRESTORE_FREE_TIER_LIMITS.documentDeletes.limit,
      unit: 'deletes',
      period: 'day',
    },
  ].map(row => ({
    ...row,
    percent: row.limit ? Math.min(100, (row.value / row.limit) * 100) : 0,
    remaining: Math.max(0, row.limit - row.value),
    status: resolveUsageStatus(row.value, {
      warning: row.limit * 0.5,
      danger: row.limit * 0.75,
    }),
  }))

  return {
    rows,
    sourceUrl: 'https://firebase.google.com/docs/firestore/pricing',
    title: 'השוואת הסשן למכסת ייחוס',
    subtitle: 'App instrumentation — לא נתוני Billing רשמיים',
    note:
      'המספרים מייצגים רק פעולות שנמדדו בטאב הנוכחי. לבדיקת חיוב בפועל יש להשתמש ב-Firebase Usage וב-Google Cloud Billing.',
  }
}

const resolveSource = (snapshot, selectedFeature) => {
  if (selectedFeature === 'all') {
    return {
      totals: snapshot?.totals,
      byCollection: snapshot?.byCollection,
      byShortKey: snapshot?.byShortKey,
      byFeature: snapshot?.byFeature,
      byAction: snapshot?.byAction,
      byProcess: snapshot?.byProcess,
    }
  }

  const details = snapshot?.byFeatureDetails?.[selectedFeature]

  return {
    totals: details?.totals || snapshot?.byFeature?.[selectedFeature],
    byCollection: details?.byCollection || {},
    byShortKey: details?.byShortKey || {},
    byFeature: {
      [selectedFeature]: details?.totals || snapshot?.byFeature?.[selectedFeature],
    },
    byAction: details?.byAction || {},
    byProcess: details?.byProcess || {},
  }
}

export function buildFirestoreUsageViewModel(snapshot, options = {}) {
  const selectedFeature = options.feature || 'all'
  const allEntries = Array.isArray(snapshot?.recentEntries)
    ? snapshot.recentEntries
    : []
  const filteredEntries =
    selectedFeature === 'all'
      ? allEntries
      : allEntries.filter(entry => entry?.feature === selectedFeature)

  const source = resolveSource(snapshot, selectedFeature)
  const totals = normalizeBucket(source.totals)
  const collections = sortRows(mapBucketRecord(source.byCollection))
  const shortKeys = sortRows(mapBucketRecord(source.byShortKey))
  const features = sortRows(mapBucketRecord(source.byFeature))
  const actions = sortRows(mapBucketRecord(source.byAction))
  const processes = sortRows(
    mapProcessRecord(source.byProcess).map(row => ({
      ...row,
      risk: resolveProcessRisk(row),
    })),
    'totalOperations'
  )
  const expensiveActions = buildExpensiveActions(
    selectedFeature === 'all'
      ? snapshot?.expensiveActions
      : (snapshot?.expensiveActions || []).filter(
          action => action?.feature === selectedFeature
        )
  )
  const recentEntries = buildRecentEntries(filteredEntries)

  return {
    coverage: getFirestoreUsageCoverage(),
    startedAt: snapshot?.startedAt || null,
    updatedAt: snapshot?.updatedAt || null,
    selectedFeature,
    totals,
    kpis: buildKpis(totals),
    billingLimits: buildBillingLimits(totals),
    payloadSummary: {
      estimatedReadKb: totals.estimatedReadKb,
      estimatedWriteKb: totals.estimatedWriteKb,
      totalEstimatedKb: bucketTotalKb(totals),
    },
    filterOptions: buildFilterOptions(snapshot),
    collections,
    shortKeys,
    features,
    actions,
    processes,
    expensiveActions,
    recentEntries,
    activeListeners: Object.values(snapshot?.activeListenerIds || {}),
    officialSources: {
      billingStatus: 'not-connected',
      plan: 'Blaze',
      links: [
        {
          id: 'firestore-usage',
          label: 'Firebase Usage',
          href: 'https://console.firebase.google.com/',
        },
        {
          id: 'cloud-billing',
          label: 'Google Cloud Billing',
          href: 'https://console.cloud.google.com/billing',
        },
        {
          id: 'firestore-monitoring',
          label: 'Firestore Monitoring',
          href: 'https://console.cloud.google.com/firestore/databases',
        },
      ],
    },
    hasActivity:
      bucketTotalOperations(totals) > 0 || bucketTotalKb(totals) > 0,
    summary: {
      collectionsCount: collections.length,
      featuresCount: features.length,
      actionsCount: actions.length,
      processesCount: processes.length,
      failuresCount: totals.failures,
      expensiveActionsCount: expensiveActions.length,
      totalOperations: bucketTotalOperations(totals),
      totalEstimatedKb: bucketTotalKb(totals),
      activeListeners: totals.activeListeners,
      listenerOpens: totals.listeners,
      listenerCloses: totals.listenerCloses,
      listenerInitials: totals.listenerInitials,
      listenerUpdates: totals.listenerUpdates,
      logicalDeletes: totals.logicalDeletes,
      recentEntriesRetained: allEntries.length,
      recentEntriesAreSample: allEntries.length >= 200,
    },
  }
}
