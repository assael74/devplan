// playerProfile/desktop/modules/performance/PlayerPerformanceModule.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel.js'
import EmptyState from '../../../../sharedProfile/EmptyState.js'

import PerformanceToolbar from './components/toolbar/PerformanceToolbar.js'

import {
  INITIAL_PERFORMANCE_FILTERS,
  resolvePlayerPerformanceDomain,
} from './../../../sharedLogic/index.js'

import PerformanceStatsSummary from '../../../../../../ui/domains/performance/PerformanceStatsSummary.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export default function PlayerPerformanceModule({ entity, context }) {
  const livePlayer = useMemo(() => {
    const players = Array.isArray(context?.players) ? context.players : []
    return players.find((p) => p?.id === entity?.id) || entity || null
  }, [context?.players, entity])

  const [filters, setFilters] = useState(INITIAL_PERFORMANCE_FILTERS)

  const domain = useMemo(() => {
    return resolvePlayerPerformanceDomain(livePlayer, filters)
  }, [livePlayer, filters])

  const handleChangeFilters = (patch) => {
    setFilters((prev) => ({
      ...prev,
      ...(patch || {}),
    }))
  }

  const handleResetFilters = () => {
    setFilters(INITIAL_PERFORMANCE_FILTERS)
  }

  const handleClearFilter = (key) => {
    if (key === 'statsParmType') {
      handleChangeFilters({ statsParmType: 'all' })
      return
    }

    if (key === 'type') {
      handleChangeFilters({ type: 'all' })
    }
  }

  const hasGames = (domain?.summary?.gamesCount || 0) > 0

  return (
    <SectionPanel>
      <Box
        sx={{
          position: 'sticky',
          top: -6,
          zIndex: 5,
          display: 'grid',
          gap: 1,
          borderRadius: 12,
          bgcolor: 'background.body',
          mb: 0.5,
          boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
        }}
      >
        <PerformanceToolbar
          domain={domain}
          summary={domain.summary}
          filters={filters}
          indicators={domain.indicators}
          options={domain.options}
          onChangeFilters={handleChangeFilters}
          onResetFilters={handleResetFilters}
          onClearFilter={handleClearFilter}
        />
      </Box>

        {!hasGames ? (
          <Sheet variant="outlined" sx={{ mt: 1, p: 1.25, borderRadius: 16, display: 'grid', gap: 1 }}>
            <EmptyState title="אין נתוני ביצוע" subtitle="לא נמצאו משחקים עם סטטיסטיקה לשחקן." />
          </Sheet>
        ) : (
          <PerformanceStatsSummary
            fullStats={domain.fullStatsRaw}
            statsParm={domain.filteredStatsParm}
          />
        )}
    </SectionPanel>
  )
}
