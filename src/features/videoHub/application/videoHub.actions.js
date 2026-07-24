// src/features/videoHub/application/videoHub.actions.js

import { deleteEntity } from '../../../application/index.js'
import { unwrapActionResult } from '../../../application/shared/actionResult.js'

export async function deleteVideosBulk({ ids } = {}) {
  return unwrapActionResult(await deleteEntity({
    entityType: 'videosBulk',
    ids: Array.isArray(ids) ? ids : [],
  }))
}
