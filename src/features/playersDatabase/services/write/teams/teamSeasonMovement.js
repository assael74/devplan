// Counterpart reconciliation never owns the local Movement fact. It only
// applies a proven counterpart to an already existing Team Season.

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { getTeamById } from '../../read/entities/team.js'
import { getTeamSeason } from '../../read/entities/teamSeason.js'
import {
  COUNTERPART_RECONCILIATION,
} from '../../../domain/movement/index.js'
import { teamSeasonDocRef } from './teamSeasonDoc.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const createMovementProjectionRevision = () => (
  `${Date.now()}-${Math.random().toString(36).slice(2)}`
)

const movementCounterpartTeamId = ({ fact = {}, side = '' } = {}) => (
  side === 'transfersIn'
    ? clean(fact.fromBirthTeamDocumentId)
    : clean(fact.toBirthTeamDocumentId)
)

const isSameEpisode = ({ row = {}, fact = {}, side = '' } = {}) => {
  const sameSnapshot = clean(row.targetSnapshotKey) &&
    clean(row.targetSnapshotKey) === clean(fact.targetSnapshotKey)
  const sameEffectiveAt = clean(row.effectiveAt) &&
    clean(row.effectiveAt) === clean(fact.effectiveAt)

  return clean(row.playerId) === clean(fact.playerId) &&
    movementCounterpartTeamId({ fact: row, side }) === movementCounterpartTeamId({ fact, side }) &&
    clean(row.timing) === clean(fact.timing) &&
    Boolean(sameSnapshot || sameEffectiveAt)
}

const findFactState = ({ rows = [], fact = {}, side = '' } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const exactIndex = safeRows.findIndex(row => clean(row.movementId) === clean(fact.movementId))
  if (exactIndex >= 0) return { kind: 'exact', index: exactIndex }

  const equivalentIndex = safeRows.findIndex(row => isSameEpisode({ row, fact, side }))
  if (equivalentIndex >= 0) return { kind: 'equivalent', index: equivalentIndex }

  const conflicting = safeRows.some(row => (
    clean(row.playerId) === clean(fact.playerId) &&
    movementCounterpartTeamId({ fact: row, side }) !== movementCounterpartTeamId({ fact, side })
  ))
  return conflicting ? { kind: 'conflict', index: -1 } : { kind: 'append', index: -1 }
}

const isPendingForFact = ({ pending = {}, fact = {}, counterpartTeamSeason = {} } = {}) => {
  if (clean(pending.playerId) !== clean(fact.playerId)) return false
  const pendingTeamId = clean(pending.previousBirthTeamDocumentId)
  const counterpartTeamId = clean(
    counterpartTeamSeason.birthTeamDocumentId || counterpartTeamSeason.teamDocumentId
  )
  // Older Pending rows did not persist their Team relation. They remain safe
  // to close only after this exact counterpart candidate was selected.
  return !pendingTeamId || pendingTeamId === counterpartTeamId
}

const resolveCandidateSeasonKeys = async ({ counterpartBirthTeamDocumentId = '', request = {} } = {}) => {
  const explicitSeasonKey = clean(request.counterpartSeasonKey)
  if (explicitSeasonKey) return [explicitSeasonKey]

  // The counterpart season is not known. Use the Team Root navigation index,
  // never a collection scan, and prefer the local season when it exists.
  const root = await getTeamById(counterpartBirthTeamDocumentId)
  const rootSeasonKeys = (Array.isArray(root?.seasons) ? root.seasons : [])
    .map(row => clean(row?.seasonKey || row?.seasonId))
    .filter(Boolean)
  return [...new Set([clean(request.seasonKey), ...rootSeasonKeys].filter(Boolean))]
}

