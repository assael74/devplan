// src/features/hub/playerProfile/desktop/components/PlayerHeader.js

import React, { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'
import { countHeaderItems } from '../../../../hub/sharedProfile/logic/headerModel.shared.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'

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

export default function PlayerHeader({ entity, context }) {
  const navigate = useNavigate()
  const photoSrc = entity?.photo || playerImage
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source: photoSrc,
  })

  const ifaLink = entity?.ifaLink || entity?.playerIfaLink || null

  const metaCounts = useMemo(() => {
    const paymentsCount = countHeaderItems(entity?.payments)
    const meetingsCount = countHeaderItems(entity?.meetings)
    const gamesCount = countHeaderItems(entity?.playerGames)

    return {
      payments: paymentsCount,
      games: gamesCount,
      meetings: meetingsCount,
      isDeletable:
        paymentsCount === 0 &&
        meetingsCount === 0 &&
        gamesCount === 0,
    }
  }, [entity?.payments, entity?.meetings, entity?.playerGames])

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
        onAvatarClick={image.openModal}
        right={
          <>
            <ProfileIfaButton ifaLink={ifaLink} />

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
      <ProfileHeaderImageModal
        image={image}
        entityType="players"
        entityId={entity?.id}
        entityName={fullName}
      />
    </>
  )
}
