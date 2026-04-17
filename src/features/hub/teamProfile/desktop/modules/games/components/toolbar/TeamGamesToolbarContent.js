import React from 'react'
import { Box, Input, Option, Select, Chip, Button } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { teamGamesToolbarSx as sx } from '../../sx/teamGames.toolbar.sx.js'

import TeamGamesToolbarSelectValue from './TeamGamesToolbarSelectValue.js'
import TeamGamesToolbarFilterChip from './TeamGamesToolbarFilterChip.js'
import {
  buildToolbarState,
  getHomeOptionColor,
  clearToolbarIndicator,
  safeArray,
} from './teamGames.toolbar.utils.js'

export default function TeamGamesToolbarContent({
  summary,
  filters,
  indicators = [],
  options = {},
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
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

        <Box sx={{ flex: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <Button
            size="sm"
            variant="solid"
            startDecorator={iconUi({ id: 'insights' })}
            onClick={onOpenInsights}
            sx={sx.createBtn}
          >
            תובנות
          </Button>
        </Box>
      </Box>

      <Box sx={sx.toolbarBottom}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Chip
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={iconUi({ id: 'game' })}
          >
            {filteredGames} / {totalGames} משחקים
          </Chip>

          {!!summary?.playedGames && (
            <Chip
              size="sm"
              variant="soft"
              color="success"
              startDecorator={iconUi({ id: 'done' })}
            >
              {summary.playedGames} שוחקו
            </Chip>
          )}

          {!!summary?.upcomingGames && (
            <Chip
              size="sm"
              variant="soft"
              color="warning"
              startDecorator={iconUi({ id: 'calendar' })}
            >
              {summary.upcomingGames} עתידיים
            </Chip>
          )}

          {!!safeArray(indicators).length && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {safeArray(indicators).map((item) => (
                <TeamGamesToolbarFilterChip
                  key={item.id || item.type}
                  item={item}
                  onClear={handleClearIndicator}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
