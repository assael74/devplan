// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutContext.js

import {
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import { resolveEntityAvatar } from '../../../../../../ui/core/avatars/fallbackAvatar.js'
import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

function ContextValue({ label, value, note }) {
  return (
    <Box sx={sx.contextItem}>
      <Typography level='body-xs' sx={sx.contextLabel}>
        {label}
      </Typography>

      <Typography level='title-md' sx={sx.contextValue}>
        {value}
      </Typography>

      {note ? (
        <Typography level='body-xs' sx={sx.contextNote}>
          {note}
        </Typography>
      ) : null}
    </Box>
  )
}

function EntityContextHeader({ src, title, subtitle }) {
  return (
    <Box sx={sx.contextEntityHeader}>
      <Box component='img' src={src} alt={title} sx={sx.contextAvatar} />

      <Box sx={sx.contextEntityText}>
        <Typography level='title-sm' sx={sx.contextEntityTitle}>
          {title}
        </Typography>

        {subtitle ? (
          <Typography level='body-xs' sx={sx.contextEntitySub}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}

export default function PlayerScoutContext({ context = {}, seasonStats = [], identity = {} }) {
  const items = Array.isArray(context.items) ? context.items : []
  const playerStats = Array.isArray(seasonStats)
    ? seasonStats.filter(item => item.label !== 'פרופילים').slice(0, 4)
    : []
  const teamAvatar = resolveEntityAvatar({
    entityType: 'team',
    entity: {
      id: identity.teamId || identity.clubId,
      teamName: identity.teamName || identity.clubName,
    },
  })
  const playerAvatar = resolveEntityAvatar({
    entityType: 'player',
    entity: {
      id: identity.playerId,
      playerName: identity.fullName,
      avatarUrl: identity.avatarUrl,
    },
    playerFallback: playerImage,
  })

  return (
    <Box sx={sx.sectionCard}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionHeading}>
          <Box sx={[sx.sectionIcon, sx.sectionIconTone.context]}>
            {iconUi({id: 'team', size: 'sm'})}
          </Box>

          <Box>
            <Typography level='title-md' sx={sx.sectionTitle}>
              הקשר מקצועי
            </Typography>

            <Typography level='body-xs' sx={sx.sectionSubtitle}>
              באיזו סביבה הפרופיל מתקיים ומה מעמד השחקן בתוכה
            </Typography>
          </Box>
        </Box>

        {context.competitionLabel || context.teamLabel ? (
          <Box sx={sx.contextChips}>
            {context.competitionLabel ? (
              <Chip size='sm' variant='soft' color='primary'>
                {context.competitionLabel}
              </Chip>
            ) : null}

            {context.teamLabel ? (
              <Chip size='sm' variant='soft' color='neutral'>
                {context.teamLabel}
              </Chip>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <Box sx={sx.contextColumns}>
        <Box sx={sx.contextGroup}>
          <EntityContextHeader
            src={teamAvatar}
            title={identity.clubName || identity.teamName || 'סביבת הקבוצה'}
            subtitle={identity.leagueName}
          />

          {items.length ? (
            <Box sx={sx.contextGrid}>
              {items.map(item => (
                <ContextValue
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  note={item.note}
                />
              ))}
            </Box>
          ) : (
            <Typography level='body-sm' sx={sx.contextEmptyText}>
              אין כרגע הקשר קבוצתי מלא. האזור יתמלא ככל שיצטבר מידע על רמת הליגה וביצועי הקבוצה.
            </Typography>
          )}
        </Box>

        <Box sx={[sx.contextGroup, sx.contextGroupPlayer]}>
          <EntityContextHeader
            src={playerAvatar}
            title={identity.fullName || 'השחקן'}
            subtitle='השחקן בתוך הקבוצה'
          />

          <Box sx={sx.contextGrid}>
            {playerStats.map(item => (
              <ContextValue
                key={item.label}
                label={item.label}
                value={item.value}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
