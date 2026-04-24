import React from 'react'
import { Box, Input, Option, Select, Chip, Button } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import PlayerGamesToolbarSelectValue from './PlayerGamesToolbarSelectValue.js'
import PlayerGamesBottomBar from './PlayerGamesBottomBar.js'

import {
  buildToolbarState,
  getHomeOptionColor,
  clearToolbarIndicator,
  safeArray,
} from '../../../../../sharedLogic'

export default function PlayerGamesToolbar({
  summary,
  filters,
  indicators = [],
  options = {},
  onChangeFilters,
  onResetFilters,
  sortBy = 'date',
  sortDirection = 'desc',
  onChangeSortBy,
  onChangeSortDirection,
}) {
  const {
    typeOptions,
    resultOptions,
    homeOptions,
    difficultyOptions,
    totalGames,
    filteredGames,
    hasActiveFilters,
    selectedType,
    selectedResult,
    selectedHome,
    selectedDifficulty,
  } = buildToolbarState({ summary, filters, options, })

  const handleClearIndicator = (item) => {
    clearToolbarIndicator(item, onChangeFilters)
  }

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        <Input
          value={filters?.search || ''}
          onChange={(e) => onChangeFilters({ search: e.target.value })}
          startDecorator={iconUi({ id: 'search' })}
          placeholder="חיפוש לפי יריבה, תוצאה, סוג משחק"
          size="sm"
          sx={{ width: 240, maxWidth: '100%', flexShrink: 0 }}
        />

        <Select
          size="sm"
          value={filters?.typeKey || ''}
          onChange={(_, v) => onChangeFilters({ typeKey: v || '' })}
          sx={{ minWidth: 122, flexShrink: 0 }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <PlayerGamesToolbarSelectValue
              label={selectedType?.label || 'כל סוגי המשחקים'}
              icon={selectedType?.idIcon || 'game'}
              count={selectedType?.count ?? totalGames}
              fixedWidth={{ minWidth: 122 }}
            />
          )}
        >
          <Option value="">
            <PlayerGamesToolbarSelectValue
              label="כל סוגי המשחקים"
              icon="game"
              count={totalGames}
            />
          </Option>

          {typeOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <PlayerGamesToolbarSelectValue
                label={item.label}
                icon={item.idIcon || 'game'}
                count={item.count}
              />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.homeKey || ''}
          onChange={(_, v) => onChangeFilters({ homeKey: v || '' })}
          sx={{ minWidth: 150, flexShrink: 0 }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <PlayerGamesToolbarSelectValue
              label={selectedHome?.label || 'בית / חוץ'}
              icon={selectedHome?.idIcon || 'home'}
              count={selectedHome?.count ?? totalGames}
              color={getHomeOptionColor(selectedHome)}
              fixedWidth={{ minWidth: 150 }}
            />
          )}
        >
          <Option value="">
            <PlayerGamesToolbarSelectValue
              label="בית / חוץ"
              icon="home"
              count={totalGames}
            />
          </Option>

          {homeOptions.map((item) => (
            <Option
              key={item.id || item.value}
              value={item.value || item.id}
              color={getHomeOptionColor(item)}
            >
              <PlayerGamesToolbarSelectValue
                label={item.label}
                icon={item.idIcon || 'home'}
                count={item.count}
              />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.resultKey || ''}
          onChange={(_, v) => onChangeFilters({ resultKey: v || '' })}
          sx={{ minWidth: 156, flexShrink: 0 }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <PlayerGamesToolbarSelectValue
              label={selectedResult?.label || 'כל התוצאות'}
              icon={selectedResult?.idIcon || 'result'}
              count={selectedResult?.count ?? totalGames}
              fixedWidth={{ minWidth: 156, flexShrink: 0 }}
            />
          )}
        >
          <Option value="">
            <PlayerGamesToolbarSelectValue
              label="כל התוצאות"
              icon="result"
              count={totalGames}
            />
          </Option>

          {resultOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <PlayerGamesToolbarSelectValue
                label={item.label}
                icon={item.idIcon || 'result'}
                count={item.count}
              />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filters?.difficultyKey || ''}
          onChange={(_, v) => onChangeFilters({ difficultyKey: v || '' })}
          sx={{ minWidth: 156, flexShrink: 0 }}
          slotProps={{ listbox: { sx: sx.listboxSx } }}
          renderValue={() => (
            <PlayerGamesToolbarSelectValue
              label={selectedDifficulty?.label || 'כל רמות הקושי'}
              icon={selectedDifficulty?.idIcon || 'difficulty'}
              count={selectedDifficulty?.count ?? totalGames}
              fixedWidth={{ minWidth: 156 }}
            />
          )}
        >
          <Option value="">
            <PlayerGamesToolbarSelectValue
              label="כל רמות הקושי"
              icon="difficulty"
              count={totalGames}
            />
          </Option>

          {difficultyOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <PlayerGamesToolbarSelectValue
                label={item.label}
                icon={item.idIcon || 'difficulty'}
                count={item.count}
              />
            </Option>
          ))}
        </Select>

        <Box sx={{ flex: 1 }} />

        <Chip
          size="sm"
          variant="soft"
          color="danger"
          disabled={!hasActiveFilters}
          onClick={onResetFilters}
          startDecorator={iconUi({ id: 'reset' })}
          sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
        >
          איפוס
        </Chip>
      </Box>

      <PlayerGamesBottomBar
        summary={summary}
        indicators={indicators}
        totalGames={totalGames}
        filteredGames={filteredGames}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
        onClearIndicator={handleClearIndicator}
      />
    </Box>
  )
}
