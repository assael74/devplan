// src/features/hub/clubProfile/desktop/components/ClubHeader.js

import React, { useMemo } from 'react'

import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'

const clubHeaderColors = getEntityColors('clubs')

const clubHeaderSx = {
  bgcolor: 'rgba(217, 119, 6, 0.05)',
  border: '1px solid',
  borderColor: 'rgba(217, 119, 6, 0.16)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
  '& .MuiAvatar-root': {
    border: '1px solid',
    borderColor: clubHeaderColors.accent,
    boxShadow: '0 0 0 4px rgba(217, 119, 6, 0.08)',
  },
}

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
        sx={clubHeaderSx}
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
