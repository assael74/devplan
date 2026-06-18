import {
  FIRESTORE_FREE_TIER_LIMITS,
  FIRESTORE_USAGE_THRESHOLDS,
  resolveUsageStatus,
} from './firestoreUsageThresholds.js'

const EMPTY_BUCKET = {
  reads: 0,
  writes: 0,
  documentDeletes: 0,
  logicalDeletes: 0,
  listeners: 0,
  listenerUpdates: 0,
  estimatedReadKb: 0,
  estimatedWriteKb: 0,
}

const toNumber = value => Number(value || 0)

const roundKb = value =>
  Number(toNumber(value).toFixed(2))

const normalizeBucket = bucket => ({
  ...EMPTY_BUCKET,
  ...(bucket || {}),

  reads: toNumber(bucket?.reads),
  writes: toNumber(bucket?.writes),
  documentDeletes: toNumber(bucket?.documentDeletes),
  logicalDeletes: toNumber(bucket?.logicalDeletes),
  listeners: toNumber(bucket?.listeners),
  listenerUpdates: toNumber(bucket?.listenerUpdates),

  estimatedReadKb: roundKb(bucket?.estimatedReadKb),
  estimatedWriteKb: roundKb(bucket?.estimatedWriteKb),
})

const bucketTotalOperations = bucket =>
  toNumber(bucket.reads) +
  toNumber(bucket.writes) +
  toNumber(bucket.documentDeletes) +
  toNumber(bucket.logicalDeletes) +
  toNumber(bucket.listenerUpdates)

const bucketTotalKb = bucket =>
  roundKb(
    toNumber(bucket.estimatedReadKb) +
      toNumber(bucket.estimatedWriteKb)
  )

const addEntryToBucket = (bucket, entry) => {
  if (entry.operation === 'read') {
    bucket.reads += toNumber(entry.readsCount) || toNumber(entry.docsCount)
    bucket.estimatedReadKb += toNumber(entry.estimatedKb)
  }

  if (entry.operation === 'write') {
    bucket.writes += toNumber(entry.writesCount) || 1
    bucket.estimatedWriteKb += toNumber(entry.estimatedKb)
  }

  if (entry.operation === 'document-delete') {
    bucket.documentDeletes += toNumber(entry.documentDeletesCount) || 1
  }

  if (entry.operation === 'logical-delete') {
    bucket.logicalDeletes += toNumber(entry.logicalDeletesCount) || 1
  }

  if (entry.operation === 'transaction') {
    bucket.reads += toNumber(entry.readsCount)
    bucket.writes += toNumber(entry.writesCount)
    bucket.documentDeletes += toNumber(entry.documentDeletesCount)
    bucket.logicalDeletes += toNumber(entry.logicalDeletesCount)
    bucket.estimatedReadKb += toNumber(entry.estimatedReadKb)
    bucket.estimatedWriteKb += toNumber(entry.estimatedWriteKb)
  }

  if (entry.operation === 'listener-open') {
    bucket.listeners += 1
  }

  if (entry.operation === 'listener-update') {
    bucket.listenerUpdates += 1
    bucket.reads += toNumber(entry.readsCount) || toNumber(entry.docsCount)
    bucket.estimatedReadKb += toNumber(entry.estimatedKb)
  }
}

const ensureRecordBucket = (record, key) => {
  const cleanKey = key || 'unknown'

  if (!record[cleanKey]) {
    record[cleanKey] = { ...EMPTY_BUCKET }
  }

  return record[cleanKey]
}

const addEntryToRecord = (record, key, entry) => {
  if (!key) return
  addEntryToBucket(ensureRecordBucket(record, key), entry)
}

const buildRecordsFromEntries = entries => {
  const totals = { ...EMPTY_BUCKET }
  const byCollection = {}
  const byShortKey = {}
  const byFeature = {}
  const byAction = {}

  entries.forEach(entry => {
    addEntryToBucket(totals, entry)
    addEntryToRecord(byCollection, entry.collection || 'unknown', entry)
    addEntryToRecord(byShortKey, entry.shortKey, entry)
    addEntryToRecord(byFeature, entry.feature || 'unknown', entry)
    addEntryToRecord(byAction, entry.action || 'unknown', entry)
  })

  return {
    totals,
    byCollection,
    byShortKey,
    byFeature,
    byAction,
  }
}

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

