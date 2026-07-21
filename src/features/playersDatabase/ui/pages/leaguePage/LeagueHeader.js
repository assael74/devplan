// features/playersDatabase/ui/pages/leaguePage/LeagueHeader.js

import { Box, Button, Stack, Typography } from '@mui/joy'

import Breadcrumbs from '../../layout/Breadcrumbs.js'
import ActivityStatusChip from '../../components/status/ActivityStatusChip.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { leaguePageSx as sx } from './sx/leaguePage.sx.js'

function TitleChip({ children, tone = 'primary' }) {
  return (
    <Box sx={{
      ...sx.titleChip,
      ...(tone === 'tertiary' ? sx.titleChipTertiary : {}),
    }}>
      {children}
    </Box>
  )
}

export default function LeagueHeader({
  breadcrumbs = [],
  title = '',
  region = '',
  ageGroup = '',
  levelLabel = '',
  active = false,
  onSearch,
  onBack,
}) {
  return (
    <Box sx={sx.header}>
      <Stack sx={sx.headerCopy}>
        <Breadcrumbs items={breadcrumbs} />

        <Box sx={sx.titleRow}>
          <Typography level='h1' sx={sx.pageTitle}>
            {title}
            {region ? (
              <Box component='span' sx={sx.titleRegion}>
                {' - '}
                {region}
              </Box>
            ) : null}
          </Typography>

          <Box sx={sx.titleChips}>
            <TitleChip tone='tertiary'>{ageGroup}</TitleChip>
            <TitleChip>{levelLabel}</TitleChip>
          </Box>
        </Box>
      </Stack>

      <Stack sx={sx.actionsPanel}>
        <ActivityStatusChip active={active} />

        <Stack direction='row' spacing={1} sx={sx.actions}>
          <Button
            sx={sx.primaryButton}
            startDecorator={iconUi({ id: 'playerDatabase', size: 'sm' })}
            onClick={onSearch}
          >
            מעבר לעמוד חיפוש
          </Button>

          <Button
            variant='outlined'
            sx={sx.secondaryButton}
            startDecorator={iconUi({ id: 'back', size: 'sm' })}
            onClick={onBack}
          >
            חזרה למרכז ליגות
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
