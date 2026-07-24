// src/application/actions/entities/deleteEntity.action.js

import { deleteEntityHandlers } from './deleteEntity.handlers.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'

export async function deleteEntity({ entityType, id, ids } = {}) {
  const metadata = {
    action: 'deleteEntity',
    entityType: entityType || null,
    id: id || null,
    count: Array.isArray(ids) ? ids.length : null,
  }

  try {
    if (!entityType) throw new Error('[deleteEntity] entityType is required')

    const handler = deleteEntityHandlers[entityType]
    if (typeof handler !== 'function') {
      const error = new Error(`[deleteEntity] unsupported entityType: ${entityType}`)
      error.code = 'DELETE_ENTITY_UNSUPPORTED'
      throw error
    }

    const input = Array.isArray(ids) ? { ids } : { id }
    const data = await handler(input)

    return actionSuccess({ data, metadata })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}
