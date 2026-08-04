// src/features/hub/playerProfile/desktop/components/PlayerHeader.js

import React, { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'

const playerHeaderColors = getEntityColors('players')

const playerHeaderSx = {
  bgcolor: 'rgba(76, 110, 245, 0.05)',
  border: '1px solid',
  borderColor: 'rgba(76, 110, 245, 0.16)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
  '& .MuiAvatar-root': {
    border: '1px solid',
    borderColor: playerHeaderColors.accent,
    boxShadow: '0 0 0 4px rgba(76, 110, 245, 0.08)',
  },
}

const getTeamId = context =>
  context?.team?.id ||
  context?.team?.teamId ||
  context?.teamId ||
  null

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
        <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary' }}>
          ·
        </Typography>
      )}

      {clubName && (
        <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary' }}>
          {clubName}
        </Typography>
      )}
    </Box>
  )
}

export default function PlayerHeader({ entity, context, backAction }) {
  const navigate = useNavigate()
  const photoSrc = entity?.photo || playerImage
  const ifaLink = entity?.ifaLink || entity?.playerIfaLink || null
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source: photoSrc,
  })



  const fullName = useMemo(() => {
    const firstName = entity?.playerFirstName || ''
    const lastName = entity?.playerLastName || ''

    return `${firstName} ${lastName}`.trim()
  }, [entity?.playerFirstName, entity?.playerLastName])

  const handleTeamClick = () => {
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
            onTeamClick={handleTeamClick}
          />
        }
        avatarSrc={image.photo}
        backAction={backAction}
        onAvatarClick={image.openModal}
        right={<ProfileIfaButton ifaLink={ifaLink} />}
        sx={playerHeaderSx}
      />
      <ProfileHeaderImageModal
        image={image}
        entityType="players"
        entityId={entity?.id}
        entityName={fullName}
      />
    </>
  )
}
