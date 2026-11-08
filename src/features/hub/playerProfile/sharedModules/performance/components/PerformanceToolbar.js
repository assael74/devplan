// src/features/hub/playerProfile/sharedModules/performance/components/PerformanceToolbar.js

import React from 'react'
import { Box, Button, Input, Option, Select, Tooltip } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { GAME_TYPE } from '../../../../../../shared/games/games.constants.js'
import { PERFORMANCE_VIEWS } from '../../../sharedLogic/performance/performance.metrics.logic.js'
import { performanceSx as sx } from '../performance.sx.js'

export default function PerformanceToolbar({
  view,
  onView,
  filters,
  onFilters,
  target,
  onTarget,
  onReset,
  onShare,
  canShare,
}) {
  const normalized = view === 'normalized' || view === 'compare'
  return (
    <Box sx={sx.toolbar}>
      <Box sx={sx.toolbarTop}>
        <Box sx={sx.tabs} role="group" aria-label="תצוגת ביצועים">
          {PERFORMANCE_VIEWS.map(item => (
            <Button
              key={item.id}
              size="sm"
              variant="plain"
              aria-pressed={view === item.id}
              startDecorator={iconUi({ id: item.icon, size: 'sm' })}
              onClick={() => onView(item.id)}
              sx={sx.tab(view === item.id)}
            >
              {item.label}
            </Button>
          ))}
        </Box>
        <Box sx={sx.actions}>
          {normalized ? (
            <Select
              size="sm"
              value={target}
              onChange={(_, value) => onTarget(value || 'age')}
              aria-label="בסיס הנרמול"
              sx={sx.filter}
            >
              {view !== 'compare' ? <Option value="age">לפי משך המשחק בקבוצת הגיל</Option> : null}
              <Option value="90">נרמול ל־90 דקות</Option>
              <Option value="80">נרמול ל־80 דקות</Option>
            </Select>
          ) : null}
          <Button size="sm" variant="solid" color="success" disabled={!canShare} onClick={onShare} startDecorator={iconUi({ id: 'share', size: 'sm' })}>
            העתקה לוואטסאפ
          </Button>
        </Box>
      </Box>

      <Box sx={sx.filters}>
        <Select
          size="sm" value={filters.type} aria-label="סוג משחק"
          onChange={(_, value) => onFilters({ type: value || 'all' })} sx={sx.filter}
        >
          <Option value="all">כל סוגי המשחקים</Option>
          {GAME_TYPE.map(type => <Option key={type.id} value={type.id}>{type.labelH}</Option>)}
        </Select>
        <Select
          size="sm" value={filters.family} aria-label="משפחת מדדים"
          onChange={(_, value) => onFilters({ family: value || 'all' })} sx={sx.filter}
        >
          <Option value="all">כל המדדים</Option>
          <Option value="offensive">התקפה</Option>
          <Option value="defensive">הגנה</Option>
          <Option value="general">כללי</Option>
        </Select>
        <Input
          size="sm" type="date" value={filters.from} sx={sx.dateFilter}
          onChange={event => onFilters({ from: event.target.value })}
          slotProps={{ input: { 'aria-label': 'מתאריך', max: filters.to || undefined } }}
        />
        <Input
          size="sm" type="date" value={filters.to} sx={sx.dateFilter}
          onChange={event => onFilters({ to: event.target.value })}
          slotProps={{ input: { 'aria-label': 'עד תאריך', min: filters.from || undefined } }}
        />
        <Button size="sm" variant="plain" color="neutral" onClick={onReset} startDecorator={iconUi({ id: 'reset', size: 'sm' })}>
          איפוס
        </Button>
        <Tooltip title="הגדרת יעדים אישיים והשוואה אליהם יתווספו בהמשך">
          <span><Button size="sm" variant="soft" color="neutral" disabled>יעדים אישיים · בהמשך</Button></span>
        </Tooltip>
      </Box>
    </Box>
  )
}
