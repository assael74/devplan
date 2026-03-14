import React, { useMemo } from 'react'
import { Box, IconButton, Input, Option, Select, Sheet, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { MEETING_STATUSES, MEETING_TYPES } from '../../../../../../../../../shared/meetings/meetings.constants.js'
import { filtersSx as sx } from '../sx/playerMeetingsFilters.sx.js'

const homeFreeLabel = (v) => (v == null ? 'all' : String(v))

const findOpt = (options, value) => {
  const id = homeFreeLabel(value)
  return options.find((o) => o.id === id) || options[0] || null
}

function SelectValue({ option, textKey = 'labelH' }) {
  const label = option[textKey] || option?.label || ''

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {option?.idIcon ? iconUi({ id: option.idIcon, size: 'sm' }) : null}
      <Typography level="body-sm" noWrap>
        {label}
      </Typography>
    </Box>
  )
}

const buildTypeOptions = () => [
  { id: 'all', labelH: 'כל הסוגים', idIcon: 'meetings' },
  ...(MEETING_TYPES || []),
]

const buildStatusOptions = () => [
  { id: 'all', labelH: 'כל הסטטוסים', idIcon: 'meetings' },
  ...(MEETING_STATUSES || []),
]

const videoOptions = [
  { id: 'all', label: 'כל הווידאו', idIcon: 'video' },
  { id: 'withVideo', label: 'עם וידאו', idIcon: 'video' },
  { id: 'noVideo', label: 'ללא וידאו', idIcon: 'noVideo' },
]

export default function PlayerMeetingsFilters({
  q,
  typeFilter,
  statusFilter,
  videoFilter,
  onChangeQ,
  onChangeTypeFilter,
  onChangeStatusFilter,
  onChangeVideoFilter,
  onReset,
  onCreateMeeting,
}) {
  const typeOptions = useMemo(buildTypeOptions, [])
  const statusOptions = useMemo(buildStatusOptions, [])

  const isDirty = !!q || typeFilter !== 'all' || statusFilter !== 'all' || videoFilter !== 'all'

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box
        sx={{
          ...sx.filtersTopRowSx,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(220px,1fr) auto auto auto auto auto',
          },
        }}
      >
        <Input
          size="sm"
          placeholder="חיפוש לפי תאריך, מטרה, סוג, סטטוס או הערות"
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          startDecorator={iconUi({ id: 'search', size: 'sm' })}
          sx={sx.searchBoxSx}
        />

        <Select
          size="sm"
          value={typeFilter}
          onChange={(e, v) => onChangeTypeFilter(v || 'all')}
          renderValue={(selected) => (
            <SelectValue option={findOpt(typeOptions, selected?.value)} textKey="labelH" />
          )}
          sx={sx.selectSx}
        >
          {typeOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue option={o} textKey="labelH" />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={statusFilter}
          onChange={(e, v) => onChangeStatusFilter(v || 'all')}
          renderValue={(selected) => (
            <SelectValue option={findOpt(statusOptions, selected?.value)} textKey="labelH" />
          )}
          sx={sx.selectSx}
        >
          {statusOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue option={o} textKey="labelH" />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={videoFilter}
          onChange={(e, v) => onChangeVideoFilter(v || 'all')}
          renderValue={(selected) => (
            <SelectValue option={findOpt(videoOptions, selected?.value)} textKey="label" />
          )}
          sx={sx.selectSmallSx}
        >
          {videoOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue option={o} textKey="label" />
            </Option>
          ))}
        </Select>

        <Tooltip title="איפוס פילטרים">
          <span>
            <IconButton disabled={!isDirty} size="sm" variant="soft" sx={sx.icoRes} onClick={onReset}>
              {iconUi({ id: 'reset', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="יצירת פגישה חדשה">
          <span>
            <IconButton size="sm" variant="outlined" onClick={onCreateMeeting} sx={sx.icoAddSx}>
              {iconUi({ id: 'addMeeting' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Sheet>
  )
}
