// src/features/reports/dbSearch/persistence/normalizeDbSearchDocument.js

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

const clean = value => String(value || '').trim()

export function normalizeDbSearchDocument(content = {}) {
  const capabilities = content.dataCapabilities || {}
  const meta = content.meta || {}

  return {
    id: content.id || 'dbSearch',
    type: content.type || 'dbSearch',
    mode: content.mode || 'dbSearch',
    documentVersion: Number(content.documentVersion) || 1,
    meta: {
      ...meta,
      reportName: clean(meta.reportName) || clean(meta.title),
      reportPurpose: clean(meta.reportPurpose),
      reportDescription: clean(meta.reportDescription),
      title: clean(meta.title),
      subtitle: clean(meta.subtitle),
      reportDate: clean(meta.reportDate),
      columns: Number(meta.columns) || 0,
      items: asArray(meta.items),
    },
    entity: content.entity || {},
    snapshot: content.snapshot || {},
    sourceQuery: content.sourceQuery || {},
    dataCapabilities: {
      schema: clean(capabilities.schema),
      domains: asArray(capabilities.domains),
      supports: capabilities.supports && typeof capabilities.supports === 'object'
        ? capabilities.supports
        : {},
      availableDomains: asArray(capabilities.availableDomains),
      availableDimensions: asArray(capabilities.availableDimensions),
      availableFields: asArray(capabilities.availableFields),
    },
    rows: asArray(content.rows),
    presentation: content.presentation || {},
    versions: asArray(content.versions),
  }
}
