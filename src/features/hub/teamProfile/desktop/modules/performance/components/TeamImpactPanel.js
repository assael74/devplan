// src/features/teams/teamProfile/modules/performance/components/TeamImpactPanel.js
import React, { useMemo, useState } from 'react'
import { Avatar, Box, Chip, Sheet, Table, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { getParmKey as getStatsParmKey } from '../../../../../../../shared/performance/logic/perf.statsParm'
import {
  buildPlayersParmCoverage,
  resolveTeamPerformanceDomain,
  LAYER_ORDER,
  LAYER_LABELS,
  buildLayerIndex,
  PRESETS,
  BASE_KEYS,
  COL_W_AVATAR,
  COL_W_NAME,
  COL_W_POS,
  presetMatch,
  getBaseStatKeysByPreset,
  buildTableCols,
  buildRowsForView,
  filterAndSortRows,
  buildDynamicCols
} from '../../../../sharedLogic/performance'

import { teamPerformanceModalSx as sx, buildTableSx } from './performance.sx'
import { initialsFromName, tdInlineStyle, fmtPct } from './performance.table.ui'

import PerformanceFiltersBar from './PerformanceFiltersBar'
import TeamImpactTableHeader from './TeamImpactTableHeader'

export default function TeamImpactPanel(props) {
  const statsParm = props?.statsParm || []
  const preset = props?.preset || 'general'
  const onPresetChange = props?.onPresetChange || (() => {})
  const perPlayer = props?.perPlayer || []
  const viewMode = props?.viewMode || 'raw'
  const minCount = 2

  // פילטרים
  const [q, setQ] = useState('')
  const [onlyUsable, setOnlyUsable] = useState(true)
  const [layerMode, setLayerMode] = useState('all')
  const [posMode, setPosMode] = useState('all')

  // מיון
  const [sortKey, setSortKey] = useState('minutes')
  const [sortDir, setSortDir] = useState('desc')
  const onSort = (nextKey) => {
    if (!nextKey) return
    if (nextKey === sortKey) return setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    setSortKey(nextKey)
    setSortDir('desc')
  }

  const playerRows = useMemo(
    () =>
      (perPlayer || []).map((r) => ({
        id: r.id,
        name: r.name || '—',
        photo: r.photo || null,
        positions: r.positions || [],
        stats: r.stats || {},
        statsNorm: r.statsNorm || null,
        statsMeta: r.statsMeta || {},
        usable: typeof r.usable === 'boolean' ? r.usable : true,
      })),
    [perPlayer]
  )

  const domain = useMemo(() => resolveTeamPerformanceDomain(playerRows), [playerRows])
  const { posToLayer, layerToCodes, codeToLabel } = useMemo(buildLayerIndex, [])

  const rowsForView = useMemo(() => buildRowsForView(domain.rows || [], viewMode), [domain.rows, viewMode])

  const presentCodes = useMemo(() => {
    const s = new Set()
    ;(domain.rows || []).forEach((r) => (r.positions || []).forEach((p) => s.add(p)))
    return s
  }, [domain.rows])

  const presentLayers = useMemo(() => {
    const s = new Set()
    presentCodes.forEach((c) => posToLayer[c] && s.add(posToLayer[c]))
    return s
  }, [presentCodes, posToLayer])

  const filteredRows = useMemo(
    () =>
      filterAndSortRows({
        rows: rowsForView || [],
        q,
        onlyUsable,
        layerMode,
        posMode,
        sortKey,
        sortDir,
        layerToCodes,
      }),
    [rowsForView, q, onlyUsable, layerMode, posMode, sortKey, sortDir, layerToCodes]
  )

  const { availableStatsParm, coverage, playersCount } = useMemo(
    () => buildPlayersParmCoverage({ players: domain.rows, statsParm, minCount }),
    [domain.rows, statsParm, minCount]
  )

  const baseStatKeys = useMemo(() => getBaseStatKeysByPreset(preset), [preset])

  const dynCols = useMemo(
    () =>
      buildDynamicCols({
        availableStatsParm,
        coverage,
        preset,
        getStatsParmKey,
        BASE_KEYS,
        presetMatch,
      }),
    [availableStatsParm, coverage, preset]
  )

  const cols = useMemo(() => buildTableCols({ preset, baseStatKeys, dynCols }), [preset, baseStatKeys, dynCols])

  const tableSx = useMemo(
    () =>
      buildTableSx({
        wAvatar: COL_W_AVATAR,
        wName: COL_W_NAME,
        wPos: COL_W_POS,
        minWidth: 1100,
      }),
    []
  )

  return (
    <Sheet variant="outlined" sx={{ p: 1.25, borderRadius: 'md', minHeight: 0, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Typography level="title-sm" startDecorator={iconUi({ id: 'players' })}>
          ביצועי שחקנים
        </Typography>
        <Chip size="sm" variant="soft">
          {playersCount}/{domain.meta?.playersTotalCount || 0}
        </Chip>
      </Box>

      <Box sx={{ mt: 1, display: 'grid', gap: 1.1, minHeight: 0 }}>
        <PerformanceFiltersBar
          sx={sx}
          q={q}
          setQ={setQ}
          layerMode={layerMode}
          setLayerMode={setLayerMode}
          posMode={posMode}
          setPosMode={setPosMode}
          onlyUsable={onlyUsable}
          setOnlyUsable={setOnlyUsable}
          presentLayers={presentLayers}
          presentCodes={presentCodes}
          layerOrder={LAYER_ORDER}
          layerLabels={LAYER_LABELS}
          codeToLabel={codeToLabel}
        />

        <Sheet variant="outlined" sx={sx.tableSheet}>
          <Table size="sm" stickyHeader hoverRow sx={tableSx}>
            <thead>
              <TeamImpactTableHeader cols={cols} sortKey={sortKey} sortDir={sortDir} onSort={onSort} sx={sx} />
            </thead>

            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id}>
                  {cols.map((c) => {
                    if (c.kind === 'avatar') {
                      return (
                        <td key={c.key} style={tdInlineStyle(c)}>
                          <Avatar size="sm" src={r.photo || undefined}>
                            {initialsFromName(r.name)}
                          </Avatar>
                        </td>
                      )
                    }
                    if (c.kind === 'name') {
                      return (
                        <td key={c.key} style={{ ...tdInlineStyle(c), overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {r.name}
                        </td>
                      )
                    }
                    if (c.kind === 'pos') {
                      return (
                        <td key={c.key} style={tdInlineStyle(c)}>
                          {(r.positions || []).join(', ') || '—'}
                        </td>
                      )
                    }

                    const v = r.stats[c.key]
                    const out = c.isPct ? fmtPct(v) : v ?? '—'
                    return (
                      <td key={c.key} style={tdInlineStyle(c)}>
                        {out}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      </Box>
    </Sheet>
  )
}