const sortRows = (
  rows,
  field = 'totalEstimatedKb'
) =>
  [...rows].sort((a, b) => {
    const fieldDiff =
      toNumber(b?.[field]) -
      toNumber(a?.[field])

    if (fieldDiff !== 0) return fieldDiff

    return String(a?.name || '').localeCompare(
      String(b?.name || '')
    )
  })

const buildKpis = totals => [
  {
    id: 'reads',
    label: 'Reads בסשן',
    value: totals.reads,
    format: 'number',
    status: resolveUsageStatus(
      totals.reads,
      FIRESTORE_USAGE_THRESHOLDS.reads
    ),
  },
  {
    id: 'writes',
    label: 'Writes בסשן',
    value: totals.writes,
    format: 'number',
    status: resolveUsageStatus(
      totals.writes,
      FIRESTORE_USAGE_THRESHOLDS.writes
    ),
  },
  {
    id: 'logicalDeletes',
    label: 'מחיקות לוגיות',
    value: totals.logicalDeletes,
    format: 'number',
    status: resolveUsageStatus(
      totals.logicalDeletes,
      FIRESTORE_USAGE_THRESHOLDS.logicalDeletes
    ),
  },
  {
    id: 'listenerUpdates',
    label: 'Listener Updates',
    value: totals.listenerUpdates,
    format: 'number',
    status: resolveUsageStatus(
      totals.listenerUpdates,
      FIRESTORE_USAGE_THRESHOLDS.listenerUpdates
    ),
  },
  {
    id: 'estimatedReadKb',
    label: 'Estimated Read KB',
    value: totals.estimatedReadKb,
    format: 'kb',
    status: resolveUsageStatus(
      totals.estimatedReadKb,
      FIRESTORE_USAGE_THRESHOLDS.estimatedReadKb
    ),
  },
  {
    id: 'estimatedWriteKb',
    label: 'Estimated Write KB',
    value: totals.estimatedWriteKb,
    format: 'kb',
    status: resolveUsageStatus(
      totals.estimatedWriteKb,
      FIRESTORE_USAGE_THRESHOLDS.estimatedWriteKb
    ),
  },
]

const buildExpensiveActions = actions =>
  (Array.isArray(actions) ? actions : []).map(
    (action, index) => ({
      id:
        action?.createdAt ||
        `${action?.action || 'action'}-${index}`,

      collection: action?.collection || 'unknown',
      shortKey: action?.shortKey || null,
      feature: action?.feature || 'unknown',
      action: action?.action || 'unknown',
      operation: action?.operation || 'unknown',

      reads:
        toNumber(action?.readsCount) ||
        toNumber(action?.docsCount),

      writes: toNumber(action?.writesCount),

      logicalDeletes: toNumber(
        action?.logicalDeletesCount
      ),

      documentDeletes: toNumber(
        action?.documentDeletesCount
      ),

      estimatedReadKb: roundKb(
        action?.estimatedReadKb
      ),

      estimatedWriteKb: roundKb(
        action?.estimatedWriteKb
      ),

      totalEstimatedKb: roundKb(
        action?.totalEstimatedKb
      ),

      createdAt: action?.createdAt || null,
      meta: action?.meta || null,
    })
  )

const buildRecentEntries = entries =>
  (Array.isArray(entries) ? entries : []).map(
    (entry, index) => ({
      id: entry?.createdAt || `${entry?.action || 'entry'}-${index}`,
      createdAt: entry?.createdAt || null,
      collection: entry?.collection || 'unknown',
      shortKey: entry?.shortKey || null,
      feature: entry?.feature || 'unknown',
      action: entry?.action || 'unknown',
      operation: entry?.operation || 'unknown',
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
    })
  )

const buildFilterOptions = (entries, snapshot) => {
  const featureSet = new Set()

  if (Array.isArray(entries)) {
    entries.forEach(entry => {
      if (entry?.feature) featureSet.add(entry.feature)
    })
  }

  Object.keys(snapshot?.byFeature || {}).forEach(feature =>
    featureSet.add(feature)
  )

  return {
    features: [
      { id: 'all', label: 'הכל' },
      ...Array.from(featureSet)
        .sort((a, b) => String(a).localeCompare(String(b)))
        .map(feature => ({
          id: feature,
          label: feature,
        })),
    ],
  }
}

