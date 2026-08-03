// features/hub/playerProfile/mobile/components/PlayerHeader.js

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import HeaderStripMobile from '../../../../hub/sharedProfile/mobile/HeaderStripMobile'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'

export default function PlayerHeader({ entity, context, onBack, isPrivatePlayer = false }) {
  const navigate = useNavigate()
  const ifaLink = entity?.ifaLink || entity?.playerIfaLink || null
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source: entity?.photo || playerImage,
  })


  const fullName = useMemo(() => {
    return `${entity?.playerFirstName || ''} ${entity?.playerLastName || ''}`.trim()
  }, [entity?.playerFirstName, entity?.playerLastName])

  const subtitle = useMemo(() => {
    const teamName = context?.team?.teamName || ''
    const clubName = context?.club?.clubName || ''

    return [teamName, clubName].filter(Boolean).join(' · ')
  }, [context?.team?.teamName, context?.club?.clubName])

  const pathItems = useMemo(() => {
    const rootPath = isPrivatePlayer ? '/private-players' : '/hub'
    const rootLabel = isPrivatePlayer ? 'שחקנים פרטיים' : 'מרכז שליטה'

    return [
      {
        label: rootLabel,
        onClick: () => navigate(rootPath),
      },
    ]
  }, [isPrivatePlayer, navigate])

  return (
    <>
      <HeaderStripMobile
        title={fullName || 'שחקן'}
        subtitle={subtitle}
        avatarSrc={image.photo}
        onAvatarClick={image.openModal}
        onBack={onBack}
        pathItems={pathItems}
        right={<ProfileIfaButton ifaLink={ifaLink} />}
      />
      <ProfileHeaderImageModal
        image={image}
        entityType="players"
        entityId={entity?.id}
        entityName={fullName}
      />
    </>
  )
}
