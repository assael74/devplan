// teamProfile/modules/performance/TeamPerformanceModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel'
import EmptyState from '../../../../sharedProfile/EmptyState'

import TeamImpactPanel from './components/TeamImpactPanel'
import PerformanceKpiControls from './components/PerformanceKpiControls'
import PerformanceStatsSummary from '../../../../../../ui/domains/performance/PerformanceStatsSummary'

import { PRESETS } from './components/performance.table.meta'
import {
  buildTeamPackFromEntity,
  buildPlayersPackFromEntity,
} from './components/logic/teamPerformance.packs.logic'

import { statsParm } from '../../../../../../shared/stats/statsParmList'

export default function TeamPerformanceModule({ entity }) {
  const [preset, setPreset] = useState('general')
  const [viewMode, setViewMode] = useState('raw')
  const [gameType, setGameType] = useState('all')

  const team = entity || {}

  const statsFilters = useMemo(() => {
    const base =
      preset === 'general'
        ? { statsParmType: 'all', type: 'all' }
        : { statsParmType: preset, type: 'all' }

    return {
      ...base,
      type: gameType === 'all' ? 'all' : gameType,
    }
  }, [preset, gameType])

  const teamPack = useMemo(() => buildTeamPackFromEntity(team, statsParm, statsFilters), [team, statsFilters])

  const teamFullStatsForSummary = useMemo(() => {
    const raw = teamPack?.fullStatsRaw || {}
    const norm = teamPack?.fullStatsNorm || null
    const canNormalize = teamPack?.statsMeta?.canNormalize === true

    const base = viewMode === 'norm' && canNormalize ? (norm || raw) : raw

    return {
      ...base,
      recordedMinutesTotal: teamPack?.statsMeta?.recordedMinutesTotal ?? base?.recordedMinutesTotal ?? null,
      recordedCoveragePct: teamPack?.statsMeta?.recordedCoveragePct ?? base?.recordedCoveragePct ?? null,
    }
  }, [teamPack, viewMode])

  const playersPack = useMemo(() => buildPlayersPackFromEntity(team, statsParm, statsFilters), [team, statsFilters])
  const perPlayer = playersPack?.perPlayer || []
  const playersDomain = playersPack?.domain || { meta: {}, rows: [] }

  const hasPlayers = (playersPack?.players || []).length > 0

  return (
    <SectionPanel>
      <Box sx={{ display: 'grid', gap: 1 }}>
        <PerformanceKpiControls
          sx={{
            kpiSheet: { p: 1.25, borderRadius: 'md', width: '100%' },
            kpiGrid: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flexWrap: 'wrap',
            },
            kpiLeft: { display: 'flex', gap: 0.75, flexWrap: 'wrap' },
            kpiRight: { display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' },
          }}
          domain={playersDomain}
          preset={preset}
          onPresetChange={setPreset}
          presets={PRESETS}
          playersCount={playersDomain?.meta?.playersTotalCount || 0}
          viewMode={viewMode}
          setViewMode={setViewMode}
          canNormalizeAny={playersDomain?.meta?.canNormalizeAny === true}
          gameType={gameType}
          setGameType={setGameType}
        />

        {!hasPlayers ? (
          <EmptyState title="אין שחקנים בקבוצה" />
        ) : (
          <>
            <PerformanceStatsSummary
              fullStats={teamFullStatsForSummary}
              statsParm={teamPack?.filteredStatsParm || statsParm}
            />

            <TeamImpactPanel
              team={team}
              statsParm={statsParm}
              perPlayer={perPlayer}
              preset={preset}
              onPresetChange={setPreset}
              viewMode={viewMode}
            />
          </>
        )}
      </Box>
    </SectionPanel>
  )
}
