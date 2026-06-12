// teamProfile/desktop/modules/games/components/toolbar/TeamGamesToolbar.js

import React from 'react'
import { Box, Button, Chip, Input, Option, Select, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from './sx/toolbar.sx.js'

import TeamGamesBottomBar from './TeamGamesBottomBar.js'
import TeamGamesToolbarSelectValue from './TeamGamesToolbarSelectValue.js'

import {
  buildToolbarState,
  getHomeOptionColor,
  clearToolbarIndicator,
} from './../../../../../sharedLogic/games'

function TeamGamesDeleteSelectionToolbar({
  selectedCount = 0,
  filteredGames = 0,
  onSelectAllVisibleGames,
  onClearGameSelection,
  onExitDeleteSelectionMode,
  onOpenSelectedDelete,
}) {
  const hasSelectedGames = selectedCount > 0
  const deleteLabel = hasSelectedGames
    ? `מחק ${selectedCount} משחקים`
    : 'בחר משחקים למחיקה'

  return (
    <Box sx={sx.deleteSelectionToolbar}>
      <Box sx={sx.deleteSelectionTitle}>
        {iconUi({ id: 'delete' })}

        <Box>
          <Typography level="title-sm" color="danger">
            מצב מחיקת משחקים
          </Typography>

          <Typography level="body-xs" color="neutral">
            {selectedCount
              ? `${selectedCount} משחקים סומנו למחיקה`
              : 'סמן משחקים מהרשימה כדי להמשיך'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Chip
        size="sm"
        variant="soft"
        color={hasSelectedGames ? 'danger' : 'neutral'}
      >
        {selectedCount} נבחרו
      </Chip>

      <Button
        size="sm"
        variant="soft"
        color="neutral"
        disabled={!filteredGames}
        onClick={onSelectAllVisibleGames}
      >
        בחר הכל בתצוגה
      </Button>

      <Button
        size="sm"
        variant="plain"
        color="neutral"
        disabled={!hasSelectedGames}
        onClick={onClearGameSelection}
      >
        נקה בחירה
      </Button>

      <Button
        size="sm"
        variant="plain"
        color="neutral"
        onClick={onExitDeleteSelectionMode}
      >
        ביטול
      </Button>

      <Button
        size="sm"
        color="danger"
        disabled={!hasSelectedGames}
        startDecorator={iconUi({ id: 'delete' })}
        onClick={onOpenSelectedDelete}
      >
        {deleteLabel}
      </Button>
    </Box>
  )
}

export default function TeamGamesToolbar({
  summary,
  filters,
  sortBy = 'date',
  sortDirection = 'desc',
  indicators = [],
  options = {},
  deleteSelectionMode = false,
  selectedGameIds = [],
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
  onChangeSortBy,
  performanceView,
  onChangeSortDirection,
  onChangePerformanceView,
  onEnterDeleteSelectionMode,
  onExitDeleteSelectionMode,
  onSelectAllVisibleGames,
  onClearGameSelection,
  onOpenSelectedDelete,
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

  const selectedCount = selectedGameIds.length

  const handleClearIndicator = item => {
    clearToolbarIndicator(item, onChangeFilters)
  }

  if (deleteSelectionMode) {
    return (
      <Box sx={sx.toolbar}>
        <TeamGamesDeleteSelectionToolbar
          selectedCount={selectedCount}
          filteredGames={filteredGames}
          onSelectAllVisibleGames={onSelectAllVisibleGames}
          onClearGameSelection={onClearGameSelection}
          onExitDeleteSelectionMode={onExitDeleteSelectionMode}
          onOpenSelectedDelete={onOpenSelectedDelete}
        />
      </Box>
    )
  }

  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        <Input
          value={filters?.search || ''}
          onChange={e => onChangeFilters({ search: e.target.value })}
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

          {typeOptions.map(item => (
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

          {homeOptions.map(item => (
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

          {resultOptions.map(item => (
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

          {difficultyOptions.map(item => (
            <Option key={item.id || item.value} value={item.value || item.id}>
              <TeamGamesToolbarSelectValue
                label={item.label}
                icon={item.idIcon || 'difficulty'}
                count={item.count}
              />
            </Option>
          ))}
        </Select>

        <Chip
          size="sm"
          variant={filters?.impactKey === 'positive' ? 'solid' : 'outlined'}
          color={filters?.impactKey === 'positive' ? 'success' : 'neutral'}
          onClick={() => {
            onChangeFilters({
              impactKey: filters?.impactKey === 'positive' ? '' : 'positive',
            })
          }}
          startDecorator={iconUi({ id: 'scoringImpact' })}
          sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
        >
          מדד +
        </Chip>

        <Chip
          size="sm"
          variant={filters?.impactKey === 'negative' ? 'solid' : 'outlined'}
          color={filters?.impactKey === 'negative' ? 'danger' : 'neutral'}
          onClick={() => {
            onChangeFilters({
              impactKey: filters?.impactKey === 'negative' ? '' : 'negative',
            })
          }}
          startDecorator={iconUi({ id: 'scoringImpact' })}
          sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
        >
          מדד -
        </Chip>

        <Chip
          size="sm"
          variant={filters?.onlyPlayed ? 'solid' : 'outlined'}
          color={filters?.onlyPlayed ? 'success' : 'neutral'}
          onClick={() => onChangeFilters({ onlyPlayed: !filters?.onlyPlayed })}
          startDecorator={iconUi({ id: 'upcoming' })}
          sx={{ cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}
        >
          רק שוחקו
        </Chip>

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
        sortBy={sortBy}
        summary={summary}
        indicators={indicators}
        totalGames={totalGames}
        filteredGames={filteredGames}
        sortDirection={sortDirection}
        selectedGameIds={selectedGameIds}
        onChangeSortBy={onChangeSortBy}
        performanceView={performanceView}
        onClearIndicator={handleClearIndicator}
        onChangeSortDirection={onChangeSortDirection}
        onChangePerformanceView={onChangePerformanceView}
        onEnterDeleteSelectionMode={onEnterDeleteSelectionMode}
      />
    </Box>
  )
}
