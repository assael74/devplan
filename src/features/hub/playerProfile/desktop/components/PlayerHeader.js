// src/features/players/playerProfile/desktop/components/PlayerHeader.js

import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, Tooltip, Typography } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useNavigate } from 'react-router-dom'

import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import EntityImageModal from '../../../../../ui/domains/entityImage/EntityImageModal.js'
import { uploadImageOnly } from '../../../../../services/firestore/storage/uploadImageOnly.js'

import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import ifaImage from '../../../../../ui/core/images/ifaImage.png'

const getItemsCount = items => (Array.isArray(items) ? items.length : 0)

const openExternalLink = url => {
  if (!url) return

  window.open(url, '_blank', 'noopener,noreferrer')
}

const getTeamId = context =>
  context?.team?.id ||
  context?.team?.teamId ||
  context?.teamId ||
  null

function IFAButton({ ifaLink }) {
  const tooltipTitle = ifaLink
    ? 'פתח באתר ההתאחדות'
    : 'אין קישור להתאחדות'

  return (
    <Tooltip title={tooltipTitle}>
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

function PlayerSubtitle({ context, onTeamClick }) {
  const teamName = context?.team?.teamName || ''
  const clubName = context?.club?.clubName || ''
  const teamId = getTeamId(context)

  if (!teamName && !clubName) return null

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
      {teamName && (
        <Button
          component="span"
          role={teamId ? 'button' : undefined}
          tabIndex={teamId ? 0 : -1}
          size="sm"
          variant="plain"
          color="neutral"
          disabled={!teamId}
          onClick={onTeamClick}
          onKeyDown={event => {
            if (!teamId) return
            if (event.key !== 'Enter' && event.key !== ' ') return

            event.preventDefault()
            onTeamClick()
          }}
          sx={{
            minHeight: 22,
            px: 0.5,
            py: 0,
            borderRadius: 'sm',
            fontWeight: 700,
            color: 'text.secondary',
            cursor: teamId ? 'pointer' : 'default',
            '&:hover': {
              bgcolor: 'background.level1',
              color: 'primary.plainColor',
            },
          }}
        >
          {teamName}
        </Button>
      )}

      {teamName && clubName && (
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

      {clubName && (
        <Typography
          component="span"
          level="body-xs"
          sx={{
            color: 'text.tertiary',
          }}
        >
          {clubName}
        </Typography>
      )}
    </Box>
  )
}

export default function PlayerHeader({ entity, context }) {
  const navigate = useNavigate()
  const [openImg, setOpenImg] = useState(false)

  const photoSrc = entity?.photo || playerImage
  const [headerPhoto, setHeaderPhoto] = useState(photoSrc)

  const ifaLink =
    entity?.ifaLink ||
    entity?.playerIfaLink ||
    null

  useEffect(() => {
    setHeaderPhoto(photoSrc)
  }, [photoSrc])

  const metaCounts = useMemo(() => {
    const paymentsCount = getItemsCount(entity?.payments)
    const meetingsCount = getItemsCount(entity?.meetings)
    const gamesCount = getItemsCount(entity?.playerGames)

    return {
      payments: paymentsCount,
      games: gamesCount,
      meetings: meetingsCount,
      isDeletable:
        paymentsCount === 0 &&
        meetingsCount === 0 &&
        gamesCount === 0,
    }
  }, [
    entity?.payments,
    entity?.meetings,
    entity?.playerGames,
  ])

  const fullName = useMemo(() => {
    const firstName = entity?.playerFirstName || ''
    const lastName = entity?.playerLastName || ''

    return `${firstName} ${lastName}`.trim()
  }, [
    entity?.playerFirstName,
    entity?.playerLastName,
  ])

  const handleTeamClick = () => {
    const teamId = getTeamId(context)
    if (!teamId) return

    navigate(`/teams/${teamId}`)
  }

  const handleImageSave = url => {
    if (!url) return

    const separator = url.includes('?') ? '&' : '?'
    setHeaderPhoto(`${url}${separator}v=${Date.now()}`)
  }

  return (
    <>
      <HeaderStrip
        title={fullName || 'שחקן'}
        subtitle={
          <PlayerSubtitle
            context={context}
            onTeamClick={handleTeamClick}
          />
        }
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
        onAfterSave={handleImageSave}
      />
    </>
  )
}