export const buildReconciledCounterpartTeamSeason = ({ current = {}, fact = {}, side = '' } = {}) => {
  if (!fact || !side) return { changed: false, teamSeason: current }
  const factState = findFactState({ rows: current[side], fact, side })
  if (factState.kind === 'conflict') return { changed: false, conflict: true, teamSeason: current }

  const pendingPlayers = Array.isArray(current.pendingPlayers) ? current.pendingPlayers : []
  const pendingIndex = pendingPlayers.findIndex(pending => isPendingForFact({
    pending, fact, counterpartTeamSeason: current,
  }))
  const nextPendingPlayers = pendingIndex < 0
    ? pendingPlayers
    : pendingPlayers.filter((_pending, index) => index !== pendingIndex)
  const rows = Array.isArray(current[side]) ? current[side] : []
  const nextRows = factState.kind === 'append' ? [...rows, fact] : rows
  const changed = pendingIndex >= 0 || factState.kind === 'append'

  return {
    changed,
    conflict: false,
    teamSeason: changed ? { ...current, [side]: nextRows, pendingPlayers: nextPendingPlayers } : current,
  }
}

async function reconcileCandidate({ counterpartBirthTeamDocumentId, seasonKey, fact, side }) {
  const ref = teamSeasonDocRef({ birthTeamDocumentId: counterpartBirthTeamDocumentId, seasonKey })
  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) return { status: COUNTERPART_RECONCILIATION.NOT_FOUND, teamSeasonDocumentId: ref.id }

    const current = snapshot.data() || {}
    const factState = findFactState({ rows: current[side], fact, side })
    if (factState.kind === 'conflict') {
      return { status: COUNTERPART_RECONCILIATION.CONFLICT, teamSeasonDocumentId: ref.id, changed: false }
    }

    const pendingPlayers = Array.isArray(current.pendingPlayers) ? current.pendingPlayers : []
    // A legacy document can contain more than one Pending row for one player.
    // Reconciliation is entitled to close only the one episode it proved.
    const pendingIndex = pendingPlayers.findIndex(pending => isPendingForFact({
      pending,
      fact,
      counterpartTeamSeason: current,
    }))
    const nextPendingPlayers = pendingIndex < 0
      ? pendingPlayers
      : pendingPlayers.filter((_pending, index) => index !== pendingIndex)
    const pendingChanged = pendingIndex >= 0
    const rows = Array.isArray(current[side]) ? current[side] : []
    const nextRows = factState.kind === 'append' ? [...rows, fact] : rows
    const changed = pendingChanged || factState.kind === 'append'

    if (changed) {
      transaction.set(ref, {
        [side]: nextRows,
        pendingPlayers: nextPendingPlayers,
        movementProjectionRevision: createMovementProjectionRevision(),
      }, { merge: true })
    }

    return {
      status: factState.kind === 'append' ? COUNTERPART_RECONCILIATION.COMPLETE : COUNTERPART_RECONCILIATION.NO_OP,
      teamSeasonDocumentId: ref.id,
      changed,
      teamSeason: changed ? { ...current, [side]: nextRows, pendingPlayers: nextPendingPlayers } : current,
    }
  })
}


export async function resolveTeamSeasonMovementCounterpartCandidate({ request = {} } = {}) {
  const counterpartBirthTeamDocumentId = clean(
    request.counterpartBirthTeamDocumentId || request.sourceBirthTeamDocumentId
  )
  if (!counterpartBirthTeamDocumentId) return null

  const teamRoot = await getTeamById(counterpartBirthTeamDocumentId, { bypassCache: true })
  const explicitSeasonKey = clean(request.counterpartSeasonKey)
  const sameSeasonKey = clean(request.seasonKey)
  const rootSeasonKeys = (Array.isArray(teamRoot?.seasons) ? teamRoot.seasons : [])
    .map(row => clean(row?.seasonKey || row?.seasonId))
    .filter(Boolean)
  const seasonKeys = explicitSeasonKey
    ? [explicitSeasonKey]
    : request.counterpartSeasonUnknown === true
      ? [...new Set([sameSeasonKey, ...rootSeasonKeys].filter(Boolean))]
      : [sameSeasonKey].filter(Boolean)

  const checkedSeasons = []
  for (const seasonKey of seasonKeys) {
    const teamSeason = await getTeamSeason({
      birthTeamDocumentId: counterpartBirthTeamDocumentId,
      seasonKey,
      bypassCache: true,
    })
    checkedSeasons.push({ seasonKey, teamSeason: teamSeason || null })
    if (teamSeason) {
      return {
        birthTeamDocumentId: counterpartBirthTeamDocumentId,
        seasonKey,
        teamRoot: teamRoot || null,
        teamSeason,
        checkedSeasons,
      }
    }
  }

  return {
    birthTeamDocumentId: counterpartBirthTeamDocumentId,
    seasonKey: clean(seasonKeys[0]),
    teamRoot: teamRoot || null,
    teamSeason: null,
    checkedSeasons,
  }
}

