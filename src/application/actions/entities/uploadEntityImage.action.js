// src/application/actions/entities/uploadEntityImage.action.js

import { uploadImageOnly } from '../../../services/firestore/storage/uploadImageOnly.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'

export async function uploadEntityImage({
  objectType,
  objectId,
  imageFile,
  oldImageUrl = '',
  onProgress,
} = {}) {
  const metadata = {
    action: 'uploadEntityImage',
    entityType: objectType || null,
    id: objectId || null,
  }

  try {
    if (!objectType) throw new Error('[uploadEntityImage] objectType is required')
    if (!objectId) throw new Error('[uploadEntityImage] objectId is required')
    if (!imageFile) throw new Error('[uploadEntityImage] imageFile is required')

    const imageUrl = await uploadImageOnly({
      objectType,
      objectId,
      imageFile,
      oldImageUrl,
      setLoadingImage: value => onProgress?.(value),
    })

    return actionSuccess({
      data: imageUrl,
      metadata,
    })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}

export async function uploadEntityImageUrl(input = {}) {
  const result = await uploadEntityImage(input)

  if (!result.ok) {
    const error = new Error(result.error?.message || 'Entity image upload failed')
    error.code = result.error?.code || 'ENTITY_IMAGE_UPLOAD_FAILED'
    error.cause = result.error?.cause || null
    throw error
  }

  return result.data
}
