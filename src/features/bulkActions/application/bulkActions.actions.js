// src/features/bulkActions/application/bulkActions.actions.js

import {
  createEntity,
  deleteEntity,
  unwrapActionResult,
} from '../../../application/index.js'

export async function importPlayersBulk({ payload } = {}) {
  return unwrapActionResult(await createEntity({
    entityType: 'players',
    draft: payload,
  }))
}

export async function deletePlayersBulk({ ids } = {}) {
  return unwrapActionResult(await deleteEntity({
    entityType: 'playersBulk',
    ids,
  }))
}

export async function importVideosBulk({ draft } = {}) {
  return unwrapActionResult(await createEntity({
    entityType: 'videosBulk',
    draft,
  }))
}
