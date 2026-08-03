// features/hub/clubProfile/mobile/components/ClubHeader.js

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import HeaderStripMobile from '../../../../hub/sharedProfile/mobile/HeaderStripMobile'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'

export default function ClubHeader({ entity, context, onBack }) {
  const navigate = useNavigate()
  const fallback = buildFallbackAvatar({
    entityType: 'club',
    id: entity?.id,
    name: entity?.clubName,
  })
  const ifaLink = entity?.ifaLink || entity?.clubIfaLink || null
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source: entity?.photo || fallback,
  })


  const clubName = entity?.clubName || ''

  const pathItems = useMemo(() => {
    return [
      {
        label: 'מרכז שליטה',
        onClick: () => navigate('/hub'),
      },
      {
        label: 'שחקנים',
        onClick: () => navigate('/hub?tab=players'),
      },
      {
        label: 'קבוצות',
        onClick: () => navigate('/hub?tab=teams'),
      },
    ]
  }, [navigate])

  return (
    <>
      <HeaderStripMobile
        title={clubName || 'מועדון'}
        subtitle={clubName}
        avatarSrc={image.photo}
        onAvatarClick={image.openModal}
        onBack={onBack}
        pathItems={pathItems}
        right={<ProfileIfaButton ifaLink={ifaLink} />}
      />
      <ProfileHeaderImageModal
        image={image}
        entityType="clubs"
        entityId={entity?.id}
        entityName={clubName}
      />
    </>
  )
}
