// preview/previewDomainCard/domains/player/games/components/PlayerGamesFilters.js

import React, { useMemo } from 'react'
import { Box, Chip, IconButton, Option, Select, Sheet, Tooltip, Typography } from '@mui/joy'

import { GAME_TYPE, GAME_DIFFICULTY } from '../../../../../../../../../../shared/games/games.constants.js'
import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { filtersSx as sx } from '../sx/playerGamesFilters.sx.js'

const homeOptions = [
  { id: 'all', label: 'בית/חוץ', idIcon: 'home', color: 'neutral' },
  { id: 'home', label: 'בית', idIcon: 'home', color: 'success' },
  { id: 'away', label: 'חוץ', idIcon: 'away', color: 'danger' },
]

const resultOptions = [
  { id: 'all', label: 'תוצאה', idIcon: 'result', color: 'neutral' },
  { id: 'win', label: 'ניצחון', idIcon: 'win', color: 'success' },
  { id: 'draw', label: 'תיקו', idIcon: 'draw', color: 'warning' },
  { id: 'loss', label: 'הפסד', idIcon: 'loss', color: 'danger' },
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

const getCount = (countsMap, id) => {
  if (!countsMap) return 0
  if (countsMap[id] === undefined || countsMap[id] === null) return 0

  return countsMap[id]
}

function SelectValue({ option, count, textKey = 'labelH' }) {
  const label = option[textKey] || option?.label || ''

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {option?.idIcon ? iconUi({ id: option.idIcon, size: 'sm' }) : null}

      <Typography level="body-md" noWrap sx={{ fontSize: 12, minWidth: 0, flex: 1 }}>
        {label}
      </Typography>

      <Chip size="sm" variant="soft" color={option.color} sx={{ border: '1px solid', borderColor: 'divider', ml: 0.5 }}>
        {count}
      </Chip>
    </Box>
  )
}

export default function PlayerGamesFilters({
  typeFilter,
  homeFilter,
  resultFilter,
  diffFilter,
  counts,
  isPrivatePlayer = false,
  onChangeTypeFilter,
  onChangeHomeFilter,
  onChangeResultFilter,
  onChangeDiffFilter,
  onReset,
  onAddPlayerToGame,
}) {
  const typeOptions = useMemo(buildTypeOptions, [])
  const diffOptions = useMemo(buildDiffOptions, [])

  const isDirty =
    typeFilter !== 'all' ||
    homeFilter !== 'all' ||
    resultFilter !== 'all' ||
    diffFilter !== 'all'

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
        <Select
          size="sm"
          value={typeFilter}
          onChange={(e, v) => onChangeTypeFilter(v || 'all')}
          renderValue={(selected) => {
            const option = findOpt(typeOptions, selected?.value)
            return (
              <SelectValue
                option={option}
                count={getCount(counts?.type, option?.id || 'all')}
                textKey="labelH"
              />
            )
          }}
          sx={{ minWidth: 0, width: '100%' }}
        >
          {typeOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue
                option={o}
                count={getCount(counts?.type, o.id)}
                textKey="labelH"
              />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={diffFilter}
          onChange={(e, v) => onChangeDiffFilter(v || 'all')}
          renderValue={(selected) => {
            const option = findOpt(diffOptions, selected?.value)
            return (
              <SelectValue
                option={option}
                count={getCount(counts?.diff, option?.id || 'all')}
                textKey="labelH"
              />
            )
          }}
          sx={{ minWidth: 0, width: '100%' }}
        >
          {diffOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue
                option={o}
                count={getCount(counts?.diff, o.id)}
                textKey="labelH"
              />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={homeFilter}
          onChange={(e, v) => onChangeHomeFilter(v || 'all')}
          renderValue={(selected) => {
            const option = findOpt(homeOptions, selected?.value)
            return (
              <SelectValue
                option={option}
                count={getCount(counts?.home, option?.id || 'all')}
                textKey="label"
              />
            )
          }}
          sx={{ minWidth: 0, width: '100%' }}
        >
          {homeOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue
                option={o}
                count={getCount(counts?.home, o.id)}
                textKey="label"
              />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={resultFilter}
          onChange={(e, v) => onChangeResultFilter(v || 'all')}
          renderValue={(selected) => {
            const option = findOpt(resultOptions, selected?.value)
            return (
              <SelectValue
                option={option}
                count={getCount(counts?.result, option?.id || 'all')}
                textKey="label"
              />
            )
          }}
          sx={{ minWidth: 0, width: '100%' }}
        >
          {resultOptions.map((o) => (
            <Option key={o.id} value={o.id}>
              <SelectValue
                option={o}
                count={getCount(counts?.result, o.id)}
                textKey="label"
              />
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

        <Tooltip title={isPrivatePlayer ? 'יצירת משחק חדש' : 'עדכון משחק לשחקן'}>
          <span>
            <IconButton
              size="sm"
              variant="outlined"
              onClick={onAddPlayerToGame}
              sx={sx.icoAddSx}
            >
              {iconUi({ id: 'addGame', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Sheet>
  )
}