const buildBillingLimits = totals => {
  const dailyReads = FIRESTORE_FREE_TIER_LIMITS.reads.limit
  const dailyWrites = FIRESTORE_FREE_TIER_LIMITS.writes.limit
  const dailyDeletes = FIRESTORE_FREE_TIER_LIMITS.documentDeletes.limit

  const rows = [
    {
      id: 'reads',
      label: 'Reads חינם ביום',
      value: toNumber(totals.reads),
      limit: dailyReads,
      unit: 'reads',
      period: 'day',
    },
    {
      id: 'writes',
      label: 'Writes חינם ביום',
      value: toNumber(totals.writes),
      limit: dailyWrites,
      unit: 'writes',
      period: 'day',
    },
    {
      id: 'deletes',
      label: 'Deletes חינם ביום',
      value:
        toNumber(totals.documentDeletes) +
        toNumber(totals.logicalDeletes),
      limit: dailyDeletes,
      unit: 'deletes',
      period: 'day',
    },
  ].map(row => ({
    ...row,
    percent: row.limit
      ? Math.min(100, (row.value / row.limit) * 100)
      : 0,
    remaining: Math.max(0, row.limit - row.value),
    status: resolveUsageStatus(row.value, {
      warning: row.limit * 0.7,
      danger: row.limit * 0.9,
    }),
  }))

  return {
    rows,
    sourceUrl: 'https://firebase.google.com/docs/firestore/quotas',
    note:
      'Free tier: 50K reads/day, 20K writes/day, 20K deletes/day, 1 GiB stored, 10 GiB outbound transfer/month. Quotas reset around midnight Pacific time.',
  }
}

export function buildFirestoreUsageViewModel(
  snapshot,
  options = {}
) {
  const selectedFeature = options.feature || 'all'
  const allEntries = Array.isArray(snapshot?.recentEntries)
    ? snapshot.recentEntries
    : []
  const filteredEntries =
    selectedFeature === 'all'
      ? allEntries
      : allEntries.filter(entry => entry?.feature === selectedFeature)

  const hasEntrySource = allEntries.length > 0
  const source = hasEntrySource
    ? buildRecordsFromEntries(filteredEntries)
    : {
        totals:
          selectedFeature === 'all'
            ? snapshot?.totals
            : snapshot?.byFeature?.[selectedFeature],
        byCollection:
          selectedFeature === 'all'
            ? snapshot?.byCollection
            : {},
        byShortKey:
          selectedFeature === 'all'
            ? snapshot?.byShortKey
            : {},
        byFeature:
          selectedFeature === 'all'
            ? snapshot?.byFeature
            : {
                [selectedFeature]: snapshot?.byFeature?.[selectedFeature],
              },
        byAction:
          selectedFeature === 'all'
            ? snapshot?.byAction
            : {},
      }

  const totals = normalizeBucket(source.totals)
  const collections = sortRows(
    mapBucketRecord(source.byCollection)
  )
  const shortKeys = sortRows(
    mapBucketRecord(source.byShortKey)
  )
  const features = sortRows(
    mapBucketRecord(source.byFeature)
  )
  const actions = sortRows(
    mapBucketRecord(source.byAction)
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
    startedAt: snapshot?.startedAt || null,
    updatedAt: snapshot?.updatedAt || null,
    selectedFeature,

    totals,
    kpis: buildKpis(totals),
    billingLimits: buildBillingLimits(totals),
    filterOptions: buildFilterOptions(allEntries, snapshot),

    collections,
    shortKeys,
    features,
    actions,
    expensiveActions,
    recentEntries,

    hasActivity:
      bucketTotalOperations(totals) > 0 ||
      bucketTotalKb(totals) > 0,

    summary: {
      collectionsCount: collections.length,
      featuresCount: features.length,
      actionsCount: actions.length,
      expensiveActionsCount:
        expensiveActions.length,
      totalOperations:
        bucketTotalOperations(totals),
      totalEstimatedKb:
        bucketTotalKb(totals),
    },
  }
}
