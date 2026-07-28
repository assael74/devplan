// src/features/reports/teamTargets/persistence/teamTargets.schema.js

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

function createPublicReportSchema({
  reportType,
  content,
  schemaVersion = 1,
} = {}) {
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

const MANAGEMENT_ROW_FIELDS = {
  id: { type: 'string', required: true },
  idIcon: { type: 'string', required: false },
  label: { type: 'string', required: true },
  value: { type: 'string|number', required: false },
  helper: { type: 'string', required: false },
}

export const TEAM_TARGETS_CONTENT_FIELDS = {
  id: { type: 'literal', value: REPORT_TYPES.TEAM_TARGETS, required: true },
  type: { type: 'literal', value: REPORT_TYPES.TEAM_TARGETS, required: true },
  mode: { type: 'literal', value: REPORT_TYPES.TEAM_TARGETS, required: true },

  documentVersion: { type: 'number', required: false },
  generatedAt: { type: 'timestamp|string', required: false },
  teamSnapshot: { type: 'object', required: false },
  draftSnapshot: { type: 'object', required: false },

  meta: { type: 'object', required: false },
  entity: { type: 'object', required: false },
  state: { type: 'object', required: false },
  target: { type: 'object', required: false },
  metrics: { type: 'array', required: false },
  sections: {
    type: 'array',
    required: false,
    item: {
      id: { type: 'string', required: true },
      title: { type: 'string', required: true },
      subtitle: { type: 'string', required: false },
      rows: { type: 'array', required: true, item: MANAGEMENT_ROW_FIELDS },
    },
  },
  versions: { type: 'array', required: false },
}

export const teamTargetsSchema = createPublicReportSchema({
  reportType: REPORT_TYPES.TEAM_TARGETS,
  content: TEAM_TARGETS_CONTENT_FIELDS,
})
