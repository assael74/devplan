// src/features/hub/sharedProfile/ui/ProfileHeaderImageModal.js

import React from 'react'

import { uploadEntityImageUrl } from '../../application/index.js'
import EntityImageModal from '../../../../ui/domains/entityImage/EntityImageModal.js'

export default function ProfileHeaderImageModal({
  image,
  entityType,
  entityId,
  entityName,
}) {
  return (
    <EntityImageModal
      open={image.open}
      onClose={image.closeModal}
      entityType={entityType}
      id={entityId}
      entityName={entityName}
      currentPhotoUrl={image.photo}
      uploadImageOnly={uploadEntityImageUrl}
      onAfterSave={image.handleSave}
    />
  )
}
