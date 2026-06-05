// playerProfile/desktop/modules/performance/PlayerPerformanceModule.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Option,
  Select,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import SectionPanel from '../../../../sharedProfile/desktop/SectionPanel'
import EmptyState from '../../../../sharedProfile/EmptyState'

import { statsParm } from '../../../../../../shared/stats/statsParmList'

const sx = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 1.5,
    flexWrap: 'wrap',
  },

  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    p: 1.25,
    borderRadius: 'lg',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  chips: {
    display: 'flex',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  tableWrap: {
    overflowX: 'auto',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
  },

  code: {
    direction: 'ltr',
    textAlign: 'left',
    fontFamily: 'monospace',
    fontSize: 12,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: 420,
    overflow: 'auto',
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  muted: {
    color: 'text.tertiary',
  },
}

const SYSTEM_KEYS = new Set([
  'id',
  'uid',
  'docId',
  'name',
  'fullName',
  'playerFullName',
  'playerName',
  'photo',
  'avatar',
  'team',
  'club',
  'games',
  'game',
  'meta',
  'stats',
  'advancedStats',
  'statsGameRefs',
  'createdAt',
  'updatedAt',
  'deletedAt',
])

const toNumber = value => {
  const num = Number(value)

  return Number.isFinite(num) ? num : 0
}

const formatValue = value => {
  if (value === null || value === undefined || value === '') return '—'

  if (typeof value === 'number') {
    return Number.isInteger(value) ? value : Math.round(value * 100) / 100
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  return value
}

const formatComplexValue = value => {
  if (Array.isArray(value)) return value.join(', ')

  if (value && typeof value === 'object') {
    return JSON.stringify(value)
  }

  return formatValue(value)
}

const getParmLabel = key => {
  const parm = Array.isArray(statsParm)
    ? statsParm.find(item => item?.id === key)
    : null

  return (
    parm?.statsParmShortName ||
    parm?.statsParmName ||
    key
  )
}

const hasDisplayValue = value => {
  if (value === null || value === undefined || value === '') return false

  if (typeof value === 'number') {
    return Number.isFinite(value) && value !== 0
  }

  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length > 0
  }

  return true
}

const getPlayerName = player => {
  return (
    player?.playerFullName ||
    player?.fullName ||
    player?.name ||
    player?.playerName ||
    player?.id ||
    'שחקן'
  )
}

const getPlayerId = player => {
  return (
    player?.id ||
    player?.playerId ||
    player?.uid ||
    ''
  )
}

const getMeta = source => {
  if (!source || typeof source !== 'object') return {}

  return {
    ...(source?.meta || {}),

    ...(source?.gamesWithStats !== undefined ? {
      gamesWithStats: source.gamesWithStats,
    } : {}),

    ...(source?.timePlayed !== undefined ? {
      timePlayed: source.timePlayed,
    } : {}),

    ...(source?.timeVideoStats !== undefined ? {
      timeVideoStats: source.timeVideoStats,
    } : {}),

    ...(source?.statsGameRefs !== undefined ? {
      statsGameRefs: source.statsGameRefs,
    } : {}),
  }
}

const getFlatStats = source => {
  if (!source || typeof source !== 'object') return {}

  return Object.entries(source).reduce((acc, [key, value]) => {
    if (SYSTEM_KEYS.has(key)) return acc
    if (!hasDisplayValue(value)) return acc

    return {
      ...acc,
      [key]: value,
    }
  }, {})
}

const getStats = source => {
  if (!source || typeof source !== 'object') return {}

  if (source.stats && typeof source.stats === 'object') {
    return source.stats
  }

  return getFlatStats(source)
}

const getStatsEntries = stats => {
  if (!stats || typeof stats !== 'object') return []

  return Object.entries(stats)
    .filter(([, value]) => hasDisplayValue(value))
    .sort(([a], [b]) => a.localeCompare(b))
}

const filterStatsByPreset = ({ entries, preset }) => {
  if (preset === 'all') return entries

  if (preset === 'time') {
    return entries.filter(([key]) => {
      const low = key.toLowerCase()

      return (
        low.includes('time') ||
        low.includes('games') ||
        low.includes('refs')
      )
    })
  }

  if (preset === 'triplets') {
    return entries.filter(([key]) => {
      const low = key.toLowerCase()

      return (
        low.endsWith('total') ||
        low.includes('success') ||
        low.includes('rate')
      )
    })
  }

  return entries.filter(([key]) => {
    const low = key.toLowerCase()

    return !(
      low.includes('time') ||
      low.includes('refs') ||
      low.includes('meta')
    )
  })
}

const buildRows = ({ source, preset }) => {
  const meta = getMeta(source)
  const stats = getStats(source)

  const metaEntries = Object.entries(meta || {})
    .filter(([, value]) => hasDisplayValue(value))
    .sort(([a], [b]) => a.localeCompare(b))

  const statsEntries = filterStatsByPreset({
    entries: getStatsEntries(stats),
    preset,
  })

  const displayEntries = preset === 'time'
    ? metaEntries
    : statsEntries

  return {
    metaEntries,
    statsEntries,
    displayEntries,
  }
}

const getAdvancedStatsSource = player => {
  return (
    player?.advancedStats ||
    player?.privateAdvancedStats ||
    player?.playerAdvancedStats ||
    player?.statsAdvanced ||
    null
  )
}

const hasAdvancedStatsData = source => {
  if (!source || typeof source !== 'object') return false

  const stats = getStats(source)
  const meta = getMeta(source)

  const hasStats = Object.values(stats).some(value => {
    return hasDisplayValue(value)
  })

  const hasMeta = Object.values(meta).some(value => {
    return hasDisplayValue(value)
  })

  return hasStats || hasMeta
}

function DebugToolbar({
  preset,
  setPreset,
  viewMode,
  setViewMode,
}) {
  return (
    <Box sx={sx.toolbar}>
      <Select
        size="sm"
        value={preset}
        onChange={(event, value) => setPreset(value || 'general')}
        sx={{ minWidth: 150 }}
      >
        <Option value="general">כללי</Option>
        <Option value="triplets">Triplets</Option>
        <Option value="time">זמן / refs</Option>
        <Option value="all">הכול</Option>
      </Select>

      <Button
        size="sm"
        variant={viewMode === 'table' ? 'solid' : 'soft'}
        color={viewMode === 'table' ? 'primary' : 'neutral'}
        onClick={() => setViewMode('table')}
      >
        טבלה
      </Button>

      <Button
        size="sm"
        variant={viewMode === 'json' ? 'solid' : 'soft'}
        color={viewMode === 'json' ? 'primary' : 'neutral'}
        onClick={() => setViewMode('json')}
      >
        JSON
      </Button>
    </Box>
  )
}

function StatsTable({ rows }) {
  if (!rows.length) {
    return (
      <Typography level="body-sm" sx={sx.muted}>
        אין נתונים להצגה
      </Typography>
    )
  }

  return (
    <Box sx={sx.tableWrap}>
      <Table size="sm" stickyHeader hoverRow>
        <thead>
          <tr>
            <th style={{ width: 260 }}>שדה</th>
            <th style={{ width: 260 }}>מפתח</th>
            <th>ערך</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(([key, value]) => (
            <tr key={key}>
              <td>{getParmLabel(key)}</td>

              <td style={{ direction: 'ltr', textAlign: 'left' }}>
                {key}
              </td>

              <td style={{ direction: 'ltr', textAlign: 'left' }}>
                {formatComplexValue(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  )
}

function MetaChips({ entries }) {
  if (!entries.length) return null

  return (
    <Box sx={sx.chips}>
      {entries.map(([key, value]) => (
        <Chip key={key} size="sm" variant="soft" color="neutral">
          {key}: {Array.isArray(value) ? value.length : formatValue(value)}
        </Chip>
      ))}
    </Box>
  )
}

function StatsDebugBlock({
  title,
  subtitle,
  source,
  preset,
  viewMode,
}) {
  const { metaEntries, displayEntries } = buildRows({ source, preset })

  return (
    <Sheet variant="outlined" sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Box>
          <Typography level="title-sm">
            {title}
          </Typography>

          {subtitle ? (
            <Typography level="body-xs" color="neutral">
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        <MetaChips entries={metaEntries} />
      </Box>

      <Divider />

      {viewMode === 'json' ? (
        <Box component="pre" sx={sx.code}>
          {JSON.stringify(source || {}, null, 2)}
        </Box>
      ) : (
        <StatsTable rows={displayEntries} />
      )}
    </Sheet>
  )
}

function RawEntityBlock({ player, viewMode }) {
  const keys = Object.keys(player || {}).sort()

  if (viewMode !== 'json') {
    return (
      <Sheet variant="outlined" sx={sx.section}>
        <Box sx={sx.sectionHeader}>
          <Box>
            <Typography level="title-sm">
              מפתחות קיימים על אובייקט השחקן
            </Typography>

            <Typography level="body-xs" color="neutral">
              עוזר לבדוק אם advancedStats הגיע בשם אחר מה־resolver.
            </Typography>
          </Box>

          <Chip size="sm" variant="soft" color="neutral">
            {keys.length} keys
          </Chip>
        </Box>

        <Divider />

        <Box sx={sx.chips}>
          {keys.map(key => (
            <Chip key={key} size="sm" variant="soft" color="neutral">
              {key}
            </Chip>
          ))}
        </Box>
      </Sheet>
    )
  }

  return (
    <StatsDebugBlock
      title="Raw Player Entity"
      subtitle="תצוגת בדיקה מלאה של entity"
      source={player}
      preset="all"
      viewMode="json"
    />
  )
}

export default function PlayerPerformanceModule({ entity }) {
  const [preset, setPreset] = useState('general')
  const [viewMode, setViewMode] = useState('table')

  const player = entity || {}

  const model = useMemo(() => {
    const source = getAdvancedStatsSource(player)
    const meta = getMeta(source)
    const stats = getStats(source)

    return {
      source,
      meta,
      stats,
      playerId: getPlayerId(player),
      playerName: getPlayerName(player),
      hasStats: hasAdvancedStatsData(source),
      gamesWithStats: toNumber(meta?.gamesWithStats),
      timePlayed: toNumber(meta?.timePlayed),
      timeVideoStats: toNumber(meta?.timeVideoStats),
      refsCount: Array.isArray(meta?.statsGameRefs)
        ? meta.statsGameRefs.length
        : 0,
    }
  }, [player])

  if (!model.hasStats) {
    return (
      <SectionPanel>
        <Box sx={sx.root}>
          <Box sx={sx.header}>
            <Box sx={sx.titleBlock}>
              <Typography level="title-md">
                בדיקת סטטיסטיקה מתקדמת
              </Typography>

              <Typography level="body-sm" color="neutral">
                לא נמצא advancedStats מחובר על אובייקט השחקן.
              </Typography>
            </Box>

            <DebugToolbar
              preset={preset}
              setPreset={setPreset}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </Box>

          <EmptyState
            title="אין סטטיסטיקה מתקדמת"
            subtitle="לא נמצאו נתוני entity.advancedStats / privateAdvancedStats / playerAdvancedStats"
          />

          <RawEntityBlock
            player={player}
            viewMode={viewMode}
          />
        </Box>
      </SectionPanel>
    )
  }

  return (
    <SectionPanel>
      <Box sx={sx.root}>
        <Box sx={sx.header}>
          <Box sx={sx.titleBlock}>
            <Typography level="title-md">
              בדיקת סטטיסטיקה מתקדמת
            </Typography>

            <Typography level="body-sm" color="neutral">
              תצוגה זמנית לבדיקת נתוני סטטיסטיקה מתקדמת על פרופיל שחקן.
            </Typography>
          </Box>

          <DebugToolbar
            preset={preset}
            setPreset={setPreset}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </Box>

        <Sheet variant="outlined" sx={sx.section}>
          <Box sx={sx.sectionHeader}>
            <Box>
              <Typography level="title-sm">
                {model.playerName}
              </Typography>

              <Typography level="body-xs" color="neutral">
                {model.playerId || 'ללא playerId'}
              </Typography>
            </Box>

            <Box sx={sx.chips}>
              <Chip size="sm" variant="soft" color="primary">
                משחקים: {model.gamesWithStats}
              </Chip>

              <Chip size="sm" variant="soft" color="neutral">
                refs: {model.refsCount}
              </Chip>

              <Chip size="sm" variant="soft" color="neutral">
                timePlayed: {model.timePlayed}
              </Chip>

              <Chip size="sm" variant="soft" color="neutral">
                timeVideoStats: {model.timeVideoStats}
              </Chip>
            </Box>
          </Box>
        </Sheet>

        <StatsDebugBlock
          title="סטטיסטיקה מתקדמת לשחקן"
          subtitle="מקור: entity.advancedStats או שדה חלופי אם קיים"
          source={model.source}
          preset={preset}
          viewMode={viewMode}
        />

        <RawEntityBlock
          player={player}
          viewMode={viewMode}
        />
      </Box>
    </SectionPanel>
  )
}
