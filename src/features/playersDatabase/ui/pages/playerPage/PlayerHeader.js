// features/playersDatabase/ui/pages/playerPage/PlayerHeader.js

import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import ActivityStatusChip from '../../components/status/ActivityStatusChip.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'
import {
  resolvePlayerHeaderMeta,
} from './logic/playerPage.utils.js'
import { playerPageSx as sx } from './sx/playerPage.sx.js'

export default function PlayerHeader({
  breadcrumbs = [],
  player = {},
  onSearch,
  onTeam,
}) {
  const {
    fullName,
    birthYear,
    certainty,
  } = resolvePlayerHeaderMeta(player)

  const canNavigateToTeam = !!player.leagueId && !!player.teamId

  return (
    <Box sx={sx.header}>
      <Stack sx={sx.headerCopy}>
        <Breadcrumbs items={breadcrumbs} />

        <Box sx={sx.titleRow}>
          <Box
            component='img'
            src={player.avatarUrl || playerImage}
            alt={fullName}
            sx={sx.playerAvatar}
          />

          <Typography
            level='h1'
            sx={sx.pageTitle}
          >
            {fullName}
          </Typography>

          {birthYear ? (
            <Box sx={sx.birthYearChip}>
              {birthYear}
            </Box>
          ) : null}
        </Box>
      </Stack>

      <Stack sx={sx.headerActionsPanel}>
        <ActivityStatusChip
          active
          label={`ודאות ${certainty}`}
        />

        <Stack
          direction='row'
          spacing={1}
          sx={sx.headerActions}
        >
          <Button
            sx={sx.primaryButton}
            startDecorator={iconUi({
              id: 'playerDatabase',
              size: 'sm',
            })}
            onClick={onSearch}
          >
            מעבר לעמוד חיפוש
          </Button>

          <Button
            variant='outlined'
            sx={sx.secondaryButton}
            startDecorator={iconUi({
              id: 'back',
              size: 'sm',
            })}
            disabled={!canNavigateToTeam}
            onClick={onTeam}
          >
            חזרה לקבוצה
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
