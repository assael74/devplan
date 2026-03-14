// // preview/previewDomainCard/domains/team/players/components/TeamPlayersFilters.js

import React from 'react'
import { Box, Chip, Input, Sheet, Switch, Typography, Divider, IconButton, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi'
import { filtterSx as sx } from '../sx/teamPlayersFilters.sx'

export default function TeamPlayersFilters({
  q,
  onlyKey,
  summary,
  minutesBelow = 100,
  onChangeQ,
  onCreatePlayer,
  onChangeOnlyKey,
  onChangeMinutesBelow,
  openCreatePlayer
}) {

  const isDirty = q || onlyKey || minutesBelow !== 100

  const handleReset = () => {
    onChangeQ('')
    onChangeOnlyKey(false)
    onChangeMinutesBelow(100)
  }

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
        <Input
          size="sm"
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          placeholder="חיפוש שחקן לפי שם..."
          startDecorator={iconUi({ id: 'search', size: 'sm' })}
          sx={sx.searchBoxSx}
        />

        <Box sx={sx.toggleBoxSx}>
          <Typography level="body-sm" sx={{ fontWeight: 600 }}>
            רק שחקני מפתח
          </Typography>

          <Switch
            size="sm"
            checked={!!onlyKey}
            onChange={(e) => onChangeOnlyKey(e.target.checked)}
          />
        </Box>

        <Input
          size="sm"
          type="number"
          value={minutesBelow}
          onChange={(e) => {
            const v = e.target.value
            onChangeMinutesBelow(v === '' ? '' : Number(v))
          }}
          slotProps={{
            input: { min: 0, max: 100, style: { textAlign: 'center' }, },
          }}
          startDecorator={
            <>
              <Typography level="body-xs" sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>
                % דקות
              </Typography>
              <Divider orientation="vertical" sx={{ mx: 1 }} />
            </>
          }
          sx={sx.percentInputSx}
        />

        <Tooltip title="איפוס פילטרים">
          <IconButton disabled={!isDirty} size="sm" variant="soft" sx={sx.icoRes} onClick={handleReset}>
            {iconUi({id: 'reset'})}
          </IconButton>
        </Tooltip>

        <Tooltip title="יצירת שחקן חדש">
          <span>
            <IconButton
              size="sm"
              onClick={openCreatePlayer}
              sx={sx.icoAddSx}
            >
              {iconUi({ id: 'addPlayer', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Sheet>
  )
}
