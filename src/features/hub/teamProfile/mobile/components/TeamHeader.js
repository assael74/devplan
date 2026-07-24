// src/features/hub/teamProfile/mobile/components/TeamHeader.js

import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStripMobile from '../../../../hub/sharedProfile/mobile/HeaderStripMobile'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal } from '../../../../hub/sharedProfile/ui/index.js'
import { countHeaderItems } from '../../../../hub/sharedProfile/logic/headerModel.shared.js'

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
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source,
  })

  const metaCounts = useMemo(() => {
    const playersCount = countHeaderItems(entity?.players)
    const meetingsCount = countHeaderItems(entity?.meetings)
    const gamesCount = countHeaderItems(entity?.teamGames)

    return {
      players: playersCount,
      games: gamesCount,
      meetings: meetingsCount,
      isDeletable:
        playersCount === 0 &&
        meetingsCount === 0 &&
        gamesCount === 0,
    }
  }, [entity?.players, entity?.meetings, entity?.teamGames])

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
        right={
          <EntityActionsMenu
            entityType="team"
            entityId={entity?.id}
            entityName={entity?.teamName}
            entity={entity}
            metaCounts={metaCounts}
            isArchived={entity?.active === false}
          />
        }
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
