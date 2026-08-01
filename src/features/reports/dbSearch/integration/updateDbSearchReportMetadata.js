import { publishPublicReportDocument } from '../../service/index.js'

const LIMITS = {
  reportName: 80,
  reportPurpose: 180,
  reportDescription: 1000,
}

function clean(value) {
  return String(value || '').trim()
}

export function normalizeDbSearchMetadataInput(input = {}) {
  return {
    reportName: clean(input.reportName).slice(0, LIMITS.reportName),
    reportPurpose: clean(input.reportPurpose).slice(0, LIMITS.reportPurpose),
    reportDescription: clean(input.reportDescription).slice(
      0,
      LIMITS.reportDescription
    ),
  }
}

export function validateDbSearchMetadataInput(input = {}) {
  const metadata = normalizeDbSearchMetadataInput(input)
  const errors = {}

  if (metadata.reportName.length < 3) {
    errors.reportName = 'יש להזין שם דוח באורך 3 תווים לפחות.'
  }

  if (metadata.reportPurpose.length < 5) {
    errors.reportPurpose = 'יש להזין מטרת דוח באורך 5 תווים לפחות.'
  }

  return {
    metadata,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export async function updateDbSearchReportMetadata({
  report,
  metadata,
  createdBy = '',
} = {}) {
  if (!report || typeof report !== 'object') {
    throw new Error('[updateDbSearchReportMetadata] report is required')
  }

  if (report.reportType !== 'dbSearch') {
    throw new Error('[updateDbSearchReportMetadata] reportType must be dbSearch')
  }

  const validation = validateDbSearchMetadataInput(metadata)

  if (!validation.isValid) {
    const error = new Error('[updateDbSearchReportMetadata] invalid metadata')
    error.validationErrors = validation.errors
    throw error
  }

  const currentContent = report.reportContent || {}
  const currentMeta = currentContent.meta || {}

  return publishPublicReportDocument({
    id: report.reportId || report.id,
    schemaVersion: report.schemaVersion || 1,
    sourceKey: report.sourceKey,
    reportType: report.reportType,
    entityType: report.entityType,
    entityId: report.entityId,
    status: report.status,
    createdBy: createdBy || report.createdBy || '',
    generatedAt: new Date(),
    changeType: 'metadata-update',
    reportContent: {
      ...currentContent,
      meta: {
        ...currentMeta,
        ...validation.metadata,
        updatedAt: new Date().toISOString(),
      },
    },
  })
}
