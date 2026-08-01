// src/features/reports/dbSearch/persistence/dbSearch.schema.js

import { REPORT_TYPES } from '../../reports.constants.js'

const PUBLIC_REPORT_DOCUMENT_FIELDS = {
  id: { type: 'string', required: true },
  schemaVersion: { type: 'number', required: true },
  sourceKey: { type: 'string', required: true },
  reportType: { type: 'string', required: true },
  entityType: { type: 'string', required: true },
  entityId: { type: 'string', required: true },
  status: { type: 'string', required: true },
  currentVersionId: { type: 'string', required: true },
  currentVersionNumber: { type: 'number', required: true },
  versions: { type: 'array', required: true },
  reportContent: { type: 'object', required: true },
  createdBy: { type: 'string', required: false },
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true },
  publishedAt: { type: 'timestamp', required: true },
  viewsCount: { type: 'number', required: true },
}

function createPublicReportSchema({ reportType, content, schemaVersion = 1 } = {}) {
  return {
    schemaVersion,
    reportType,
    document: {
      ...PUBLIC_REPORT_DOCUMENT_FIELDS,
      reportType: {
        type: 'literal',
        value: reportType,
        required: true,
      },
      reportContent: {
        type: 'object',
        required: true,
        fields: content,
      },
    },
    reportContent: content,
  }
}

const META_FIELDS = {
  reportName: { type: 'string', required: true },
  reportPurpose: { type: 'string', required: true },
  reportDescription: { type: 'string', required: false },
  title: { type: 'string', required: true },
  subtitle: { type: 'string', required: false },
  reportDate: { type: 'string', required: true },
  columns: { type: 'number', required: false },
  items: { type: 'array', required: false },
}

const DATA_CAPABILITIES_FIELDS = {
  schema: { type: 'string', required: false },
  domains: { type: 'array', required: false },
  supports: { type: 'object', required: false },
  availableDomains: { type: 'array', required: false },
  availableDimensions: { type: 'array', required: false },
  availableFields: { type: 'array', required: false },
}

export const DB_SEARCH_CONTENT_FIELDS = {
  id: { type: 'literal', value: REPORT_TYPES.DB_SEARCH, required: true },
  type: { type: 'literal', value: REPORT_TYPES.DB_SEARCH, required: true },
  mode: { type: 'literal', value: REPORT_TYPES.DB_SEARCH, required: true },
  documentVersion: { type: 'number', required: true },
  meta: {
    type: 'object',
    required: true,
    fields: META_FIELDS,
  },
  entity: { type: 'object', required: true },
  snapshot: { type: 'object', required: true },
  sourceQuery: { type: 'object', required: true },
  dataCapabilities: {
    type: 'object',
    required: true,
    fields: DATA_CAPABILITIES_FIELDS,
  },
  rows: { type: 'array', required: true },
  presentation: { type: 'object', required: false },
  versions: { type: 'array', required: false },
}

export const dbSearchSchema = createPublicReportSchema({
  reportType: REPORT_TYPES.DB_SEARCH,
  content: DB_SEARCH_CONTENT_FIELDS,
})
