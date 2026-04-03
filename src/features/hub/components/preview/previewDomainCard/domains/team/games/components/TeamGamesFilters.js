// preview/previewDomainCard/domains/team/games/components/TeamGamesFilters.js

import React, { useMemo } from 'react'
import { Box, IconButton, Input, Option, Select, Sheet, Tooltip, Typography } from '@mui/joy'

import { GAME_TYPE, GAME_DIFFICULTY } from '../../../../../../../../../shared/games/games.constants.js'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { filtersSx as sx } from '../sx/teamGamesFilters.sx.js'

const homeOptions = [
  { id: 'all', label: 'בית/חוץ', idIcon: 'home' },
  { id: 'home', label: 'בית', idIcon: 'home' },
  { id: 'away', label: 'חוץ', idIcon: 'away' },
]

const resultOptions = [
  { id: 'all', label: 'תוצאה', idIcon: 'result' },
  { id: 'win', label: 'ניצחון', idIcon: 'win' },
  { id: 'draw', label: 'תיקו', idIcon: 'draw' },
  { id: 'loss', label: 'הפסד', idIcon: 'loss' },
]

const buildTypeOptions = () => [
  { id: 'all', labelH: 'סוג משחק', idIcon: 'games' },
  ...(GAME_TYPE || []).filter((x) => !x.disabled),
]

const buildDiffOptions = () => [
  { id: 'all', labelH: 'קושי', idIcon: 'difficulty' },
  ...(GAME_DIFFICULTY || []).filter((x) => !x.disabled),
]

const findOpt = (options, value) => {
  const id = value == null ? 'all' : String(value)
  return options.find((o) => o.id === id) || options[0] || null
}

function SelectValue({ option, textKey = 'labelH' }) {
  const label = option[textKey] || option?.label || ''

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {option?.idIcon ? iconUi({ id: option.idIcon, size: 'sm' }) : null}
      <Typography level="body-sm" noWrap sx={{ fontSize: 10 }}>
        {label}
      </Typography>
    </Box>
  )
}

export default function TeamGamesFilters({
  q,
  typeFilter,
  homeFilter,
  resultFilter,
  diffFilter,
  onChangeQ,
  onChangeTypeFilter,
  onChangeHomeFilter,
  onChangeResultFilter,
  onChangeDiffFilter,
  onReset,
  onCreateGame,
}) {
  const typeOptions = useMemo(buildTypeOptions, [])
  const diffOptions = useMemo(buildDiffOptions, [])

  const isDirty =
    !!q ||
    typeFilter !== 'all' ||
    homeFilter !== 'all' ||
    resultFilter !== 'all' ||
    diffFilter !== 'all'

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
        <Box sx={{ flex: '1 1 120px', minWidth: 120 }}>
          <Input
            size="sm"
            placeholder="חיפוש לפי יריב, תאריך, סוג, תוצאה או קושי"
            value={q}
            onChange={(e) => onChangeQ(e.target.value)}
            startDecorator={iconUi({ id: 'search', size: 'sm' })}
            sx={{ minWidth: 0, width: '100%', fontSize: 10 }}
          />
        </Box>

        <Select
          size="sm"
          value={typeFilter}
          onChange={(e, v) => onChangeTypeFilter(v || 'all')}
          renderValue={(selected) => (
            <SelectValue option={findOpt(typeOptions, selected?.value)} textKey="labelH" />
          )}
          sx={{ width: 118, flex: '0 0 118px' }}
        >
          {typeOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue option={o} textKey="labelH" />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={diffFilter}
          onChange={(e, v) => onChangeDiffFilter(v || 'all')}
          renderValue={(selected) => (
            <SelectValue option={findOpt(diffOptions, selected?.value)} textKey="labelH" />
          )}
          sx={{ width: 110, flex: '0 0 110px' }}
        >
          {diffOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue option={o} textKey="labelH" />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={homeFilter}
          onChange={(e, v) => onChangeHomeFilter(v || 'all')}
          renderValue={(selected) => (
            <SelectValue option={findOpt(homeOptions, selected?.value)} textKey="label" />
          )}
          sx={{ width: 98, flex: '0 0 98px' }}
        >
          {homeOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue option={o} textKey="label" />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={resultFilter}
          onChange={(e, v) => onChangeResultFilter(v || 'all')}
          renderValue={(selected) => (
            <SelectValue option={findOpt(resultOptions, selected?.value)} textKey="label" />
          )}
          sx={{ width: 95, flex: '0 0 95px' }}
        >
          {resultOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue option={o} textKey="label" />
            </Option>
          ))}
        </Select>

        <Tooltip title="איפוס פילטרים">
          <span>
            <IconButton
              disabled={!isDirty}
              size="sm"
              variant="soft"
              sx={{ height: 36, width: 36, flexShrink: 0 }}
              onClick={onReset}
            >
              {iconUi({ id: 'reset', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="יצירת משחק חדש">
          <span>
            <IconButton
              size="sm"
              variant="outlined"
              onClick={onCreateGame}
              sx={sx.icoAddSx}
            >
              {iconUi({ id: 'addGame' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Sheet>
  )
}
