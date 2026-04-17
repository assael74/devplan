// src/features/players/components/preview/PreviewDomainCard/domains/performance/performanceDomainModal.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, Divider, Input, Sheet, Table, Typography, Select, Option } from '@mui/joy'
import SearchRounded from '@mui/icons-material/SearchRounded'

import { getFullDateIl } from '../../../../../../../../../shared/format/dateUtiles.js'
import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { resolvePerformanceDomain } from './performance.domain.logic'

const safe = (v) => (v == null ? '' : String(v))
const toNum = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

const typeOptions = [
  { id: 'all', label: 'הכל' },
  { id: 'league', label: 'ליגה' },
  { id: 'cup', label: 'גביע' },
  { id: 'friendly', label: 'ידידות' },
  { id: 'training', label: 'אימון' },
]

// ---------- helpers (keep short + foldable) ----------
const normalizeGameType = (game) => safe(game.type).toLowerCase().trim() || 'friendly'

const pickGameLabel = (game) => safe(game.rivel) || '—'

const pickHomeIcon = (game) => {
  const color = game?.home ? '#6aa84f' : '#f44336'
  return iconUi({ id: 'home', sx: { color } })
}

const pickGameDate = (game) => {
  const d = getFullDateIl(game?.gameDate)
  const s = safe(d).trim()
  if (!s) return '—'
  if (s.length >= 10 && s.includes('-')) return s.slice(0, 10)
  return s
}

const extractStatMap = (pg) => pg.stats ?? pg.gameStats.stats ?? pg.gameStats ?? {}

const extractMinutesPlayed = (pg) => {
  const stats = extractStatMap(pg)
  const game = pg?.game || {}

  return toNum(
    stats.timePlayed ??
      stats.minutesPlayed ??
      stats.minutes ??
      game.timePlay ??
      game.minutes ??
      game.duration ??
      game.gameDuration
  )
}

const extractGoals = (pg) => toNum(extractStatMap(pg).goals)
const extractAssists = (pg) => toNum(extractStatMap(pg).assists)

const buildHaystack = (pg) => {
  const game = pg.game
  const stats = extractStatMap(pg)

  return [
    pickGameDate(game),
    pickGameLabel(game),
    normalizeGameType(game),
    safe(game.id),
    safe(game.gameId),
    safe(game.opponent),
    safe(game.rivalName),
    safe(stats.position),
    safe(stats.role),
    safe(stats.notes),
  ]
    .join(' ')
    .toLowerCase()
}
// ---------- end helpers ----------

export default function PlayerPerformanceDomainModal({ items, entity, onClose }) {
  const playerGames = useMemo(() => {
    if (Array.isArray(items) && items.length) return items
    return entity?.playerGames || []
  }, [items, entity])

  const header = useMemo(() => resolvePerformanceDomain(entity), [entity])

  const [q, setQ] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase()
    const tf = safe(typeFilter).toLowerCase().trim()

    return (playerGames || []).filter((pg) => {
      const game = pg?.game || {}
      const gType = normalizeGameType(game)
      if (tf && tf !== 'all' && gType !== tf) return false
      if (!search) return true
      return buildHaystack(pg).includes(search)
    })
  }, [playerGames, q, typeFilter])

  return (
    <Box sx={{ minWidth: 0 }}>
      {/* KPI strip */}
      <Sheet variant="soft" sx={{ p: 1, borderRadius: 'md' }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 0.75,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip size="sm" variant="soft">
              משחקים: {header?.stats?.gamesCount ?? 0}
            </Chip>
            <Chip size="sm" variant="soft" color="success">
              שערים: {header?.stats?.goals ?? 0}
            </Chip>
            <Chip size="sm" variant="soft" color="success">
              בישולים: {header?.stats?.assists ?? 0}
            </Chip>
            <Chip size="sm" variant="soft">
              דקות: {header?.stats?.totalGameTime ?? 0}
            </Chip>
            <Chip
              size="sm"
              variant="soft"
              color={header?.stats?.playTimeRate ? 'primary' : 'neutral'}
            >
              אחוז משחק: {header?.stats?.playTimeRate ?? 0}%
            </Chip>
          </Box>

          <Chip size="sm" variant="soft">
            {filtered.length}
          </Chip>
        </Box>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      {/* Filters */}
      <Sheet variant="soft" sx={{ p: 1, borderRadius: 'md' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <SearchRounded fontSize="small" />

          <Input
            size="sm"
            placeholder="חיפוש לפי יריב / תאריך / תחרות / תפקיד..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <Select
            size="sm"
            value={typeFilter}
            onChange={(e, v) => setTypeFilter(v || 'all')}
            sx={{ minWidth: 160 }}
          >
            {typeOptions.map((o) => (
              <Option key={o.id} value={o.id}>
                {o.label}
              </Option>
            ))}
          </Select>
        </Box>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      {/* Table */}
      <Sheet variant="outlined" sx={{ borderRadius: 'md', overflow: 'auto', maxWidth: '100%' }}>
        <Table
          size="sm"
          stickyHeader
          hoverRow
          sx={{
            minWidth: 940,
            '& th, & td': { whiteSpace: 'nowrap' },
          }}
        >
          <thead>
            <tr>
              <th style={{ width: '20%' }}>תאריך</th>
              <th style={{ width: '20%' }}>משחק</th>
              <th style={{ width: '10%', textAlign: 'right' }}>בית / חוץ</th>
              <th style={{ width: '10%' }}>סוג</th>
              <th style={{ width: '10%' }}>תוצאה</th>
              <th style={{ width: '10%', textAlign: 'center' }}>דקות</th>
              <th style={{ width: '10%', textAlign: 'center' }}>שערים</th>
              <th style={{ width: '10%', textAlign: 'center' }}>בישולים</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((pg, idx) => {
              const game = pg?.game || {}

              const date = pickGameDate(game)
              const label = pickGameLabel(game)
              const homeIcon = pickHomeIcon(game)
              const type = normalizeGameType(game)

              const minutes = extractMinutesPlayed(pg)
              const goals = extractGoals(pg)
              const assists = extractAssists(pg)

              const result = `${game.goalsFor} - ${game.goalsAgainst}`

              return (
                <tr key={safe(pg?.id) || safe(game?.id) || idx}>
                  <td>{date}</td>
                  <td>{label}</td>
                  <td>
                    <Box sx={{ pl: '10px' }}>{homeIcon}</Box>
                  </td>
                  <td>{type}</td>
                  <td>{result}</td>
                  <td style={{ textAlign: 'center' }}>{minutes || '—'}</td>
                  <td style={{ textAlign: 'center' }}>{goals}</td>
                  <td style={{ textAlign: 'center' }}>{assists}</td>
                </tr>
              )
            })}

            {!filtered.length ? (
              <tr>
                <td colSpan={7}>
                  <Typography level="body-sm" sx={{ opacity: 0.7, py: 1 }}>
                    אין נתוני ביצועים להצגה לפי הסינון.
                  </Typography>
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Sheet>
    </Box>
  )
}