export async function reconcileTeamSeasonMovementCounterpart({ request = {} } = {}) {
  const counterpartBirthTeamDocumentId = clean(request.counterpartBirthTeamDocumentId || request.sourceBirthTeamDocumentId)
  const outgoing = request.outgoing && typeof request.outgoing === 'object' ? request.outgoing : null
  const incoming = request.incoming && typeof request.incoming === 'object' ? request.incoming : null
  const side = outgoing ? 'transfersOut' : incoming ? 'transfersIn' : ''
  const fact = outgoing || incoming

  if (!counterpartBirthTeamDocumentId || !fact || !side) {
    return { status: COUNTERPART_RECONCILIATION.NOT_REQUIRED, changed: false }
  }

  try {
    const explicitSeasonKey = clean(request.counterpartSeasonKey)
    if (explicitSeasonKey) {
      return reconcileCandidate({ counterpartBirthTeamDocumentId, seasonKey: explicitSeasonKey, fact, side })
    }

    const sameSeasonKey = clean(request.seasonKey)
    let sameSeasonResult = { status: COUNTERPART_RECONCILIATION.NOT_FOUND, changed: false }
    if (sameSeasonKey) {
      sameSeasonResult = await reconcileCandidate({
        counterpartBirthTeamDocumentId, seasonKey: sameSeasonKey, fact, side,
      })
      if (sameSeasonResult.status !== COUNTERPART_RECONCILIATION.NOT_FOUND) return sameSeasonResult
    }

    if (request.counterpartSeasonUnknown !== true) return sameSeasonResult

    const seasonKeys = await resolveCandidateSeasonKeys({ counterpartBirthTeamDocumentId, request })
    for (const seasonKey of seasonKeys.filter(key => key !== sameSeasonKey)) {
      const result = await reconcileCandidate({ counterpartBirthTeamDocumentId, seasonKey, fact, side })
      if (result.status !== COUNTERPART_RECONCILIATION.NOT_FOUND) return result
    }
    return { status: COUNTERPART_RECONCILIATION.NOT_FOUND, changed: false }
  } catch (error) {
    const failedSeasonKey = clean(request.counterpartSeasonKey || request.seasonKey)
    const failedRef = failedSeasonKey
      ? teamSeasonDocRef({ birthTeamDocumentId: counterpartBirthTeamDocumentId, seasonKey: failedSeasonKey })
      : null
    return {
      status: COUNTERPART_RECONCILIATION.FAILED,
      changed: false,
      ...(failedRef ? { teamSeasonDocumentId: failedRef.id } : {}),
      errorCode: clean(error?.code),
      errorMessage: error instanceof Error ? error.message : 'Counterpart reconciliation failed',
    }
  }
}

