// features/playersDatabase/services/write/teams/teamSeasonMovement.js

import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import {
  COUNTERPART_RECONCILIATION,
} from '../../../domain/movement/index.js'
import { teamSeasonDocRef } from './teamSeasonDoc.js'

const clean = value => String(value === undefined || value === null ? '' : value).trim()

// A roster can be loaded from either side of a transfer.  In that case each
// import creates its own movementId, even though both records describe the
// same player moving between the same two teams in the same season.  Match the
// counterpart semantically before appending, so the later import closes that
// circle instead of creating a second transfer fact.
const findSemanticCounterpartIndex = ({ rows = [], fact = {}, side = '' } = {}) => {
  const playerId = clean(fact.playerId)
  if (!playerId) return -1

  const counterpartTeamId = side === 'transfersIn'
    ? clean(fact.fromBirthTeamDocumentId)
    : clean(fact.toBirthTeamDocumentId)

  if (!counterpartTeamId) return -1

  return (Array.isArray(rows) ? rows : []).findIndex(row => (
    clean(row?.playerId) === playerId &&
    clean(side === 'transfersIn'
      ? row?.fromBirthTeamDocumentId
      : row?.toBirthTeamDocumentId) === counterpartTeamId
  ))
}

const reconcileCounterpartFact = ({ rows = [], fact = {}, side = '' } = {}) => {
  const safeRows = Array.isArray(rows) ? rows : []
  const exactMatchIndex = safeRows.findIndex(row => (
    clean(row?.movementId) === clean(fact?.movementId)
  ))
  const semanticMatchIndex = exactMatchIndex === -1
    ? findSemanticCounterpartIndex({ rows: safeRows, fact, side })
    : -1
  const matchedIndex = exactMatchIndex !== -1 ? exactMatchIndex : semanticMatchIndex

  if (matchedIndex === -1) {
    return {
      rows: [...safeRows, fact],
      closedExistingMovement: false,
    }
  }

  return {
    rows: safeRows.map((row, index) => (
      index === matchedIndex ? { ...row, ...fact } : row
    )),
    closedExistingMovement: semanticMatchIndex !== -1,
  }
}

export async function reconcileTeamSeasonMovementCounterpart({
  request = {},
} = {}) {
  const counterpartBirthTeamDocumentId = clean(
    request.counterpartBirthTeamDocumentId || request.sourceBirthTeamDocumentId
  )
  const seasonKey = clean(request.seasonKey)
  const outgoing = request.outgoing && typeof request.outgoing === 'object'
    ? request.outgoing
    : null
  const incoming = request.incoming && typeof request.incoming === 'object'
    ? request.incoming
    : null
  const side = outgoing ? 'transfersOut' : incoming ? 'transfersIn' : ''
  const fact = outgoing || incoming

  if (!counterpartBirthTeamDocumentId || !seasonKey || !fact || !side) {
    return {
      status: COUNTERPART_RECONCILIATION.NOT_REQUIRED,
    }
  }

  const ref = teamSeasonDocRef({
    birthTeamDocumentId: counterpartBirthTeamDocumentId,
    seasonKey,
  })

  try {
    return await trackedRunTransaction(db, async transaction => {
      const snapshot = await transaction.get(ref)

      if (!snapshot.exists()) {
        return {
          status: COUNTERPART_RECONCILIATION.NOT_FOUND,
          teamSeasonDocumentId: ref.id,
        }
      }

      const current = snapshot.data() || {}
      const counterpartResult = reconcileCounterpartFact({
        rows: current[side],
        fact,
        side,
      })
      const pendingPlayers = (Array.isArray(current.pendingPlayers)
        ? current.pendingPlayers
        : [])
        .filter(row => clean(row.playerId) !== clean(fact.playerId))

      transaction.set(ref, {
        [side]: counterpartResult.rows,
        pendingPlayers,
      }, { merge: true })

      return {
        status: COUNTERPART_RECONCILIATION.COMPLETE,
        teamSeasonDocumentId: ref.id,
        closedExistingMovement: counterpartResult.closedExistingMovement,
      }
    })
  } catch (error) {
    return {
      status: COUNTERPART_RECONCILIATION.FAILED,
      teamSeasonDocumentId: ref.id,
      errorCode: clean(error?.code),
      errorMessage: error instanceof Error ? error.message : 'Counterpart reconciliation failed',
    }
  }
}

export async function reconcileTeamSeasonMovementCounterparts({
  requests = [],
} = {}) {
  const results = []

  for (const request of Array.isArray(requests) ? requests : []) {
    results.push(await reconcileTeamSeasonMovementCounterpart({ request }))
  }

  if (!results.length) {
    return {
      status: COUNTERPART_RECONCILIATION.NOT_REQUIRED,
      results,
    }
  }

  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.FAILED)) {
    return {
      status: COUNTERPART_RECONCILIATION.FAILED,
      results,
    }
  }

  if (results.some(result => result.status === COUNTERPART_RECONCILIATION.NOT_FOUND)) {
    return {
      status: COUNTERPART_RECONCILIATION.NOT_FOUND,
      results,
    }
  }

  return {
    status: COUNTERPART_RECONCILIATION.COMPLETE,
    results,
  }
}
