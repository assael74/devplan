// src/features/players/playerProfile/desktop/components/PlayerHeader.js

import React, { useMemo, useState, useEffect } from 'react'
import { Box, Button, Tooltip, Typography } from '@mui/joy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useNavigate } from 'react-router-dom'

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

const getTeamId = (context) =>
  context?.team?.id ||
  context?.team?.teamId ||
  context?.teamId ||
  null

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

function PlayerSubtitle({ context, onTeamClick }) {
  const teamName = context?.team?.teamName || ''
  const clubName = context?.club?.clubName || ''
  const teamId = getTeamId(context)

  if (!teamName && !clubName) return null

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
      {teamName && (
        <Button
          size="sm"
          variant="plain"
          color="neutral"
          disabled={!teamId}
          onClick={onTeamClick}
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
          {teamName}
        </Button>
      )}

      {teamName && clubName && (
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          ·
        </Typography>
      )}

      {clubName && (
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          {clubName}
        </Typography>
      )}
    </Box>
  )
}

export default function PlayerHeader({ entity, context, counts }) {
  const navigate = useNavigate()
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

  const goToTeam = () => {
    const teamId = getTeamId(context)
    if (!teamId) return

    navigate(`/teams/${teamId}`)
  }

  return (
    <>
      <HeaderStrip
        title={fullName || 'שחקן'}
        subtitle={
          <PlayerSubtitle
            context={context}
            onTeamClick={goToTeam}
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
        onAfterSave={(url) => {
          setHeaderPhoto(`${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`)
        }}
      />
    </>
  )
}
