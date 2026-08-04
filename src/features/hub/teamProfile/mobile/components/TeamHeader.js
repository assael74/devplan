// features/hub/teamProfile/mobile/components/TeamHeader.js

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'
import HeaderStripMobile from '../../../../hub/sharedProfile/mobile/HeaderStripMobile'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'

const teamHeaderColors = getEntityColors('teams')

const teamHeaderSx = {
  bgcolor: 'rgba(16, 185, 129, 0.045)',
  border: '1px solid',
  borderColor: 'rgba(16, 185, 129, 0.16)',
  '& .MuiAvatar-root': {
    border: '1px solid',
    borderColor: teamHeaderColors.accent,
    boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.08)',
  },
}

const resolveClubName = ({ entity, context }) => {
  return (
    context?.club?.clubName ||
    context?.club?.name ||
    entity?.club?.clubName ||
    entity?.club?.name ||
    entity?.clubName ||
    ''
  )
}

export default function TeamHeader({ entity, context, onBack }) {
  const navigate = useNavigate()
  const source = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: context?.club || entity?.club,
    subline: resolveClubName({ entity, context }),
  })
  const ifaLink = entity?.ifaLink || null
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source,
  })


  const subtitle = useMemo(() => {
    const clubName = resolveClubName({ entity, context })
    const teamYear = entity?.teamYear || ''

    return [clubName, teamYear].filter(Boolean).join(' · ')
  }, [context?.club, entity])

  const pathItems = useMemo(() => {
    return [
      {
        label: 'מרכז שליטה',
        onClick: () => navigate('/hub'),
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
        title={entity?.teamName || 'קבוצה'}
        subtitle={subtitle}
        avatarSrc={image.photo}
        onAvatarClick={image.openModal}
        onBack={onBack}
        pathItems={pathItems}
        right={<ProfileIfaButton ifaLink={ifaLink} />}
        sx={teamHeaderSx}
      />
      <ProfileHeaderImageModal
        image={image}
        entityType="teams"
        entityId={entity?.id}
        entityName={entity?.teamName}
      />
    </>
  )
}
