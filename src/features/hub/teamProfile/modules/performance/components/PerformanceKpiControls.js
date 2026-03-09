// src/features/teams/teamProfile/modules/performance/components/PerformanceKpiControls.js
import React from 'react'
import { Box, Chip, Option, Select, Sheet, Tooltip, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi'
import { GAME_TYPE } from '../../../../../../shared/games/games.constants'

export default function PerformanceKpiControls(props) {
  const {
    sx,
    domain,
    minCount,
    setMinCount,
    preset,
    onPresetChange,
    presets,
    playersCount,
    viewMode,
    setViewMode,
    gameType,
    setGameType,
    canNormalizeAny,
  } = props
  const isViewFiltered = viewMode !== 'raw'
  const isTypeFiltered = gameType !== 'all'
  const isPresetFiltered = preset !== 'general'
  const selectedGameType =
    gameType === 'all'
      ? { id: 'all', labelH: 'כל המשחקים', idIcon: 'games' }
      : (GAME_TYPE || []).find((x) => x?.id === gameType) || { id: gameType, labelH: gameType, idIcon: null }

  return (
    <Sheet variant="soft" sx={sx.kpiSheet}>
      <Box sx={sx.kpiGrid}>
        <Box sx={sx.kpiLeft}>
          <Chip size="sm">שערים: {domain.stats?.goals ?? 0}</Chip>
          <Chip size="sm">בישולים: {domain.stats?.assists ?? 0}</Chip>
          <Chip size="sm">דקות: {domain.stats?.minutesPlayed ?? 0}</Chip>
          <Chip size="sm" variant="soft">
            כיסוי: {Math.round((domain.meta?.coverageRate || 0) * 100)}%
          </Chip>
        </Box>

        <Box sx={sx.kpiRight}>
          <Tooltip title="תצוגה מנורמלת זמינה רק אם יש דקות וידאו + סטטיסטיקה מתקדמת (לפחות לשחקן אחד)">
            <Select
              size="sm"
              value={viewMode}
              onChange={(e, v) => setViewMode(String(v || 'raw'))}
              sx={{ minWidth: 120 }}
            >
              <Option value="raw">גולמי</Option>
              <Option value="norm" disabled={!canNormalizeAny}>
                מנורמל
              </Option>
            </Select>
          </Tooltip>
          <Chip
            size="sm"
            variant={isViewFiltered ? 'solid' : 'soft'}
            endDecorator={iconUi({ id: viewMode === 'norm' ? 'normalize' : 'notNormalize' })}
          />

          <Tooltip title="סוג משחק">
            <Select size="sm" value={gameType} onChange={(e, v) => setGameType(String(v || 'all'))} sx={{ minWidth: 140 }}>
              <Option value="all">
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                  {iconUi({ id: 'games' })}
                  <Typography level="body-sm">כל המשחקים</Typography>
                </Box>
              </Option>
              {(GAME_TYPE || [])
                .filter((x) => !x?.disabled)
                .map((x) => (
                  <Option key={x.id} value={x.id}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                      {x?.idIcon ? iconUi({ id: x.idIcon }) : null}
                      <Typography level="body-sm">{x?.labelH || x?.label || x.id}</Typography>
                    </Box>
                  </Option>
                ))}
            </Select>
          </Tooltip>
          <Chip
            size="sm"
            variant={isTypeFiltered ? 'solid' : 'soft'}
            endDecorator={iconUi({ id: selectedGameType.idIcon })}
          />

          <Tooltip title="סוג פרמטר">
            <Select
              size="sm"
              value={preset}
              onChange={(e, v) => onPresetChange(String(v || 'general'))}
              sx={{ minWidth: 120 }}
            >
              {(presets || []).map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.label}
                </Option>
              ))}
            </Select>
          </Tooltip>
          <Chip
            size="sm"
            variant={isPresetFiltered ? 'solid' : 'soft'}
            endDecorator={iconUi({ id: preset })}
          />

        </Box>
      </Box>
    </Sheet>
  )
}
