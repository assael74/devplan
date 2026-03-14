import React, { useMemo } from 'react'
import { Box, IconButton, Input, Option, Select, Sheet, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { filtersSx as sx } from '../sx/teamAbilitiesFilters.sx.js'

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

export default function TeamAbilitiesFilters({
  q,
  domainFilter,
  filledFilter,
  domainOptions = [],
  filledOptions = [],
  onChangeQ,
  onChangeDomainFilter,
  onChangeFilledFilter,
  onReset,
}) {
  const isDirty = !!q || domainFilter !== 'all' || filledFilter !== 'all'

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
      <Input
        size="sm"
        placeholder="חיפוש לפי שם יכולת."
        value={q}
        onChange={(e) => onChangeQ(e.target.value)}
        sx={{ flex: 1, minWidth: 220 }}
      />

      <Select
        size="sm"
        value={domainFilter}
        onChange={(e, v) => onChangeDomainFilter(v || 'all')}
        sx={{ minWidth: 180 }}
      >
        {domainOptions.map((o) => (
          <Option key={o.id} value={o.id}>
            {o.label}
          </Option>
        ))}
      </Select>

      <Select
        size="sm"
        value={filledFilter}
        onChange={(e, v) => onChangeFilledFilter(v || 'all')}
        sx={{ minWidth: 150 }}
      >
        {filledOptions.map((o) => (
          <Option key={o.id} value={o.id}>
            {o.label}
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

        <Tooltip title="פתח טופס יכולות חדש">
          <span>
            <IconButton size="sm" variant="outlined" sx={sx.icoAddSx}>
              {iconUi({ id: 'addAbilities', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Sheet>
  )
}
