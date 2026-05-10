// teamProfile/modules/games/components/entryDrawer/EntryBulkBar.js

import {
  Box,
  Chip,
  Divider,
  Typography,
  IconButton,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi'

import { entryEditDrawerSx as sx } from './sx/entryEditDrawer.sx.js'

import {
  getGoalsTotal,
  getAssistsTotal,
} from '../../../../../../editLogic/games/entryGames/index.js'

function FilterChip({ active, label, onClick, color = 'primary', icon }) {
  return (
    <Chip
      size="sm"
      variant={active ? 'solid' : 'outlined'}
      color={active ? color : 'neutral'}
      startDecorator={icon ? iconUi({ id: icon }) : null}
      onClick={onClick}
      sx={{ cursor: 'pointer' }}
    >
      {label}
    </Chip>
  )
}

export default function EntryBulkBar({
  isPlayed,
  draft,
  filters,
  onSetFilter,
  onResetFilters,
  onBulkSetOnSquad,
  onBulkResetStats,
}) {
  const rows = draft?.rows || []

  const onSquadTotal = rows.filter((r) => r?.onSquad === true).length
  const onStartTotal = rows.filter((r) => r?.onStart === true).length

  const colorStartChip = onStartTotal === 11 ? 'danger' : 'neutral'

  const goalsTotal = getGoalsTotal(rows)
  const assistsTotal = getAssistsTotal(rows)

  const colorGoalsChip = goalsTotal === draft?.raw?.goalsFor ? 'danger' : 'neutral'
  const colorAssistsChip = assistsTotal === draft?.raw?.goalsFor ? 'danger' : 'neutral'

  const hasActiveFilters =
    filters?.squad !== 'all' ||
    filters?.start !== 'all' ||
    filters?.activeOnly === true

  return (
    <Box sx={sx.bulkBar}>
      <Box sx={sx.bulkBarTop}>
        <Typography level="title-sm" startDecorator={iconUi({ id: 'entry' })}>
          רישום כולל
        </Typography>

        <Box sx={sx.bulkBarActions}>
          <Chip size="md" variant="solid" startDecorator={iconUi({ id: 'isSquad' })}>
            נבחרו לסגל:
            <Typography level="title-sm" sx={{ display: 'inline', ml: 1, color: '#ffffff' }}>
              {onSquadTotal}
            </Typography>
          </Chip>

          <Chip size="md" variant="solid" color={colorStartChip} startDecorator={iconUi({ id: 'isStart' })}>
            נבחרו להרכב:
            <Typography level="title-sm" sx={{ display: 'inline', ml: 1, color: '#ffffff' }}>
              {onStartTotal}
            </Typography>
          </Chip>

          <Chip size="sm" variant="solid" color={colorGoalsChip} startDecorator={iconUi({ id: 'goals' })}>
            שערים:
            <Typography level="title-sm" sx={{ display: 'inline', ml: 1, color: '#ffffff' }}>
              {goalsTotal} / {draft?.raw?.goalsFor || 0}
            </Typography>
          </Chip>

          <Chip size="sm" variant="solid" color={colorAssistsChip} startDecorator={iconUi({ id: 'assists' })}>
            בישולים:
            <Typography level="title-sm" sx={{ display: 'inline', ml: 1, color: '#ffffff' }}>
              {assistsTotal} / {draft?.raw?.goalsFor || 0}
            </Typography>
          </Chip>

          <IconButton
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => onBulkSetOnSquad(false)}
          >
            {iconUi({ id: 'reset' })}
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>

        {!isPlayed && (
          <Typography level="body-xs" color="warning">
            המשחק עדיין לא שוחק ולכן שערים, בישולים וזמן משחק נעולים.
          </Typography>
        )}

        <Divider orientation="vertical" />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <FilterChip
            label="סומנו בסגל"
            color="success"
            active={filters?.squad === 'in'}
            onClick={() => onSetFilter('squad', 'in')}
          />

          <FilterChip
            label="לא סומנו בסגל"
            color="success"
            active={filters?.squad === 'out'}
            onClick={() => onSetFilter('squad', 'out')}
          />

          <FilterChip
            label="סומנו בהרכב"
            color="success"
            active={filters?.start === 'in'}
            onClick={() => onSetFilter('start', 'in')}
          />

          <FilterChip
            label="לא סומנו בהרכב"
            color="warning"
            active={filters?.start === 'out'}
            onClick={() => onSetFilter('start', 'out')}
          />

          <Divider orientation="vertical" />

          <FilterChip
            label="פעילים בלבד"
            color="success"
            icon="active"
            active={filters?.activeOnly === true}
            onClick={() => onSetFilter('activeOnly', true)}
          />

          <Box sx={{ flex: 1 }} />

          <Chip
            size="sm"
            variant="outlined"
            color="danger"
            disabled={hasActiveFilters}
            startDecorator={iconUi({ id: 'reset' })}
            onClick={onResetFilters}
            sx={{ cursor: 'pointer', mr: 'auto' }}
          >
            איפוס
          </Chip>
        </Box>
      </Box>
    </Box>
  )
}
