// domains/team/performance/TeamPerformanceDomainModal.js
import React, { useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Input,
  Sheet,
  Table,
  Typography,
  Select,
  Option,
} from '@mui/joy'
import SearchRounded from '@mui/icons-material/SearchRounded'
import SwapVertRounded from '@mui/icons-material/SwapVertRounded'

import { resolveTeamPerformanceDomain } from './TeamPerformance.domain.logic'
import { teamPerformanceModalSx as sx } from './performance.sx'
import {
  LAYER_ORDER,
  LAYER_LABELS,
  buildLayerIndex,
  buildHaystack,
  sortRows,
  matchByLayer,
  matchByPos,
} from './performanceModal.logic'

const Th = ({ label, active, dir, onClick, align = 'right', width }) => (
  <th style={{ width, textAlign: align, cursor: 'pointer' }} onClick={onClick}>
    <Box sx={sx.thInline}>
      <Typography level="body-xs" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <SwapVertRounded
        fontSize="small"
        style={{
          opacity: active ? 1 : 0.35,
          transform: active && dir === 'desc' ? 'rotate(180deg)' : 'none',
        }}
      />
    </Box>
  </th>
)

export default function TeamPerformanceDomainModal({ items, entity }) {
  const model = useMemo(() => resolveTeamPerformanceDomain(entity, items), [entity, items])
  const { posToLayer, layerToCodes, codeToLabel } = useMemo(buildLayerIndex, [])

  const presentCodes = useMemo(() => {
    const s = new Set()
    model.rows?.forEach((r) => r.positions?.forEach((p) => s.add(p)))
    return s
  }, [model.rows])

  const presentLayers = useMemo(() => {
    const s = new Set()
    presentCodes.forEach((c) => posToLayer[c] && s.add(posToLayer[c]))
    return s
  }, [presentCodes, posToLayer])

  const [q, setQ] = useState('')
  const [onlyUsable, setOnlyUsable] = useState(true)
  const [layerMode, setLayerMode] = useState('all')
  const [posMode, setPosMode] = useState('all')
  const [sortKey, setSortKey] = useState('minutes')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase()
    const base = model.rows.filter((r) => {
      if (onlyUsable && !r.usable) return false
      if (!matchByLayer(r, layerMode, layerToCodes)) return false
      if (!matchByPos(r, posMode)) return false
      if (!search) return true
      return buildHaystack(r).includes(search)
    })
    return sortRows(base, sortKey, sortDir)
  }, [model.rows, q, onlyUsable, layerMode, posMode, sortKey, sortDir, layerToCodes])

  return (
    <Box sx={sx.wrap}>
      {/* KPI */}
      <Sheet variant="soft" sx={sx.kpiSheet}>
        <Box sx={sx.kpiGrid}>
          <Box sx={sx.kpiLeft}>
            <Chip size="sm">שערים: {model.stats.goals}</Chip>
            <Chip size="sm">בישולים: {model.stats.assists}</Chip>
            <Chip size="sm">דקות: {model.stats.minutesPlayed}</Chip>
          </Box>
          <Box sx={sx.kpiRight}>
            <Chip size="sm">{filtered.length}</Chip>
          </Box>
        </Box>
      </Sheet>



      {/* Filters */}
      <Sheet variant="soft" sx={sx.filtersSheet}>
        <Box sx={sx.filtersRow}>
          <SearchRounded fontSize="small" />
          <Input
            size="sm"
            placeholder="חיפוש..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
          />

          <Select size="sm" value={layerMode} onChange={(e, v) => setLayerMode(v || 'all')}>
            <Option value="all">כל קווי המערך</Option>
            {LAYER_ORDER.filter((k) => presentLayers.has(k)).map((k) => (
              <Option key={k} value={`layer:${k}`}>
                {LAYER_LABELS[k]}
              </Option>
            ))}
          </Select>

          <Select size="sm" value={posMode} onChange={(e, v) => setPosMode(v || 'all')}>
            <Option value="all">כל העמדות</Option>
            {[...presentCodes].map((c) => (
              <Option key={c} value={`pos:${c}`}>
                {codeToLabel[c] || c} ({c})
              </Option>
            ))}
          </Select>

          <Chip
            size="sm"
            variant={onlyUsable ? 'solid' : 'soft'}
            onClick={() => setOnlyUsable((p) => !p)}
          >
            {onlyUsable ? 'רק עם נתונים' : 'כולל ללא נתונים'}
          </Chip>
        </Box>
      </Sheet>

      

      {/* Table */}
      <Sheet variant="outlined" sx={sx.tableSheet}>
        <Table size="sm" stickyHeader hoverRow sx={sx.table}>
          <thead>
            <tr>
              <th />
              <Th label="שחקן" active={sortKey === 'name'} dir={sortDir} onClick={() => setSortKey('name')} />
              <Th label="עמדות" active={sortKey === 'positions'} dir={sortDir} onClick={() => setSortKey('positions')} />
              <Th label="משחקים" active={sortKey === 'games'} dir={sortDir} onClick={() => setSortKey('games')} align="center" />
              <Th label="דקות" active={sortKey === 'minutes'} dir={sortDir} onClick={() => setSortKey('minutes')} align="center" />
              <Th label="אחוז משחק" active={sortKey === 'playRate'} dir={sortDir} onClick={() => setSortKey('playRate')} align="center" />
              <Th label="שערים" active={sortKey === 'goals'} dir={sortDir} onClick={() => setSortKey('goals')} align="center" />
              <Th label="בישולים" active={sortKey === 'assists'} dir={sortDir} onClick={() => setSortKey('assists')} align="center" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const ps = r.stats || {}
              return (
                <tr key={r.id}>
                  <td>
                    <Avatar size="sm" src={r.photo || undefined}>
                      {r.initials}
                    </Avatar>
                  </td>

                  <td>{r.name}</td>
                  <td>{r.positions?.join(', ') || '—'}</td>

                  <td style={{ textAlign: 'center' }}>{ps.gamesCount || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{ps.timePlayed || '—'}</td>
                  <td style={{ textAlign: 'center' }}> {ps.playTimeRate ? `${ps.playTimeRate}%` : '—'} </td>
                  <td style={{ textAlign: 'center' }}>{ps.goals || 0}</td>
                  <td style={{ textAlign: 'center' }}>{ps.assists || 0}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  )
}