export async function reconcileTeamSeasonMovementCounterparts({ requests = [] } = {}) {
  const results = []
  for (const request of Array.isArray(requests) ? requests : []) {
    results.push(await reconcileTeamSeasonMovementCounterpart({ request }))
  }

  if (!results.length) return { status: COUNTERPART_RECONCILIATION.NOT_REQUIRED, results }
  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.FAILED)) return { status: COUNTERPART_RECONCILIATION.FAILED, results }
  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.CONFLICT)) return { status: COUNTERPART_RECONCILIATION.CONFLICT, results }
  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.COMPLETE)) return { status: COUNTERPART_RECONCILIATION.COMPLETE, results }
  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.NOT_FOUND)) return { status: COUNTERPART_RECONCILIATION.NOT_FOUND, results }
  return { status: COUNTERPART_RECONCILIATION.NO_OP, results }
}

export async function prepareTeamSeasonMovementCounterpartPlans({
  requests = [],
  movementProjectionRevision = '',
} = {}) {
  const grouped = new Map()
  const results = []

  for (const request of Array.isArray(requests) ? requests : []) {
    const counterpartBirthTeamDocumentId = clean(
      request.counterpartBirthTeamDocumentId || request.sourceBirthTeamDocumentId
    )
    const outgoing = request.outgoing && typeof request.outgoing === 'object' ? request.outgoing : null
    const incoming = request.incoming && typeof request.incoming === 'object' ? request.incoming : null
    const side = outgoing ? 'transfersOut' : incoming ? 'transfersIn' : ''
    const fact = outgoing || incoming

    if (!counterpartBirthTeamDocumentId || !fact || !side) {
      results.push({ status: COUNTERPART_RECONCILIATION.NOT_REQUIRED, changed: false })
      continue
    }

    const candidate = await resolveTeamSeasonMovementCounterpartCandidate({ request })
    if (!candidate?.teamSeason || !candidate?.seasonKey) {
      results.push({
        status: COUNTERPART_RECONCILIATION.NOT_FOUND,
        changed: false,
        movementId: clean(request.movementId),
        counterpartBirthTeamDocumentId,
        counterpartSeasonKey: clean(candidate?.seasonKey || request.counterpartSeasonKey || request.seasonKey),
      })
      continue
    }

    const key = `${clean(candidate.birthTeamDocumentId)}::${clean(candidate.seasonKey)}`
    if (!grouped.has(key)) {
      grouped.set(key, {
        birthTeamDocumentId: clean(candidate.birthTeamDocumentId),
        seasonKey: clean(candidate.seasonKey),
        current: candidate.teamSeason,
        next: candidate.teamSeason,
        requests: [],
        conflict: false,
        counterpartRosterProjectionRevision: clean(candidate.teamSeason?.rosterProjectionRevision),
        counterpartMovementProjectionRevision: clean(candidate.teamSeason?.movementProjectionRevision),
      })
    }

    const group = grouped.get(key)
    const reconciled = buildReconciledCounterpartTeamSeason({
      current: group.next,
      fact,
      side,
    })
    group.requests.push({
      ...request,
      counterpartSeasonKey: clean(candidate.seasonKey),
    })
    if (reconciled.conflict) {
      group.conflict = true
      results.push({
        status: COUNTERPART_RECONCILIATION.CONFLICT,
        changed: false,
        movementId: clean(request.movementId),
        counterpartBirthTeamDocumentId: group.birthTeamDocumentId,
        counterpartSeasonKey: group.seasonKey,
      })
      continue
    }
    group.next = reconciled.teamSeason
    results.push({
      status: reconciled.changed
        ? COUNTERPART_RECONCILIATION.COMPLETE
        : COUNTERPART_RECONCILIATION.NO_OP,
      changed: reconciled.changed,
      movementId: clean(request.movementId),
      counterpartBirthTeamDocumentId: group.birthTeamDocumentId,
      counterpartSeasonKey: group.seasonKey,
    })
  }

  const operations = [...grouped.values()]
    .filter(group => !group.conflict)
    .map(group => {
      const currentTransfersIn = Array.isArray(group.current.transfersIn) ? group.current.transfersIn : []
      const currentTransfersOut = Array.isArray(group.current.transfersOut) ? group.current.transfersOut : []
      const currentPendingPlayers = Array.isArray(group.current.pendingPlayers) ? group.current.pendingPlayers : []
      const nextTransfersIn = Array.isArray(group.next.transfersIn) ? group.next.transfersIn : []
      const nextTransfersOut = Array.isArray(group.next.transfersOut) ? group.next.transfersOut : []
      const nextPendingPlayers = Array.isArray(group.next.pendingPlayers) ? group.next.pendingPlayers : []
      const changed = currentTransfersIn !== nextTransfersIn ||
        currentTransfersOut !== nextTransfersOut ||
        currentPendingPlayers !== nextPendingPlayers

      return {
        birthTeamDocumentId: group.birthTeamDocumentId,
        seasonKey: group.seasonKey,
        changed,
        requests: group.requests,
        counterpartRosterProjectionRevision: group.counterpartRosterProjectionRevision,
        counterpartMovementProjectionRevision: group.counterpartMovementProjectionRevision,
        patch: {
          transfersIn: nextTransfersIn,
          transfersOut: nextTransfersOut,
          pendingPlayers: nextPendingPlayers,
          movementProjectionRevision: clean(movementProjectionRevision),
        },
        projectedTeamSeason: group.next,
      }
    })

  return { operations, results }
}

