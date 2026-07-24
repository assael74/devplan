// src/application/actions/entities/updateEntity.action.js

import { updateByRouterFields } from '../../../services/firestore/shorts/shortsUpdateByRouter.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'

export async function updateEntity({
  entityType,
  id,
  fieldsPatch,
  createIfMissing = false,
  requireAnyUpdated = true,
  metadata: inputMetadata = null,
} = {}) {
  const metadata = {
    action: 'updateEntity',
    entityType: entityType || null,
    id: id || null,
    ...(inputMetadata ? { input: inputMetadata } : {}),
  }

  try {
    if (!entityType) throw new Error('[updateEntity] entityType is required')
    if (!id) throw new Error('[updateEntity] id is required')
    if (!fieldsPatch || typeof fieldsPatch !== 'object' || Array.isArray(fieldsPatch)) {
      throw new Error('[updateEntity] fieldsPatch must be an object')
    }

    const data = await updateByRouterFields({
      entityType,
      id,
      fieldsPatch,
      createIfMissing,
      requireAnyUpdated,
    })

    return actionSuccess({ data, metadata })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}
