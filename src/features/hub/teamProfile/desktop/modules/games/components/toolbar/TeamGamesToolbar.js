// teamProfile/desktop/modules/games/components/toolbar/TeamGamesToolbar.js

import React from 'react'
import { Box, Input, Option, Select, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import TeamGamesBottomBar from './TeamGamesBottomBar.js'
import TeamGamesToolbarSelectValue from './TeamGamesToolbarSelectValue.js'

import {
  buildToolbarState,
  getHomeOptionColor,
  clearToolbarIndicator,
} from './../../../../../sharedLogic/games'

export default function TeamGamesToolbar({
  summary,
  filters,
  sortBy = 'date',
  sortDirection = 'desc',
  indicators = [],
  options = {},
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
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
  } = buildToolbarState({ summary, filters, options })

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
            <TeamGamesToolbarSelectValue
              label={selectedType?.label || 'כל סוגי המשחקים'}
              icon={selectedType?.idIcon || 'game'}
              count={selectedType?.count ?? totalGames}
              fixedWidth={{ minWidth: 122 }}
            />
          )}
        >
          <Option value="">
            <TeamGamesToolbarSelectValue
              label="כל סוגי המשחקים"
              icon="game"
              count={totalGames}
            />
          </Option>

          {typeOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <TeamGamesToolbarSelectValue
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
            <TeamGamesToolbarSelectValue
              label={selectedHome?.label || 'בית / חוץ'}
              icon={selectedHome?.idIcon || 'home'}
              count={selectedHome?.count ?? totalGames}
              color={getHomeOptionColor(selectedHome)}
              fixedWidth={{ minWidth: 150 }}
            />
          )}
        >
          <Option value="">
            <TeamGamesToolbarSelectValue
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
              <TeamGamesToolbarSelectValue
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
            <TeamGamesToolbarSelectValue
              label={selectedResult?.label || 'כל התוצאות'}
              icon={selectedResult?.idIcon || 'result'}
              count={selectedResult?.count ?? totalGames}
              fixedWidth={{ minWidth: 156, flexShrink: 0 }}
            />
          )}
        >
          <Option value="">
            <TeamGamesToolbarSelectValue
              label="כל התוצאות"
              icon="result"
              count={totalGames}
            />
          </Option>

          {resultOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <TeamGamesToolbarSelectValue
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
            <TeamGamesToolbarSelectValue
              label={selectedDifficulty?.label || 'כל רמות הקושי'}
              icon={selectedDifficulty?.idIcon || 'difficulty'}
              count={selectedDifficulty?.count ?? totalGames}
              fixedWidth={{ minWidth: 156 }}
            />
          )}
        >
          <Option value="">
            <TeamGamesToolbarSelectValue
              label="כל רמות הקושי"
              icon="difficulty"
              count={totalGames}
            />
          </Option>

          {difficultyOptions.map((item) => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <TeamGamesToolbarSelectValue
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

      <TeamGamesBottomBar
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
