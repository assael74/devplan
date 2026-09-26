const OPERATIONAL_KEYS = new Set([
  'rosterProjectionRevision',
  'movementProjectionRevision',
  'counterpartRosterProjectionRevision',
  'counterpartMovementProjectionRevision',
  'sourceRevision',
  'sourceFingerprints',
  'fingerprint',
  'teamRootFingerprint',
  'teamSeasonFingerprint',
  'identityQueryManifest',
  'identitySourceDocuments',
  'approvedSyncPayload',
])

const stripOperationalMetadata = value => {
  if (Array.isArray(value)) return value.map(stripOperationalMetadata)
  if (!value || typeof value !== 'object') return value

  return Object.entries(value).reduce((result, [key, nested]) => {
    if (OPERATIONAL_KEYS.has(key)) return result
    result[key] = stripOperationalMetadata(nested)
    return result
  }, {})
}

export const buildCleanApprovedRosterState = plan => {
  const cleanPlan = stripOperationalMetadata(plan || {})

  return {
    ...cleanPlan,
    version: 2,
  }
}
