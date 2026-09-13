import { Box, Button, Tooltip, Typography } from '@mui/joy'

import clubLogo from '../../../../../ui/core/images/clubLogo.png'
import { clubSharedSx as sx } from './sx/clubShared.sx.js'

const clean = value => String(
  value === null || value === undefined ? '' : value
).trim()

const formatClubLevel = value => {
  const level = Number(value)

  if (!Number.isFinite(level) || level <= 0) return '-'
  return Number.isInteger(level) ? String(level) : level.toFixed(1)
}

export default function ClubIdentity({
  club,
  onOpenClub,
  compact = false,
  disableExternalLink = false,
  sx: rootSx,
}) {
  const clubLevel = formatClubLevel(
    club?.clubStrengthLevel || club?.clubLevel
  )
  const clubUrl = clean(club?.clubUrl)

  const handleOpenClub = event => {
    event.stopPropagation()
    onOpenClub?.(club)
  }

  return (
    <Box sx={[sx.clubIdentity, compact && sx.clubIdentityCompact, rootSx]}>
      <Box sx={sx.clubAvatar}>
        <Box
          component='img'
          src={clubLogo}
          alt=''
          sx={sx.clubLogo}
        />
        <Box
          sx={sx.clubLevelBadge}
          aria-label={`רמת מועדון ${clubLevel}`}
        >
          {clubLevel}
        </Box>
      </Box>

      <Box sx={sx.clubCopy}>
        <Box sx={sx.clubNameRow}>
          {clubUrl && !disableExternalLink ? (
            <Tooltip
              title='פתיחת קישור חיצוני למועדון'
              placement='top'
            >
              <Box
                component='a'
                href={clubUrl}
                target='_blank'
                rel='noopener noreferrer'
                referrerPolicy='no-referrer'
                aria-label={`פתיחת קישור חיצוני למועדון ${club?.name || ''}`}
                sx={sx.clubNameLink}
                onClick={event => event.stopPropagation()}
              >
                <Typography
                  component='span'
                  level='title-sm'
                  sx={sx.clubName}
                >
                  {club?.name || '-'}
                </Typography>
                <Box
                  component='span'
                  aria-hidden='true'
                  data-link-indicator
                  sx={sx.clubNameLinkIndicator}
                />
              </Box>
            </Tooltip>
          ) : (
            <Typography level='title-sm' sx={sx.clubName}>
              {club?.name || '-'}
            </Typography>
          )}
        </Box>

        {onOpenClub ? (
          <Button
            size='sm'
            variant='plain'
            sx={sx.openClubButton}
            onClick={handleOpenClub}
          >
            פתח מועדון
          </Button>
        ) : null}
      </Box>
    </Box>
  )
}
