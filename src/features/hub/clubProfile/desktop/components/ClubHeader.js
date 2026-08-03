// src/features/hub/clubProfile/desktop/components/ClubHeader.js

import React, { useMemo } from 'react'

import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'

export default function ClubHeader({ entity, context, backAction }) {
  const ifaLink = entity?.ifaLink || entity?.clubIfaLink || null
  const fallbackAvatar = buildFallbackAvatar({
    entityType: 'club',
    id: entity?.id,
    name: entity?.clubName,
  })
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source: entity?.photo || fallbackAvatar,
  })


  return (
    <>
      <HeaderStrip
        title={entity?.clubName || ''}
        subtitle={context?.project?.label || ''}
        avatarSrc={image.photo}
        backAction={backAction}
        onAvatarClick={image.openModal}
        right={<ProfileIfaButton ifaLink={ifaLink} />}
      />
      <ProfileHeaderImageModal
        image={image}
        entityType="clubs"
        entityId={entity?.id}
        entityName={entity?.clubName}
      />
    </>
  )
}
