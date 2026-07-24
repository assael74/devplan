// src/application/actions/entities/createEntity.action.js

import { createEntityHandlers } from './createEntity.handlers.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'

export async function createEntity({ entityType, draft, context = null } = {}) {
  const metadata = {
    action: 'createEntity',
    entityType: entityType || null,
  }

  try {
    if (!entityType) throw new Error('[createEntity] entityType is required')

    const handler = createEntityHandlers[entityType]
    if (typeof handler !== 'function') {
      const error = new Error(`[createEntity] unsupported entityType: ${entityType}`)
      error.code = 'CREATE_ENTITY_UNSUPPORTED'
      throw error
    }

    const data = await handler({ draft, context })
    return actionSuccess({ data, metadata })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}
