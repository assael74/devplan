// features/hub/teamProfile/desktop/components/TeamHeader.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Tooltip, Typography } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useNavigate } from 'react-router-dom'

import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

import ifaImage from '../../../../../ui/core/images/ifaImage.png'

const getItemsCount = items => (Array.isArray(items) ? items.length : 0)

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

const getClubName = ({ entity, context }) =>
  context?.club?.clubName ||
  entity?.club?.clubName ||
  entity?.club?.name ||
  ''

function IFAButton({ ifaLink }) {
  const tooltipTitle = ifaLink
    ? 'פתח באתר ההתאחדות'
    : 'אין קישור להתאחדות'

  return (
    <Tooltip title={tooltipTitle}>
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
          endDecorator={
            <OpenInNewIcon
              sx={{
                fontSize: 16,
              }}
            />
          }
          sx={{
            minHeight: 34,
            px: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 10,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          התאחדות
        </Button>
      </span>
    </Tooltip>
  )
}

function TeamSubtitle({ entity, context, onClubClick }) {
  const clubName = getClubName({ entity, context })
  const clubId = getClubId({ entity, context })
  const teamYear = entity?.teamYear || ''

  if (!clubName && !teamYear) return null

  return (
    <Box
      component="span"
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
          component="span"
          role={clubId ? 'button' : undefined}
          tabIndex={clubId ? 0 : -1}
          size="sm"
          variant="plain"
          color="neutral"
          disabled={!clubId}
          onClick={onClubClick}
          onKeyDown={event => {
            if (!clubId) return
            if (event.key !== 'Enter' && event.key !== ' ') return

            event.preventDefault()
            onClubClick()
          }}
          sx={{
            minHeight: 22,
            px: 0.5,
            py: 0,
            fontWeight: 700,
            color: 'text.secondary',
            borderRadius: 'sm',
            cursor: clubId ? 'pointer' : 'default',
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
        <Typography
          component="span"
          level="body-xs"
          sx={{
            color: 'text.tertiary',
          }}
        >
          ·
        </Typography>
      )}

      {teamYear && (
        <Typography
          component="span"
          level="body-xs"
          sx={{
            color: 'text.tertiary',
          }}
        >
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

  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })

  const [headerPhoto, setHeaderPhoto] = useState(avatarSrc)

  useEffect(() => {
    setHeaderPhoto(avatarSrc)
  }, [avatarSrc])

  const metaCounts = useMemo(() => {
    const playersCount = getItemsCount(entity?.players)
    const gamesCount = getItemsCount(entity?.teamGames)
    const meetingsCount = getItemsCount(entity?.meetings)

    return {
      players: playersCount,
      games: gamesCount,
      meetings: meetingsCount,
      isDeletable:
        playersCount === 0 &&
        gamesCount === 0 &&
        meetingsCount === 0,
    }
  }, [
    entity?.players,
    entity?.teamGames,
    entity?.meetings,
  ])

  const handleClubClick = () => {
    const clubId = getClubId({ entity, context })
    if (!clubId) return

    navigate(`/clubs/${clubId}`)
  }

  const handleImageSave = url => {
    if (!url) return

    const separator = url.includes('?') ? '&' : '?'
    setHeaderPhoto(`${url}${separator}v=${Date.now()}`)
  }

  return (
    <>
      <HeaderStrip
        title={entity?.teamName || ''}
        subtitle={
          <TeamSubtitle
            entity={entity}
            context={context}
            onClubClick={handleClubClick}
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
        onAfterSave={handleImageSave}
      />
    </>
  )
}
