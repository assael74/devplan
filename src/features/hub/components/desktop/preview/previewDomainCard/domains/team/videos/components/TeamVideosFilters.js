// preview/previewDomainCard/domains/team/videos/components/TeamVideosFilters.js

import React from 'react'
import { Box, Checkbox, IconButton, Input, Option, Select, Sheet, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { filtersSx as sx } from '../sx/teamVideosFilters.sx.js'
import { getMonthLabel } from '../logic/teamVideos.domain.logic.js'

function SelectValue({ label }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Typography level="body-sm" noWrap>
        {label}
      </Typography>
    </Box>
  )
}

export default function TeamVideosFilters({
  q,
  month,
  monthOptions = [],
  onlyTagged,
  onlyKey,
  onChangeQ,
  onChangeMonth,
  onChangeOnlyTagged,
  onChangeOnlyKey,
  onReset,
  onCreateVideo,
}) {
  const isDirty = !!q || month !== 'all' || onlyTagged || onlyKey

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
        <Input
          size="sm"
          placeholder="חיפוש לפי כותרת, שחקן, הערות או תאריך"
          value={q}
          onChange={(e) => onChangeQ(e.target.value)}
          startDecorator={iconUi({ id: 'search', size: 'sm' })}
          sx={sx.searchBoxSx}
        />

        <Select
          size="sm"
          value={month}
          onChange={(e, v) => onChangeMonth(v || 'all')}
          renderValue={(selected) => (
            <SelectValue
              label={selected?.value && selected.value !== 'all' ? getMonthLabel(selected.value) : 'כל החודשים'}
            />
          )}
          sx={sx.selectSx}
        >
          <Option value="all">
            <SelectValue label="כל החודשים" />
          </Option>

          {monthOptions.map((m) => (
            <Option key={m} value={m}>
              <SelectValue label={getMonthLabel(m)} />
            </Option>
          ))}
        </Select>

        <Sheet variant="soft" sx={sx.togglesWrapSx}>
          <Checkbox
            size="sm"
            label="רק מתויגים"
            checked={onlyTagged}
            onChange={(e) => onChangeOnlyTagged(e.target.checked)}
          />
        </Sheet>

        <Tooltip title="איפוס פילטרים">
          <span>
            <IconButton
              disabled={!isDirty}
              size="sm"
              variant="soft"
              sx={sx.icoResSx}
              onClick={onReset}
            >
              {iconUi({ id: 'reset', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="יצירת וידאו חדש">
          <span>
            <IconButton
              size="sm"
              onClick={onCreateVideo}
              sx={sx.icoAddSx}
            >
              {iconUi({ id: 'addVideo', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Sheet>
  )
}
