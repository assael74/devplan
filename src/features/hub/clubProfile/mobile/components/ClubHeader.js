// src/features/hub/clubProfile/mobile/components/ClubHeader.js

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import HeaderStripMobile from '../../../../hub/sharedProfile/mobile/HeaderStripMobile'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal } from '../../../../hub/sharedProfile/ui/index.js'
import { countHeaderItems } from '../../../../hub/sharedProfile/logic/headerModel.shared.js'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'

export default function ClubHeader({ entity, context, onBack }) {
  const navigate = useNavigate()
  const fallback = buildFallbackAvatar({
    entityType: 'club',
    id: entity?.id,
    name: entity?.clubName,
  })
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source: entity?.photo || fallback,
  })

  const metaCounts = useMemo(() => {
    const teamsCount = countHeaderItems(entity?.teams)

    return {
      teams: teamsCount,
      isDeletable: teamsCount === 0,
    }
  }, [entity?.teams])

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
        right={
          <EntityActionsMenu
            entityType="club"
            entityId={entity?.id}
            entityName={clubName}
            metaCounts={metaCounts}
            isArchived={entity?.active === false}
          />
        }
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
