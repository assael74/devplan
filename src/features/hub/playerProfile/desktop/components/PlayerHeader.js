// src/features/players/playerProfile/desktop/components/PlayerHeader.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box, Button, Tooltip } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import ifaImage from '../../../../../ui/core/images/ifaImage.png'

const len = (arr) => (Array.isArray(arr) ? arr.length : 0)

const openExternalLink = (url) => {
  if (!url) return

  window.open(url, '_blank', 'noopener,noreferrer')
}

function IFAButton({ ifaLink }) {
  return (
    <Tooltip title={ifaLink ? 'פתח באתר ההתאחדות' : 'אין קישור להתאחדות'}>
      <span>
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          disabled={!ifaLink}
          onClick={() => openExternalLink(ifaLink)}
          startDecorator={
            <Box
              component="img"
              src={ifaImage}
              alt="התאחדות"
              sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                objectFit: 'contain',
              }}
            />
          }
          endDecorator={<OpenInNewIcon sx={{ fontSize: 16 }} />}
          sx={{
            minHeight: 34,
            px: 1,
            borderRadius: 10,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          התאחדות
        </Button>
      </span>
    </Tooltip>
  )
}

export default function PlayerHeader({ entity, context, counts }) {
  const [openImg, setOpenImg] = useState(false)
  const [headerPhoto, setHeaderPhoto] = useState(entity?.photo || playerImage)

  const ifaLink = entity?.ifaLink || entity?.playerIfaLink || null

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
  }, [entity?.payments, entity?.meetings, entity?.playerGames])

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
          <>
            <IFAButton ifaLink={ifaLink} />

            <EntityActionsMenu
              entityType="player"
              entityId={entity?.id}
              entityName={fullName}
              metaCounts={metaCounts}
              isArchived={entity?.active === false}
            />
          </>
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
