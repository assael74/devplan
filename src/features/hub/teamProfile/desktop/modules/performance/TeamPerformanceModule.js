// teamProfile/modules/performance/TeamPerformanceModule.js

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
    maxHeight: 360,
    overflow: 'auto',
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  playersWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },

  playerCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    p: 1,
    borderRadius: 'lg',
  },

  playerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  muted: {
    color: 'text.tertiary',
  },
}

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

const getStats = source => {
  return source?.stats || {}
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

const getStatsEntries = stats => {
  if (!stats || typeof stats !== 'object') return []

  return Object.entries(stats)
    .filter(([, value]) => hasDisplayValue(value))
    .sort(([a], [b]) => a.localeCompare(b))
}

const getTeamAdvancedStats = team => {
  return team?.advancedStats || null
}

const hasAdvancedStatsData = advancedStats => {
  if (!advancedStats || typeof advancedStats !== 'object') return false

  const stats = advancedStats?.stats || {}
  const meta = advancedStats?.meta || {}

  const hasStats = Object.values(stats).some(value => {
    return hasDisplayValue(value)
  })

  const hasMeta = Object.values(meta).some(value => {
    return hasDisplayValue(value)
  })

  return hasStats || hasMeta
}

const getPlayersAdvancedStats = team => {
  const players = Array.isArray(team?.players) ? team.players : []

  return players
    .map(player => ({
      playerId: player?.id || player?.playerId || '',
      player,
      source: player?.advancedStats || null,
    }))
    .filter(item => {
      return item.playerId && hasAdvancedStatsData(item.source)
    })
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

function PlayerStatsDebugBlock({
  playerId,
  player,
  source,
  preset,
  viewMode,
}) {
  const name = player?.name || playerId || 'שחקן'
  const meta = getMeta(source)

  const gamesWithStats = toNumber(meta?.gamesWithStats)
  const timePlayed = toNumber(meta?.timePlayed)
  const timeVideoStats = toNumber(meta?.timeVideoStats)

  return (
    <Sheet variant="outlined" sx={sx.playerCard}>
      <Box sx={sx.playerHeader}>
        <Box>
          <Typography level="title-sm">
            {player?.playerFullName}
          </Typography>

          <Typography level="body-xs" color="neutral">
            {playerId}
          </Typography>
        </Box>

        <Box sx={sx.chips}>
          <Chip size="sm" variant="soft" color="primary">
            משחקים: {gamesWithStats}
          </Chip>

          <Chip size="sm" variant="soft" color="neutral">
            timePlayed: {timePlayed}
          </Chip>

          <Chip size="sm" variant="soft" color="neutral">
            timeVideoStats: {timeVideoStats}
          </Chip>
        </Box>
      </Box>

      <StatsDebugBlock
        title="סטטיסטיקה מתקדמת לשחקן"
        subtitle="תצוגת בדיקה בלבד מתוך player.advancedStats"
        source={source}
        preset={preset}
        viewMode={viewMode}
      />
    </Sheet>
  )
}

export default function TeamPerformanceModule({ entity }) {
  const [preset, setPreset] = useState('general')
  const [viewMode, setViewMode] = useState('table')

  const team = entity || {}

  const model = useMemo(() => {
    const teamStats = getTeamAdvancedStats(team)

    const playerEntries = getPlayersAdvancedStats(team)
      .sort((a, b) => {
        const aName = a.player?.name || a.playerId
        const bName = b.player?.name || b.playerId

        return aName.localeCompare(bName)
      })

    return {
      teamStats,
      playerEntries,
      hasTeamStats: Boolean(teamStats && Object.keys(teamStats).length),
      hasPlayerStats: playerEntries.length > 0,
    }
  }, [team])

  if (!model.hasTeamStats && !model.hasPlayerStats) {
    return (
      <SectionPanel>
        <EmptyState
          title="אין סטטיסטיקה מתקדמת"
          subtitle="לא נמצאו נתוני team.advancedStats או team.players[].advancedStats"
        />
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
              תצוגה זמנית לבדיקת שמירה, עדכון ודלתא של סטטיסטיקה קבוצתית ושחקנית.
            </Typography>
          </Box>

          <DebugToolbar
            preset={preset}
            setPreset={setPreset}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </Box>

        {model.hasTeamStats ? (
          <StatsDebugBlock
            title="סטטיסטיקה קבוצתית"
            subtitle="מקור: team.advancedStats"
            source={model.teamStats}
            preset={preset}
            viewMode={viewMode}
          />
        ) : (
          <Sheet variant="outlined" sx={sx.section}>
            <Typography level="title-sm">
              סטטיסטיקה קבוצתית
            </Typography>

            <Typography level="body-sm" sx={sx.muted}>
              לא נמצא team.advancedStats
            </Typography>
          </Sheet>
        )}

        <Box sx={sx.playersWrap}>
          <Box sx={sx.sectionHeader}>
            <Typography level="title-sm">
              סטטיסטיקה לפי שחקנים
            </Typography>

            <Chip size="sm" variant="soft" color="neutral">
              {model.playerEntries.length} שחקנים עם נתונים
            </Chip>
          </Box>

          {model.hasPlayerStats ? (
            model.playerEntries.map(({ playerId, player, source }) => (
              <PlayerStatsDebugBlock
                key={playerId}
                playerId={playerId}
                player={player}
                source={source}
                preset={preset}
                viewMode={viewMode}
              />
            ))
          ) : (
            <Sheet variant="outlined" sx={sx.section}>
              <Typography level="body-sm" sx={sx.muted}>
                לא נמצאו נתוני player.advancedStats על שחקני הקבוצה.
              </Typography>
            </Sheet>
          )}
        </Box>
      </Box>
    </SectionPanel>
  )
}