export async function applyApprovedTeamSeasonMovementCounterpartPlans({ approvedPlan = null } = {}) {
  const operations = Array.isArray(approvedPlan?.operations) ? approvedPlan.operations : []
  const results = []

  for (const operation of operations) {
    if (!operation?.changed) {
      results.push({
        status: COUNTERPART_RECONCILIATION.NO_OP,
        changed: false,
        teamSeason: operation?.projectedTeamSeason || null,
      })
      continue
    }

    const ref = teamSeasonDocRef({
      birthTeamDocumentId: operation.birthTeamDocumentId,
      seasonKey: operation.seasonKey,
    })
    const applyResult = await trackedRunTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref)
      if (!snapshot.exists()) throw new Error('Approved counterpart Team Season is missing')

      const current = snapshot.data() || {}
      const expectedMovementRevision = clean(operation.counterpartMovementProjectionRevision)
      const currentMovementRevision = clean(current.movementProjectionRevision)
      if (expectedMovementRevision !== currentMovementRevision) {
        return { superseded: true }
      }

      transaction.set(ref, operation.patch || {}, { merge: true })
      return { superseded: false }
    })

    if (applyResult?.superseded) {
      results.push({
        status: COUNTERPART_RECONCILIATION.NO_OP,
        changed: false,
        superseded: true,
        birthTeamDocumentId: operation.birthTeamDocumentId,
        seasonKey: operation.seasonKey,
        teamSeasonDocumentId: ref.id,
      })
      continue
    }

    results.push({
      status: COUNTERPART_RECONCILIATION.COMPLETE,
      changed: true,
      birthTeamDocumentId: operation.birthTeamDocumentId,
      seasonKey: operation.seasonKey,
      teamSeasonDocumentId: ref.id,
      teamSeason: operation.projectedTeamSeason || null,
    })
  }

  for (const result of Array.isArray(approvedPlan?.results) ? approvedPlan.results : []) {
    if (result.status === COUNTERPART_RECONCILIATION.NOT_FOUND ||
        result.status === COUNTERPART_RECONCILIATION.CONFLICT ||
        result.status === COUNTERPART_RECONCILIATION.NOT_REQUIRED) {
      results.push(result)
    }
  }

  if (!results.length) return { status: COUNTERPART_RECONCILIATION.NOT_REQUIRED, results }
  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.CONFLICT)) {
    return { status: COUNTERPART_RECONCILIATION.CONFLICT, results }
  }
  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.COMPLETE)) {
    return { status: COUNTERPART_RECONCILIATION.COMPLETE, results }
  }
  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.NOT_FOUND)) {
    return { status: COUNTERPART_RECONCILIATION.NOT_FOUND, results }
  }
  return { status: COUNTERPART_RECONCILIATION.NO_OP, results }
}
