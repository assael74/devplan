// features/playersDatabase/ui/pages/entryPage/EntryVisuals.js

import { Box, Stack, Typography } from '@mui/joy'

import { entryContentSx as sx } from './sx/entryContent.sx.js'

const PREVIEW_BAR_HEIGHTS = [18, 30, 44, 28]

export function DataPreviewGraphic() {
  return (
    <Box aria-hidden='true' sx={sx.previewGraphic}>
      <Box sx={sx.previewCircle} />

      <Box sx={sx.previewChartCard}>
        <Box sx={sx.previewChartBars}>
          {PREVIEW_BAR_HEIGHTS.map((height, index) => (
            <Box key={index} sx={{ ...sx.previewChartBar, height }} />
          ))}
        </Box>
      </Box>

      <Box sx={sx.previewLineCard}>
        <Box sx={sx.previewLine} />
      </Box>

      <Box sx={sx.previewPlayerCard}>
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
