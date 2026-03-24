// src/features/calendar/components/CalendarSelectorPanel.js

import React from 'react'
import { Box, Typography, Chip, Divider, Button, IconButton } from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'

import TeamSelectField from '../../../ui/fields/selectUi/teams/TeamSelectField.js'
import PlayerSelectField from '../../../ui/fields/selectUi/players/PlayerSelectField.js'

export default function CalendarSelectorPanel({
  teams = [],
  players = [],
  selection = {},
  onSelectTeam,
  onSelectPlayer,
  filters = {},
  onFilter,
  resetFilters,
  context
}) {
  const hasSelection = Boolean(selection?.teamId || selection?.playerId)

  const handleResetSelection = () => {
    onSelectTeam('')
    onSelectPlayer('')
  }

  const handleResetFilters = () => {
    resetFilters()
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography level="title-md">בחירת יומן</Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 0.25 }}>
        בחר קבוצה או שחקן כדי למקד את תצוגת היומן
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ mt: 2 }}>
        <TeamSelectField
          label="בחר קבוצה להצגה ביומן"
          value={selection?.teamId || ''}
          onChange={onSelectTeam}
          options={teams}
          context={context}
          placeholder="כל הקבוצות"
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <PlayerSelectField
          label="בחר שחקן להצגה ביומן"
          value={selection?.playerId || ''}
          onChange={onSelectPlayer}
          options={players}
          context={context}
          teamId={selection?.teamId || ''}
          placeholder={selection?.teamId ? 'כל שחקני הקבוצה' : 'בחר שחקן'}
        />
      </Box>

      {hasSelection && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1, }}>
          <Button size="sm" variant="soft" color="neutral" startDecorator={iconUi({id: 'reset'})} onClick={handleResetSelection}>
            נקה בחירה
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 1.25 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography level="title-md">פילטרים</Typography>

        <IconButton size="sm" variant='soft' onClick={handleResetFilters}>{iconUi({id: 'reset'})}</IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1, }}>
        <Chip
          size="sm"
          color={filters?.weekend ? 'success' : 'neutral'}
          variant={filters?.weekend ? 'solid' : 'outlined'}
          startDecorator={iconUi({id: 'weekend'})}
          onClick={() => onFilter({ ...filters, weekend: !filters?.weekend })}
        >
          סופש
        </Chip>

        <Chip
          size="sm"
          color={filters?.weekday ? 'success' : 'neutral'}
          variant={filters?.weekday ? 'solid' : 'outlined'}
          startDecorator={iconUi({id: 'weekday'})}
          onClick={() => onFilter({ ...filters, weekday: !filters?.weekday })}
        >
          אמצע שבוע
        </Chip>

        <Chip
          size="sm"
          color={filters?.games ? 'success' : 'neutral'}
          variant={filters?.games ? 'solid' : 'outlined'}
          startDecorator={iconUi({id: 'games'})}
          onClick={() => onFilter({ ...filters, games: !filters?.games })}
        >
          משחקים
        </Chip>

        <Chip
          size="sm"
          color={filters?.meetings ? 'success' : 'neutral'}
          variant={filters?.meetings ? 'solid' : 'outlined'}
          startDecorator={iconUi({id: 'meetings'})}
          onClick={() => onFilter({ ...filters, meetings: !filters?.meetings })}
        >
          פגישות
        </Chip>

        <Chip
          size="sm"
          color={filters?.trainings ? 'success' : 'neutral'}
          variant={filters?.trainings ? 'solid' : 'outlined'}
          startDecorator={iconUi({id: 'training'})}
          onClick={() => onFilter({ ...filters, trainings: !filters?.trainings})}
        >
          אימונים
        </Chip>
      </Box>
    </Box>
  )
}
