// src/features/reports/service/firestore/measurePublicReportDocument.js

const FIRESTORE_DOCUMENT_LIMIT_BYTES = 1024 * 1024
const RECOMMENDED_LIMIT_BYTES = 850 * 1024
const WARNING_LIMIT_BYTES = 950 * 1024

function encodeUtf8(value) {
  return new TextEncoder().encode(value).length
}

function serializeForMeasurement(value) {
  const ancestors = []

  return JSON.stringify(value, function serializeValue(key, currentValue) {
    if (typeof currentValue === 'undefined') return null
    if (typeof currentValue === 'bigint') return currentValue.toString()

    if (currentValue instanceof Date) {
      return currentValue.toISOString()
    }

    if (
      currentValue &&
      typeof currentValue === 'object' &&
      typeof currentValue.toDate === 'function'
    ) {
      const date = currentValue.toDate()
      return date instanceof Date ? date.toISOString() : String(date || '')
    }

    if (!currentValue || typeof currentValue !== 'object') {
      return currentValue
    }

    while (
      ancestors.length &&
      ancestors[ancestors.length - 1] !== this
    ) {
      ancestors.pop()
    }

    if (ancestors.includes(currentValue)) {
      throw new TypeError(
        `[publicReport] Cannot measure circular field "${key}".`
      )
    }

    ancestors.push(currentValue)
    return currentValue
  })
}

function measureValue(value) {
  const serialized = serializeForMeasurement(value)
  const bytes = encodeUtf8(serialized || '')

  return {
    bytes,
    kb: Number((bytes / 1024).toFixed(2)),
    mb: Number((bytes / 1024 / 1024).toFixed(4)),
  }
}

function resolveStatus(bytes) {
  if (bytes >= FIRESTORE_DOCUMENT_LIMIT_BYTES) return 'blocked'
  if (bytes >= WARNING_LIMIT_BYTES) return 'critical'
  if (bytes >= RECOMMENDED_LIMIT_BYTES) return 'warning'
  return 'safe'
}

function resolveRows(document = {}) {
  const reportContent = document.reportContent || {}
  return Array.isArray(reportContent.rows) ? reportContent.rows : []
}

function buildDocumentWithoutRows(document = {}) {
  return {
    ...document,
    reportContent: {
      ...(document.reportContent || {}),
      rows: [],
    },
  }
}

function estimateRowsCapacity({ fixedBytes, averageRowBytes, limitBytes }) {
  if (averageRowBytes <= 0 || fixedBytes >= limitBytes) return 0

  return Math.max(
    0,
    Math.floor((limitBytes - fixedBytes) / averageRowBytes)
  )
}

export function measurePublicReportDocument(document = {}) {
  const reportContent = document.reportContent || {}
  const rows = resolveRows(document)
  const total = measureValue(document)
  const reportContentSize = measureValue(reportContent)
  const rowsSize = measureValue(rows)
  const fixed = measureValue(buildDocumentWithoutRows(document))
  const rowSizes = rows.map(row => measureValue(row).bytes)
  const rowBytes = rowSizes.reduce((sum, bytes) => sum + bytes, 0)
  const averageRowBytes = rows.length
    ? Math.round(rowBytes / rows.length)
    : 0
  const largestRowBytes = rowSizes.length ? Math.max(...rowSizes) : 0

  return {
    status: resolveStatus(total.bytes),
    rowsCount: rows.length,
    total,
    reportContent: reportContentSize,
    rows: rowsSize,
    fixed,
    averageRowBytes,
    averageRowKb: Number((averageRowBytes / 1024).toFixed(2)),
    largestRowBytes,
    largestRowKb: Number((largestRowBytes / 1024).toFixed(2)),
    percentOfFirestoreLimit: Number(
      ((total.bytes / FIRESTORE_DOCUMENT_LIMIT_BYTES) * 100).toFixed(2)
    ),
    remainingBytes: Math.max(
      0,
      FIRESTORE_DOCUMENT_LIMIT_BYTES - total.bytes
    ),
    estimatedRowsCapacity: {
      recommended850Kb: estimateRowsCapacity({
        fixedBytes: fixed.bytes,
        averageRowBytes,
        limitBytes: RECOMMENDED_LIMIT_BYTES,
      }),
      warning950Kb: estimateRowsCapacity({
        fixedBytes: fixed.bytes,
        averageRowBytes,
        limitBytes: WARNING_LIMIT_BYTES,
      }),
      firestoreMaximum: estimateRowsCapacity({
        fixedBytes: fixed.bytes,
        averageRowBytes,
        limitBytes: FIRESTORE_DOCUMENT_LIMIT_BYTES,
      }),
    },
  }
}

export function logPublicReportDocumentMeasurement({
  document = {},
  label = 'publicReport',
} = {}) {
  const measurement = measurePublicReportDocument(document)

  console.groupCollapsed(
    `[${label}] Firestore document measurement: ${measurement.status}`
  )

  console.table({
    document: {
      bytes: measurement.total.bytes,
      kb: measurement.total.kb,
      percent: `${measurement.percentOfFirestoreLimit}%`,
    },
    reportContent: {
      bytes: measurement.reportContent.bytes,
      kb: measurement.reportContent.kb,
      percent: '',
    },
    rows: {
      bytes: measurement.rows.bytes,
      kb: measurement.rows.kb,
      percent: '',
    },
    fixedWithoutRows: {
      bytes: measurement.fixed.bytes,
      kb: measurement.fixed.kb,
      percent: '',
    },
  })

  console.table({
    rowsCount: measurement.rowsCount,
    averageRowBytes: measurement.averageRowBytes,
    averageRowKb: measurement.averageRowKb,
    largestRowBytes: measurement.largestRowBytes,
    largestRowKb: measurement.largestRowKb,
  })

  console.table(measurement.estimatedRowsCapacity)
  console.log('Full measurement:', measurement)
  console.groupEnd()

  return measurement
}
