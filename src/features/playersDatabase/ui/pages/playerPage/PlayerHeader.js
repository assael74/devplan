// src/features/playersDatabase/ui/pages/playerPage/PlayerHeader.js

import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from '@mui/joy'

import PageHeader from '../../components/page/PageHeader.js'
import FavoriteButton from '../../components/actions/FavoriteButton.js'
import TeamName from '../../components/entities/TeamName.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import { resolvePlayerHeaderMeta } from './logic/playerPage.utils.js'
import { playerHeaderSx as sx } from './sx/playerHeader.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export default function PlayerHeader({
  breadcrumbs = [],
  player = {},
  seasonLabel = 'כל העונות',
  reliabilityLabel = '-',
  reliabilityColor = 'neutral',
  hasScoutProfiles = false,
  favorite = false,
  favoriteLoading = false,
  onFavoriteToggle,
  onSearch,
  onTeam,
}) {
  const {
    fullName,
    birthYear,
  } = resolvePlayerHeaderMeta(player)
  const clubName = clean(player.clubName)
  const teamSlot = Number(player.birthTeamSlot || player.teamSlot || 1) || 1

  const canNavigateToTeam = !!player.leagueId && !!player.teamId
  const actions = (
    <Stack sx={sx.headerActionsPanel}>
      {hasScoutProfiles ? (
        <Chip
          size='sm'
          variant='soft'
          color={reliabilityColor}
          sx={sx.reliabilityChip}
        >
          {`אמינות פרופיל ${reliabilityLabel}`}
        </Chip>
      ) : null}

      <Stack direction='row' spacing={1} sx={sx.headerActions}>
        <Button
          sx={sx.primaryButton}
          startDecorator={iconUi({id: 'playerDatabase', size: 'sm'})}
          onClick={onSearch}
        >
          מעבר לעמוד חיפוש
        </Button>

        <Button
          variant='outlined'
          sx={sx.secondaryButton}
          startDecorator={iconUi({id: 'back', size: 'sm'})}
          disabled={!canNavigateToTeam}
          onClick={onTeam}
        >
          חזרה לקבוצה
        </Button>
      </Stack>
    </Stack>
  )

  return (
    <PageHeader
      breadcrumbs={breadcrumbs}
      sx={sx.header}
      actions={actions}
    >
      <Box sx={sx.titleRow}>
        <Box
          component='img'
          src={player.avatarUrl || playerImage}
          alt={fullName}
          sx={sx.playerAvatar}
        />

        <Typography level='h1' sx={sx.pageTitle}>
          {fullName}
        </Typography>

        <FavoriteButton
          favorite={favorite}
          loading={favoriteLoading}
          label={fullName}
          onToggle={onFavoriteToggle}
        />

        {birthYear ? (
          <Box sx={sx.birthYearChip}>
            {birthYear}
          </Box>
        ) : null}

        {clubName && clubName !== '-' ? (
          <Box sx={sx.teamChip}>
            <TeamName
              value={clubName}
              slot={teamSlot}
              fontSize={13}
            />
          </Box>
        ) : null}

        <Box sx={sx.seasonChip}>
          {seasonLabel}
        </Box>
      </Box>
    </PageHeader>
  )
}
