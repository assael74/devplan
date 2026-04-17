/// features/hub/clubProfile/mobile/components/ClubHeader.js

import React, { useMemo, useState, useEffect } from 'react'
import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStripMobile from '../../../../hub/sharedProfile/mobile/HeaderStripMobile'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

const len = (arr) => (Array.isArray(arr) ? arr.length : 0)

export default function ClubHeader({ entity, context }) {
  const [openImg, setOpenImg] = useState(false)

  const fallback = buildFallbackAvatar({
    entityType: 'club',
    id: entity?.id,
    name: entity?.clubName,
  })

  const [headerPhoto, setHeaderPhoto] = useState(entity?.photo || fallback)

  useEffect(() => {
    setHeaderPhoto(entity?.photo || fallback)
  }, [entity?.photo, entity?.id])

  const metaCounts = useMemo(() => {
    const teamsCount = len(entity?.teams)
    return {
      teams: teamsCount,
      isDeletable: teamsCount === 0,
    }
  }, [entity?.teams])

  return (
    <>
      <HeaderStripMobile
        title={entity?.clubName || ''}
        subtitle={context?.project?.label || ''}
        avatarSrc={headerPhoto}
        onAvatarClick={() => setOpenImg(true)}
        right={
          <EntityActionsMenu
            entityType="club"
            entityId={entity?.id}
            entityName={entity?.clubName}
            metaCounts={metaCounts}
            isArchived={entity?.active === false}
          />
        }
      />

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="clubs"
        id={entity?.id}
        entityName={entity?.clubName}
        currentPhotoUrl={headerPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          setHeaderPhoto(
            `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
          )
        }}
      />
    </>
  )
}
