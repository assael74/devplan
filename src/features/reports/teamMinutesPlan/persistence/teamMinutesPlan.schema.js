// src/features/reports/teamMinutesPlan/persistence/teamMinutesPlan.schema.js

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

const SUMMARY_ITEM_FIELDS = {
  id: { type: 'string', required: true },
  value: { type: 'string', required: true },
  label: { type: 'string', required: true },
  shortLabel: { type: 'string', required: false },
  iconId: { type: 'string', required: false },
  iconColor: { type: 'string', required: false },
  count: { type: 'number', required: true },
}

const PLAYER_ROW_FIELDS = {
  id: { type: 'string', required: true },
  index: { type: 'number', required: false },
  photo: { type: 'string', required: false },
  playerFullName: { type: 'string', required: true },
  subline: { type: 'string', required: false },
  positions: { type: 'array', required: true },
  mainPosition: { type: 'object|string', required: false },
  squadRole: { type: 'object|string', required: false },
  minutesTarget: { type: 'number|string', required: false },
  minutesTargetLabel: { type: 'string', required: false },
}

export const TEAM_MINUTES_PLAN_CONTENT_FIELDS = {
  id: { type: 'literal', value: REPORT_TYPES.MINUTES_PLAN, required: true },
  type: { type: 'literal', value: REPORT_TYPES.MINUTES_PLAN, required: true },
  mode: { type: 'literal', value: REPORT_TYPES.MINUTES_PLAN, required: true },
  meta: { type: 'object', required: true },
  entity: { type: 'object', required: true },
  summary: {
    type: 'object',
    required: true,
    fields: {
      squadRoles: { type: 'array', required: true, item: SUMMARY_ITEM_FIELDS },
      layers: { type: 'array', required: true, item: SUMMARY_ITEM_FIELDS },
      positions: { type: 'array', required: true, item: SUMMARY_ITEM_FIELDS },
    },
  },
  sections: {
    type: 'array',
    required: true,
    item: {
      id: { type: 'string', required: true },
      value: { type: 'string', required: false },
      title: { type: 'string', required: true },
      shortLabel: { type: 'string', required: false },
      minutesTarget: { type: 'number|string', required: false },
      minutesLabel: { type: 'string', required: false },
      totalMinutes: { type: 'number', required: false },
      iconId: { type: 'string', required: false },
      iconColor: { type: 'string', required: false },
      defined: { type: 'boolean', required: false },
      count: { type: 'number', required: true },
      rows: { type: 'array', required: true, item: PLAYER_ROW_FIELDS },
    },
  },
  versions: { type: 'array', required: false },
}

export const teamMinutesPlanSchema = createPublicReportSchema({
  reportType: REPORT_TYPES.MINUTES_PLAN,
  content: TEAM_MINUTES_PLAN_CONTENT_FIELDS,
})
