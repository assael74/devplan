// features/hub/teamProfile/mobile/components/TeamHeader.js

import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStripMobile from '../../../../hub/sharedProfile/mobile/HeaderStripMobile'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

const len = (arr) => (Array.isArray(arr) ? arr.length : 0)

export default function TeamHeader({ entity, context, onBack }) {
  const navigate = useNavigate()

  const [openImg, setOpenImg] = useState(false)

  const src = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: context?.club || entity?.club,
    subline: context?.club?.clubName || entity?.clubName || '',
  })

  const [headerPhoto, setHeaderPhoto] = useState(src)

  useEffect(() => {
    setHeaderPhoto(src)
  }, [src, entity?.id])

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

  const subtitle = useMemo(() => {
    const clubName = context?.club?.clubName || entity?.clubName || ''
    const teamYear = entity?.teamYear || ''
    return [clubName, teamYear].filter(Boolean).join(' · ')
  }, [context?.club?.clubName, entity?.clubName, entity?.teamYear])

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

  const rightNode = (
    <EntityActionsMenu
      entityType="team"
      entityId={entity?.id}
      entityName={entity?.teamName}
      metaCounts={metaCounts}
      isArchived={entity?.active === false}
    />
  )

  return (
    <>
      <HeaderStripMobile
        title={entity?.teamName || 'קבוצה'}
        subtitle={subtitle}
        avatarSrc={headerPhoto}
        onAvatarClick={() => setOpenImg(true)}
        onBack={onBack}
        pathItems={pathItems}
        right={rightNode}
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
