// features/playersDatabase/ui/pages/entryPage/EntryVisuals.js

import {
  Box,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import dataManagementImage from '../../../../../ui/core/images/dataManagement.png'
import { entryVisualsSx as sx } from './sx/entryVisuals.sx.js'

export function DataPreviewGraphic({ onOpenDataOps }) {
  return (
    <Box sx={sx.previewGraphic}>
      <Box aria-hidden='true' sx={sx.previewCircle} />

      <Tooltip title='פתיחת ניהול הדאטה' placement='bottom'>
        <Box
          component='button'
          type='button'
          aria-label='פתיחת ניהול הדאטה'
          onClick={onOpenDataOps}
          sx={sx.previewChartCard}
        >
          <Box
            component='img'
            src={dataManagementImage}
            alt=''
            aria-hidden='true'
            sx={sx.previewChartImage}
          />
          <Typography sx={sx.previewChartLabel}>
            <Box component='span'>ניהול דאטה</Box>
            {iconUi({ id: 'forward', sx: sx.previewChartArrow })}
          </Typography>
        </Box>
      </Tooltip>

      <Box aria-hidden='true' sx={sx.previewLineCard}>
        <Box sx={sx.previewLine} />
      </Box>

      <Box aria-hidden='true' sx={sx.previewPlayerCard}>
        <Box sx={sx.previewPlayerAvatar} />

        <Stack spacing={0.4} sx={sx.previewPlayerContent}>
          <Box sx={sx.previewPlayerTitle} />
          <Box sx={sx.previewPlayerText} />

          <Typography level='body-xs' sx={sx.previewPlayerScore}>
            87%
          </Typography>
        </Stack>
      </Box>
    </Box>
  )
}

export function SearchVisual() {
  return (
    <Box aria-hidden='true' sx={sx.routeVisual}>
      <Box sx={sx.searchCircle} />
      <Box sx={sx.searchHandle} />
      <Box sx={sx.searchHead} />
      <Box sx={sx.searchBody} />
    </Box>
  )
}

export function LeagueVisual() {
  return (
    <Box aria-hidden='true' sx={sx.leagueVisual}>
      <Box sx={sx.leagueLineTop} />
      <Box sx={sx.leagueLineLeft} />
      <Box sx={sx.leagueLineRight} />
      <Box sx={sx.leagueNodeTop} />
      <Box sx={sx.leagueNodeLeft} />
      <Box sx={sx.leagueNodeRight} />

      <Box sx={sx.leagueMainNode}>
        <Typography level='title-lg' sx={sx.leagueMainValue}>
          +190
        </Typography>

        <Typography level='body-xs' sx={sx.leagueMainLabel}>
          ליגות
        </Typography>
      </Box>
    </Box>
  )
}

export function RouteCardVisual({ variant }) {
  return variant === 'search' ? <SearchVisual /> : <LeagueVisual />
}
