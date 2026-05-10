/// features/hub/clubProfile/desktop/components/ClubHeader.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box, Button, Tooltip } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import { buildFallbackAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'
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

export default function ClubHeader({ entity, context }) {
  const [openImg, setOpenImg] = useState(false)

  const ifaLink = entity?.ifaLink || entity?.clubIfaLink || null

  const fallback = buildFallbackAvatar({
    entityType: 'club',
    id: entity?.id,
    name: entity?.clubName,
  })

  const [headerPhoto, setHeaderPhoto] = useState(entity?.photo || fallback)

  useEffect(() => {
    setHeaderPhoto(entity?.photo || fallback)
  }, [entity?.photo, entity?.id, fallback])

  const metaCounts = useMemo(() => {
    const teamsCount = len(entity?.teams)
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
        avatarSrc={headerPhoto}
        onAvatarClick={() => setOpenImg(true)}
        right={
          <>
            <IFAButton ifaLink={ifaLink} />

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
