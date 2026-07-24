// src/features/hub/teamProfile/desktop/components/TeamHeader.js

import React, { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import EntityActionsMenu from '../../../../hub/sharedProfile/EntityActionsMenu.js'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'
import { countHeaderItems } from '../../../../hub/sharedProfile/logic/headerModel.shared.js'

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
        <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary' }}>
          ·
        </Typography>
      )}

      {teamYear && (
        <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary' }}>
          {teamYear}
        </Typography>
      )}
    </Box>
  )
}

export default function TeamHeader({ entity, context }) {
  const navigate = useNavigate()
  const ifaLink = entity?.ifaLink || null
  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name,
  })
  const image = useProfileHeaderImage({
    entityId: entity?.id,
    source: avatarSrc,
  })

  const metaCounts = useMemo(() => {
    const playersCount = countHeaderItems(entity?.players)
    const gamesCount = countHeaderItems(entity?.teamGames)
    const meetingsCount = countHeaderItems(entity?.meetings)

    return {
      players: playersCount,
      games: gamesCount,
      meetings: meetingsCount,
      isDeletable:
        playersCount === 0 &&
        gamesCount === 0 &&
        meetingsCount === 0,
    }
  }, [entity?.players, entity?.teamGames, entity?.meetings])

  const handleClubClick = () => {
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
            onClubClick={handleClubClick}
          />
        }
        avatarSrc={image.photo}
        onAvatarClick={image.openModal}
        right={
          <>
            <ProfileIfaButton
              ifaLink={ifaLink}
              variant="solid"
            />

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
      <ProfileHeaderImageModal
        image={image}
        entityType="teams"
        entityId={entity?.id}
        entityName={entity?.teamName}
      />
    </>
  )
}
