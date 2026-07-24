// src/application/actions/entities/deleteEntityImage.action.js

import { deleteImageByUrl } from '../../../services/firestore/storage/deleteImageByUrl.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'

export async function deleteEntityImage({ imageUrl, metadata: inputMetadata = null } = {}) {
  const metadata = {
    action: 'deleteEntityImage',
    hasImageUrl: Boolean(imageUrl),
    ...(inputMetadata ? { input: inputMetadata } : {}),
  }

  try {
    if (!imageUrl) {
      return actionSuccess({ data: null, metadata })
    }

    const data = await deleteImageByUrl(imageUrl)
    return actionSuccess({ data, metadata })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}
