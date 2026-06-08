// features/hub/teamProfile/desktop/components/TeamHeader.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box, Button, Tooltip, Typography } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useNavigate } from 'react-router-dom'

import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

import ifaImage from '../../../../../ui/core/images/ifaImage.png'

const len = arr => (Array.isArray(arr) ? arr.length : 0)

const openExternalLink = url => {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

const getClubId = ({ entity, context }) =>
  context?.club?.id ||
  context?.club?.clubId ||
  entity?.club?.id ||
  entity?.clubId ||
  null

function IFAButton({ ifaLink }) {
  return (
    <Tooltip title={ifaLink ? 'פתח באתר ההתאחדות' : 'אין קישור להתאחדות'}>
      <span>
        <Button
          size="sm"
          variant="solid"
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

function TeamSubtitle({ entity, context, onClubClick }) {
  const clubName =
    context?.club?.clubName ||
    entity?.club?.clubName ||
    entity?.club?.name ||
    ''

  const teamYear = entity?.teamYear || ''
  const clubId = getClubId({ entity, context })

  if (!clubName && !teamYear) return null

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        minWidth: 0,
        flexWrap: 'wrap',
      }}
    >
      {clubName && (
        <Button
          size="sm"
          variant="plain"
          color="neutral"
          disabled={!clubId}
          onClick={onClubClick}
          sx={{
            minHeight: 22,
            px: 0.5,
            py: 0,
            fontWeight: 700,
            color: 'text.secondary',
            borderRadius: 'sm',
            '&:hover': {
              bgcolor: 'background.level1',
              color: 'primary.plainColor',
            },
          }}
        >
          {clubName}
        </Button>
      )}

      {clubName && teamYear && (
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          ·
        </Typography>
      )}

      {teamYear && (
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          {teamYear}
        </Typography>
      )}
    </Box>
  )
}

export default function TeamHeader({ entity, context }) {
  const navigate = useNavigate()
  const [openImg, setOpenImg] = useState(false)

  const ifaLink = entity?.ifaLink || null

  const src = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })

  const [headerPhoto, setHeaderPhoto] = useState(src)

  useEffect(() => {
    setHeaderPhoto(src)
  }, [src])

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

  const goToClub = () => {
    const clubId = getClubId({ entity, context })
    if (!clubId) return

    navigate(`/clubs/${clubId}`)
  }

  return (
    <>
      <HeaderStrip
        title={entity?.teamName || ''}
        subtitle={
          <TeamSubtitle
            entity={entity}
            context={context}
            onClubClick={goToClub}
          />
        }
        avatarSrc={headerPhoto}
        onAvatarClick={() => setOpenImg(true)}
        right={
          <>
            <IFAButton ifaLink={ifaLink} />

            <EntityActionsMenu
              entityType="team"
              entityId={entity?.id}
              entityName={entity?.teamName}
              entity={entity}
              metaCounts={metaCounts}
              isArchived={entity?.active === false}
            />
          </>
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
        onAfterSave={url => {
          setHeaderPhoto(
            `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
          )
        }}
      />
    </>
  )
}
