// features/hub/teamProfile/components/TeamHeader.js
import React, { useMemo, useState, useEffect } from 'react'
import { buildFallbackAvatar } from '../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStrip from '../../../hub/sharedProfile/HeaderStrip'
import EntityActionsMenu from '../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../services/firestore/storage/uploadImageOnly.js'

const len = (arr) => (Array.isArray(arr) ? arr.length : 0)

export default function TeamHeader({ entity, context }) {
  const [openImg, setOpenImg] = useState(false)

  const fallback = buildFallbackAvatar({
    entityType: 'team',
    id: entity?.id,
    name: entity?.teamName,
  })

  const [headerPhoto, setHeaderPhoto] = useState(entity?.photo || fallback)

  useEffect(() => {
    setHeaderPhoto(entity?.photo || fallback)
  }, [entity?.photo, entity?.id])

  const metaCounts = useMemo(() => {
    const playersCount = len(entity?.players)
    const meetingsCount = len(entity?.meetings)
    const gamesCount = len(entity?.teamGames)

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

  return (
    <>
      <HeaderStrip
        title={entity?.teamName || ''}
        subtitle={`${context?.club?.clubName || ''} · ${entity?.teamYear || ''}`}
        avatarSrc={headerPhoto}
        onAvatarClick={() => setOpenImg(true)}
        right={
          <EntityActionsMenu
            entityType="team"
            entityId={entity?.id}
            entityName={entity?.teamName}
            metaCounts={metaCounts}
            isArchived={entity?.active === false}
          />
        }
      />

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="teams"
        id={entity?.id}
        entityName={entity?.teamName}
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
