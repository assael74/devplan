// src/application/actions/entities/updateEntityImage.action.js

import { uploadImageOnly } from '../../../services/firestore/storage/uploadImageOnly.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'
import { updateEntity } from './updateEntity.action.js'

export async function updateEntityImage({
  entityType,
  objectType,
  id,
  imageFile,
  imageField = 'image',
  oldImageUrl = '',
  createIfMissing = false,
  requireAnyUpdated = true,
  onProgress,
} = {}) {
  const metadata = {
    action: 'updateEntityImage',
    entityType: entityType || null,
    id: id || null,
    imageField,
  }

  try {
    if (!entityType) throw new Error('[updateEntityImage] entityType is required')
    if (!id) throw new Error('[updateEntityImage] id is required')
    if (!imageFile) throw new Error('[updateEntityImage] imageFile is required')
    if (!imageField) throw new Error('[updateEntityImage] imageField is required')

    const imageUrl = await uploadImageOnly({
      objectType: objectType || entityType,
      objectId: id,
      imageFile,
      oldImageUrl,
      setLoadingImage: value => onProgress?.(value),
    })

    const updateResult = await updateEntity({
      entityType,
      id,
      fieldsPatch: {
        [imageField]: imageUrl,
      },
      createIfMissing,
      requireAnyUpdated,
      metadata: {
        source: 'updateEntityImage',
      },
    })

    if (!updateResult.ok) return updateResult

    return actionSuccess({
      data: {
        imageUrl,
        update: updateResult.data,
      },
      metadata,
    })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}
