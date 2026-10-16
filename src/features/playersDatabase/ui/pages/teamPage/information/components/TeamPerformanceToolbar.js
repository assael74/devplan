// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamPerformanceToolbar.js

import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { buildTeamPerformanceToolbar } from '../model/teamPerformanceToolbar.model.js'
import { teamPerformanceToolbarSx as sx } from '../sx/teamPerformanceToolbar.sx.js'

function SummaryChip({ item, showChange = false }) {
  return (
    <Chip size='sm' variant='outlined' sx={sx.chip(item)} startDecorator={iconUi({ id: item.iconId, size: 'sm' })}>
      <Box component='span' sx={sx.chipContent}>
        <span>{item.label}</span>
        <strong>{item.value}</strong>
        {showChange ? (
          <Box component='span' aria-label={item.change?.ariaLabel} sx={sx.change(item.change?.color || 'neutral')}>
            {item.change ? iconUi({ id: item.change.iconId, size: 'sm' }) : null}
            {item.change ? item.change.label : 'שינוי —'}
          </Box>
        ) : null}
      </Box>
    </Chip>
  )
}

export default function TeamPerformanceToolbar({ stage, view, toolbarRef }) {
  if (!stage) return null
  const summary = buildTeamPerformanceToolbar(view)
  return (
    <Box ref={toolbarRef} role='region' aria-label='סיכום ביצועי השנתון בגלילה' sx={sx.floating}>
      <Box className='dpScrollThin' sx={sx.row}>
        <Typography sx={sx.season}>{summary.seasonKey}</Typography>
        {summary.kpis.map(item => <SummaryChip key={item.key} item={item} showChange={Boolean(item.change)} />)}
      </Box>
      {stage > 1 ? (
        <Box className='dpScrollThin' sx={[sx.row, sx.secondRow]}>
          {summary.metrics.map(item => <SummaryChip key={item.key} item={item} showChange />)}
        </Box>
      ) : null}
    </Box>
  )
}
