// teamProfile/modules/performance/TeamPerformanceModule.js

import React, { useMemo, useState } from 'react'
import { Box } from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel'
import EmptyState from '../../../../sharedProfile/EmptyState'

import {
  PRESETS,
  buildTeamPackFromEntity,
  buildPlayersPackFromEntity,
} from '../../../sharedLogic/performance'

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
        
    </SectionPanel>
  )
}
