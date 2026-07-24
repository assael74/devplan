// src/features/hub/playerProfile/mobile/components/PlayerHeader.js

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import HeaderStripMobile from '../../../../hub/sharedProfile/mobile/HeaderStripMobile'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal } from '../../../../hub/sharedProfile/ui/index.js'
import { countHeaderItems } from '../../../../hub/sharedProfile/logic/headerModel.shared.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'

export default function PlayerHeader({ entity, context, onBack }) {
  const navigate = useNavigate()
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source: entity?.photo || playerImage,
  })

  const metaCounts = useMemo(() => {
    const meetingsCount = countHeaderItems(entity?.meetings)
    const gamesCount = countHeaderItems(entity?.playerGames)
    const paymentsCount = countHeaderItems(entity?.payments)

    return {
      payments: paymentsCount,
      games: gamesCount,
      meetings: meetingsCount,
      isDeletable:
        paymentsCount === 0 &&
        meetingsCount === 0 &&
        gamesCount === 0,
    }
  }, [entity?.payments, entity?.meetings, entity?.playerGames])

  const fullName = useMemo(() => {
    return `${entity?.playerFirstName || ''} ${entity?.playerLastName || ''}`.trim()
  }, [entity?.playerFirstName, entity?.playerLastName])

  const subtitle = useMemo(() => {
    const teamName = context?.team?.teamName || ''
    const clubName = context?.club?.clubName || ''

    return [teamName, clubName].filter(Boolean).join(' · ')
  }, [context?.team?.teamName, context?.club?.clubName])

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
    ]
  }, [navigate])

  return (
    <>
      <HeaderStripMobile
        title={fullName || 'שחקן'}
        subtitle={subtitle}
        avatarSrc={image.photo}
        onAvatarClick={image.openModal}
        onBack={onBack}
        pathItems={pathItems}
        right={
          <EntityActionsMenu
            entityType="player"
            entityId={entity?.id}
            entityName={fullName}
            metaCounts={metaCounts}
            isArchived={entity?.active === false}
          />
        }
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
