import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { AUDIT_DOMAIN, getAuditScopeKeys } from './audit.scope.js'
import { normalizeLegacyAuditRepairType } from './audit.contract.js'

const ACTIVE_FINDING_SCHEMA_VERSION = 2
const FULL_SYSTEM_SCOPE_KEY = 'fullSystem'
const MAX_BATCH_OPERATIONS = 450
const clean = value => String(value === undefined || value === null ? '' : value).trim()
const chunk = (items, size = MAX_BATCH_OPERATIONS) => (
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => (
    items.slice(index * size, (index + 1) * size)
  ))
)

const encode = value => encodeURIComponent(clean(value)).replace(/%/g, '_')

export const buildAuditFindingId = (finding = {}) => [
  'active',
  finding?.type,
  finding?.entityType,
  finding?.documentId,
  finding?.relatedDocumentId,
  finding?.teamDocumentId,
  finding?.playerDocumentId,
  finding?.seasonKey,
  finding?.relationKey,
  finding?.auditDomain,
].map(encode).join('__')

export const buildAuditFindingScopeKey = (finding = {}) => {
  const teamDocumentId = clean(finding?.teamDocumentId)
  const seasonKey = clean(finding?.seasonKey)
  const auditDomain = clean(finding?.auditDomain)
  return teamDocumentId && seasonKey
    ? `teamSeason__${auditDomain}__${teamDocumentId}__${seasonKey}`
    : `${FULL_SYSTEM_SCOPE_KEY}__${auditDomain}`
}

const buildActiveFindingDocument = finding => ({
  schemaVersion: ACTIVE_FINDING_SCHEMA_VERSION,
  type: clean(finding?.type),
  entityType: clean(finding?.entityType),
  documentId: clean(finding?.documentId),
  relatedDocumentId: clean(finding?.relatedDocumentId),
  teamDocumentId: clean(finding?.teamDocumentId),
  teamDisplayName: clean(finding?.teamDisplayName),
  leagueId: clean(finding?.leagueId),
  playerDocumentId: clean(finding?.playerDocumentId),
  playerId: clean(finding?.playerId),
  externalPlayerId: clean(finding?.externalPlayerId),
  playerDisplayName: clean(finding?.playerDisplayName),
  seasonKey: clean(finding?.seasonKey),
  relationKey: clean(finding?.relationKey),
  auditDomain: clean(finding?.auditDomain),
  title: clean(finding?.title),
  explanation: clean(finding?.explanation),
  source: clean(finding?.source),
  repairType: normalizeLegacyAuditRepairType(finding),
  scopeKey: buildAuditFindingScopeKey(finding),
  detectedAt: serverTimestamp(),
})

// Entity repair screens receive only this deterministic id. They can then
// load the exact active finding instead of re-scanning a whole relation set.
export async function readActiveAuditFindingById({ findingId = '' } = {}) {
  const safeFindingId = clean(findingId)
  if (!safeFindingId) return null

  const snapshot = await getDoc(doc(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.auditFindings),
    safeFindingId
  ))

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data(), repairType: normalizeLegacyAuditRepairType(snapshot.data()) }
    : null
}

const readActiveFindingsForScope = async ({ scope, auditDomains }) => {
  const scopeKeys = getAuditScopeKeys(scope, auditDomains)
  const source = collection(db, PLAYERS_DATABASE_COLLECTIONS.auditFindings)
  const snapshots = !scopeKeys.length
    ? [await getDocs(query(source, where('schemaVersion', '==', ACTIVE_FINDING_SCHEMA_VERSION)))]
    : await Promise.all(scopeKeys.map(scopeKey => getDocs(query(
      source,
      where('schemaVersion', '==', ACTIVE_FINDING_SCHEMA_VERSION),
      where('scopeKey', '==', scopeKey)
    ))))

  return snapshots.flatMap(snapshot => snapshot.docs.map(item => ({
    id: item.id,
    data: item.data() || {},
  })))
}

const isFindingAuditedInScope = ({ finding, scope, auditDomains }) => {
  const safeDomains = Array.isArray(auditDomains) ? auditDomains : []
  if (!safeDomains.includes(clean(finding?.auditDomain))) return false
  const scopeKeys = getAuditScopeKeys(scope, safeDomains)
  return !scopeKeys.length || scopeKeys.includes(buildAuditFindingScopeKey(finding))
}

export const buildActiveAuditFindingReconciliationPlan = ({
  findings = [],
  existingRows = [],
  scope,
  auditDomains = [],
} = {}) => {
  const safeFindings = (Array.isArray(findings) ? findings : [])
    .filter(finding => isFindingAuditedInScope({ finding, scope, auditDomains }))
  const scopedExistingRows = (Array.isArray(existingRows) ? existingRows : [])
    .filter(row => isFindingAuditedInScope({ finding: row?.data || {}, scope, auditDomains }))
  const existingById = new Map(
    scopedExistingRows.map(row => [row.id, row.data || {}])
  )
  const currentById = new Map(safeFindings.map(finding => [
    buildAuditFindingId(finding),
    finding,
  ]))

  return {
    safeFindings,
    existingById,
    currentById,
    creates: [...currentById.entries()].filter(([id]) => !existingById.has(id)),
    deletes: scopedExistingRows.filter(row => !currentById.has(row.id)),
  }
}

// The collection is a current-state projection: persistent findings are never
// rewritten, and only findings fully audited in this run may be removed.
export async function reconcileActiveAuditFindings({
  findings = [],
  scope,
  auditDomains = [AUDIT_DOMAIN.TEAM_RELATIONS, AUDIT_DOMAIN.PLAYER_RELATIONS],
  detectedAt = new Date().toISOString(),
} = {}) {
  const existingRows = await readActiveFindingsForScope({ scope, auditDomains })
  const {
    safeFindings,
    existingById,
    currentById,
    creates,
    deletes,
  } = buildActiveAuditFindingReconciliationPlan({
    findings,
    existingRows,
    scope,
    auditDomains,
  })

  if (creates.length || deletes.length) {
    const operations = [
      ...creates.map(([id, finding]) => ({ type: 'set', id, finding })),
      ...deletes.map(row => ({ type: 'delete', id: row.id })),
    ]
    for (const operationsChunk of chunk(operations)) {
      const batch = writeBatch(db)
      operationsChunk.forEach(operation => {
        if (operation.type === 'delete') {
          batch.delete(doc(collection(db, PLAYERS_DATABASE_COLLECTIONS.auditFindings), operation.id))
          return
        }
        batch.set(doc(collection(db, PLAYERS_DATABASE_COLLECTIONS.auditFindings), operation.id), {
          ...buildActiveFindingDocument(operation.finding),
          id: operation.id,
        })
      })
      await batch.commit()
    }
  }

  return {
    createdCount: creates.length,
    deletedCount: deletes.length,
    unchangedCount: safeFindings.length - creates.length,
    findings: safeFindings.map(finding => {
      const id = buildAuditFindingId(finding)
      return {
        ...finding,
        auditFindingId: id,
        detectedAt: existingById.get(id)?.detectedAt || detectedAt,
      }
    }),
  }
}

export const AUDIT_ACTIVE_FINDING_SCHEMA_VERSION = ACTIVE_FINDING_SCHEMA_VERSION
