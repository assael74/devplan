// src/features/reports/playerTargets/persistence/playerTargets.schema.js

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

export const PLAYER_TARGETS_CONTENT_FIELDS = {
  documentVersion: { type: 'number', required: false },
  generatedAt: { type: 'date|timestamp|string', required: false },
  playerSnapshot: { type: 'object', required: false },
  teamSnapshot: { type: 'object', required: false },

  // Legacy schema v1 support. New documents do not write these fields.
  hasTargets: { type: 'boolean', required: false },
  reportDate: { type: 'date|timestamp|string', required: false },
  player: { type: 'object', required: false },
  team: { type: 'object', required: false },
  entity: { type: 'object', required: false },
  playerName: { type: 'string', required: false },
  teamName: { type: 'string', required: false },
  teamDisplayName: { type: 'string', required: false },
  clubName: { type: 'string', required: false },
  birthYear: { type: 'string|number', required: false },
  season: { type: 'string', required: false },
  coachName: { type: 'string', required: false },
  primaryPosition: { type: 'string', required: false },
  positionGroupLabel: { type: 'string', required: false },
  squadRoleLabel: { type: 'string', required: false },
  teamProfileLabel: { type: 'string', required: false },
  confidence: { type: 'object', required: false },
  profileSummary: { type: 'object', required: false },
  primarySection: { type: 'object', required: false },
  usageSection: { type: 'object', required: false },
  profile: { type: 'object', required: false },
  targets: { type: 'object', required: false },
  versions: { type: 'array', required: false },
}

export const playerTargetsSchema = createPublicReportSchema({
  reportType: REPORT_TYPES.PLAYER_TARGETS,
  content: PLAYER_TARGETS_CONTENT_FIELDS,
})
