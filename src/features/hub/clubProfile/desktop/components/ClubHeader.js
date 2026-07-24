// src/features/hub/clubProfile/desktop/components/ClubHeader.js

import React, { useMemo } from 'react'

import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'
import { countHeaderItems } from '../../../../hub/sharedProfile/logic/headerModel.shared.js'

export default function ClubHeader({ entity, context }) {
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

  const metaCounts = useMemo(() => {
    const teamsCount = countHeaderItems(entity?.teams)

    return {
      teams: teamsCount,
      isDeletable: teamsCount === 0,
    }
  }, [entity?.teams])

  return (
    <>
      <HeaderStrip
        title={entity?.clubName || ''}
        subtitle={context?.project?.label || ''}
        avatarSrc={image.photo}
        onAvatarClick={image.openModal}
        right={
          <>
            <ProfileIfaButton ifaLink={ifaLink} />

            <EntityActionsMenu
              entityType="club"
              entityId={entity?.id}
              entityName={entity?.clubName}
              metaCounts={metaCounts}
              isArchived={entity?.active === false}
            />
          </>
        }
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
