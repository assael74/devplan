// src/features/players/playerProfile/components/PlayerHeader.js
import React, { useMemo, useState, useEffect } from 'react'
import HeaderStrip from '../../../hub/sharedProfile/HeaderStrip'
import EntityActionsMenu from '../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../services/firestore/storage/uploadImageOnly.js'
import playerImage from '../../../../ui/core/images/playerImage.jpg'

const len = (arr) => (Array.isArray(arr) ? arr.length : 0)

export default function PlayerHeader({ entity, context, counts }) {
  const [openImg, setOpenImg] = useState(false)
  const [headerPhoto, setHeaderPhoto] = useState(entity?.photo || playerImage)

  useEffect(() => {
    setHeaderPhoto(entity?.photo || playerImage)
  }, [entity?.photo, entity?.id])

  const metaCounts = useMemo(() => {
    const meetingsCount = len(entity?.meetings)
    const gamesCount = len(entity?.playerGames)
    const paymentsCount = len(entity?.payments)

    return {
      payments: paymentsCount,
      games: gamesCount,
      meetings: meetingsCount,
      isDeletable: paymentsCount === 0 && meetingsCount === 0 && gamesCount === 0,
    }
  }, [entity?.payments, entity?.meetings, entity?.teamGames])

  const fullName = useMemo(
    () => `${entity?.playerFirstName || ''} ${entity?.playerLastName || ''}`.trim(),
    [entity]
  )

  const subtitle = useMemo(() => {
    const t = context?.team?.teamName || ''
    const c = context?.club?.clubName || ''
    return [t, c].filter(Boolean).join(' · ')
  }, [context?.team?.teamName, context?.club?.clubName])

  return (
    <>
      <HeaderStrip
        title={fullName || 'שחקן'}
        subtitle={subtitle}
        avatarSrc={headerPhoto}
        onAvatarClick={() => setOpenImg(true)}
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

      <EntityImageModal
        open={openImg}
        onClose={() => setOpenImg(false)}
        entityType="players"
        id={entity?.id}
        entityName={fullName}
        currentPhotoUrl={headerPhoto}
        uploadImageOnly={uploadImageOnly}
        onAfterSave={(url) => {
          setHeaderPhoto(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`)
        }}
      />
    </>
  )
}
