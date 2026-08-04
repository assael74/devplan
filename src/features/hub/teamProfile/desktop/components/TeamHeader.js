// src/features/hub/teamProfile/desktop/components/TeamHeader.js

import React, { useMemo } from 'react'
import { Box, Button, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { getEntityColors } from '../../../../../ui/core/theme/Colors.js'
import HeaderStrip from '../../../../hub/sharedProfile/desktop/HeaderStrip'
import { useProfileHeaderImage } from '../../../../hub/sharedProfile/hooks/index.js'
import { ProfileHeaderImageModal, ProfileIfaButton } from '../../../../hub/sharedProfile/ui/index.js'

const teamHeaderColors = getEntityColors('teams')

const teamHeaderSx = {
  bgcolor: 'rgba(16, 185, 129, 0.045)',
  border: '1px solid',
  borderColor: 'rgba(16, 185, 129, 0.16)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)',
  '& .MuiAvatar-root': {
    border: '1px solid',
    borderColor: teamHeaderColors.accent,
    boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.08)',
  },
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
            fontWeight: 600,
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

export default function TeamHeader({ entity, context, backAction }) {
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
        backAction={backAction}
        onAvatarClick={image.openModal}
        right={<ProfileIfaButton ifaLink={ifaLink} />}
        sx={teamHeaderSx}
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
