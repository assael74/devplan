import React, { useMemo, useState, useCallback } from 'react'
import { Box, Typography, Sheet, Tooltip, Switch, Chip } from '@mui/joy'

import SectionPanel from '../../../sharedProfile/SectionPanel.js'
import EmptyState from '../../../sharedProfile/EmptyState.js'

import PerformanceStatsSummary from '../../../../../ui/domains/performance/PerformanceStatsSummary.js'

import { FiltersDrawer, FiltersTrigger } from '../../../../../ui/patterns/filters'
import { statsFilterGroups } from '../../../../../shared/performance/filters/statsFilterGroups'
import { getActiveFiltersSummary } from '../../../../../ui/patterns/filters/filters.logic'

import { buildNewFilteredStats } from '../../../../../shared/performance/logic/perf.aggregate.logic.js'
import { statsParm } from '../../../../../shared/stats/statsParmList'
import { iconUi } from '../../../../../ui/core/icons/iconUi'

import { perfModuleSx } from './Performance.sx'

export default function PlayerPerformanceModule({ entity }) {
  const player = entity

  // --- normalize toggle ---
  const [showNormalized, setShowNormalized] = useState(false)

  // --- filters: stats ---
  const [statsFilters, setStatsFilters] = useState({ statsParmType: 'all', type: 'all' })
  const [openStatsFilters, setOpenStatsFilters] = useState(false)

  const gamesRowsForStats = useMemo(() => {
    const rows = Array.isArray(player?.playerGames) ? player.playerGames : []
    const pid = player?.id

    return rows
      .map((g) => {
        const game = g?.game || {}
        const arr = Array.isArray(game.playerStats) ? game.playerStats : []
        const perf = arr.find((x) => x?.playerId === pid)
        if (!perf) return null

        return {
          gameId: g?.gameId || game?.id,
          game: game,
          stats: {
            ...perf,
            timePlayed: g?.stats?.timePlayed ?? perf?.timePlayed ?? null,
            timeVideoStats: perf?.timeVideoStats ?? 0,
            gameDuration: game?.gameDuration ?? null,
          },
        }
      })
      .filter(Boolean)
  }, [player])

  const res = useMemo(
    () =>
      buildNewFilteredStats(gamesRowsForStats, statsParm, statsFilters, {
        statsKey: 'stats',
        recordedMinutesKey: 'timeVideoStats',
        gameDurationKeyInStats: 'gameDuration',
      }),
    [gamesRowsForStats, statsFilters]
  )

  const filteredStatsParm = (res && res.filteredStatsParm) || []
  const filteredStats = (res && res.filteredStats) || []

  const newFullStatsRaw = (res && (res.newFullStatsRaw || res.newFullStats)) || {}
  const newFullStatsNorm = (res && res.newFullStatsNorm) || null

  const statsMeta = (res && res.statsMeta) || {}
  const canNormalize = !!(statsMeta && statsMeta.canNormalize && newFullStatsNorm)

  const shownFullStats = useMemo(() => {
    if (showNormalized && canNormalize) return newFullStatsNorm || newFullStatsRaw
    return newFullStatsRaw
  }, [showNormalized, canNormalize, newFullStatsRaw, newFullStatsNorm])

  const hasSummaryBase = newFullStatsRaw && Object.keys(newFullStatsRaw).length > 0

  const hasActiveStatsFilters = statsFilters.type !== 'all' || statsFilters.statsParmType !== 'all'
  const statsSummary = useMemo(() => getActiveFiltersSummary(statsFilters, statsFilterGroups), [statsFilters])

  const onStatsFilterChange = useCallback((key, value) => {
    setStatsFilters((p) => ({ ...p, [key]: value }))
  }, [])

  const onStatsFilterReset = useCallback(() => {
    setStatsFilters({ statsParmType: 'all', type: 'all' })
  }, [])

  if (!hasSummaryBase) {
    return (
      <SectionPanel>
        <EmptyState title="אין סטטיסטיקה" desc="לא נמצאו נתוני סטטיסטיקה לשחקן." />
      </SectionPanel>
    )
  }

  return (
    <SectionPanel>
      <Box sx={perfModuleSx.root}>
        <Sheet {...perfModuleSx.statsPanel}>
          <Box sx={perfModuleSx.statsHeaderRow}>
            <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography level="title-sm" startDecorator={iconUi({ id: 'stats' })}>
                סטטיסטיקה
              </Typography>

              <Tooltip
                title={statsSummary && statsSummary.count ? `מסונן לפי: ${statsSummary.text}` : 'פילטרים לסטטיסטיקה'}
                placement="bottom"
                variant="solid"
              >
                <Box sx={{ display: 'inline-flex' }}>
                  <FiltersTrigger hasActive={hasActiveStatsFilters} onClick={() => setOpenStatsFilters(true)} />
                </Box>
              </Tooltip>

              <Tooltip
                title={
                  canNormalize
                    ? 'מציג סטטיסטיקה מנורמלת לפי זמן מצולם וזמן משחק מלא'
                    : 'אין זמן מצולם/אין נתונים מתקדמים — לא ניתן לנרמל'
                }
                placement="bottom"
                variant="solid"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Typography level="body-xs">נרמול</Typography>
                  <Switch
                    checked={showNormalized && canNormalize}
                    disabled={!canNormalize}
                    onChange={(e) => setShowNormalized(e.target.checked)}
                  />
                  <Chip size="sm" variant="soft" color={showNormalized && canNormalize ? 'primary' : 'neutral'}>
                    {showNormalized && canNormalize ? 'מנורמל' : 'רגיל'}
                  </Chip>
                </Box>
              </Tooltip>
            </Box>

            <Typography level="body-xs">
              {filteredStats.length} משחקים · {filteredStatsParm.length} פרמטרים
            </Typography>
          </Box>

          <PerformanceStatsSummary fullStats={shownFullStats} statsParm={filteredStatsParm} />
        </Sheet>

        <FiltersDrawer
          open={openStatsFilters}
          onClose={() => setOpenStatsFilters(false)}
          title="פילטרים לסטטיסטיקה"
          filters={statsFilters}
          groups={statsFilterGroups}
          onChange={onStatsFilterChange}
          onReset={onStatsFilterReset}
        />
      </Box>
    </SectionPanel>
  )
}
