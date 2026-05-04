// teamProfile/modules/games/components/insightsDrawer/sections/SourceCompareStrip.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'

const sx = {
  root: {
    display: 'grid',
    gap: 0.35,
    px: 0.25,
    mb: 0.75,
  },

  row: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    flexWrap: 'wrap',
  },

  sourceChip: {
    fontWeight: 700,
    '--Chip-minHeight': '22px',
    '--Chip-paddingInline': '8px',
    fontSize: 11,
  },

  item: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.25,
    color: 'text.secondary',
    fontSize: 12,
    lineHeight: 1.3,
  },

  label: {
    color: 'text.tertiary',
    fontSize: 11,
    lineHeight: 1.3,
    fontWeight: 600,
  },

  value: (mismatch) => ({
    color: mismatch ? 'warning.500' : 'text.primary',
    fontSize: 12,
    lineHeight: 1.3,
    fontWeight: 700,
  }),

  dot: {
    color: 'text.tertiary',
    fontSize: 11,
    lineHeight: 1,
  },
}

const hasValue = (value) => {
  return value !== undefined && value !== null && value !== ''
}

const formatValue = (value, fallback = '—') => {
  if (!hasValue(value)) return fallback
  return String(value)
}

const normalizeCompareValue = (value) => {
  if (!hasValue(value)) return ''
  return String(value)
}

const isDifferent = (teamValue, gamesValue) => {
  return normalizeCompareValue(teamValue) !== normalizeCompareValue(gamesValue)
}

const buildCompareItems = ({ teamSource = {}, gamesSource = {} }) => {
  return [
    {
      id: 'position',
      label: 'מקום',
      teamValue: formatValue(teamSource?.leaguePosition),
      gamesValue: formatValue(teamSource?.leaguePosition),
      isMismatch: false,
    },
    {
      id: 'games',
      label: 'משחקים',
      teamValue: `${formatValue(teamSource?.playedGames, '0')}/${formatValue(teamSource?.totalGames, '0')}`,
      gamesValue: `${formatValue(gamesSource?.playedGames, '0')}/${formatValue(gamesSource?.totalGames, '0')}`,
      isMismatch:
        isDifferent(teamSource?.playedGames, gamesSource?.playedGames) ||
        isDifferent(teamSource?.totalGames, gamesSource?.totalGames),
    },
    {
      id: 'points',
      label: 'נק׳',
      teamValue: formatValue(teamSource?.points, '0'),
      gamesValue: formatValue(gamesSource?.points, '0'),
      isMismatch: isDifferent(teamSource?.points, gamesSource?.points),
    },
    {
      id: 'goals',
      label: 'שערים',
      teamValue: `${formatValue(teamSource?.goalsFor, '0')}-${formatValue(teamSource?.goalsAgainst, '0')}`,
      gamesValue: `${formatValue(gamesSource?.goalsFor, '0')}-${formatValue(gamesSource?.goalsAgainst, '0')}`,
      isMismatch:
        isDifferent(teamSource?.goalsFor, gamesSource?.goalsFor) ||
        isDifferent(teamSource?.goalsAgainst, gamesSource?.goalsAgainst),
    },
  ]
}

function CompareItem({ item, value }) {
  return (
    <Box sx={sx.item}>
      <Typography level="body-xs" component="span" sx={sx.label}>
        {item.label}
      </Typography>

      <Typography
        level="body-xs"
        component="span"
        sx={sx.value(item.isMismatch)}
      >
        {value}
      </Typography>
    </Box>
  )
}

function SourceRow({
  type,
  label,
  icon,
  color,
  items,
}) {
  return (
    <Box sx={sx.row}>
      <Chip
        size="sm"
        variant="soft"
        color={color}
        startDecorator={iconUi({ id: icon, size: 'sm' })}
        sx={sx.sourceChip}
      >
        {label}
      </Chip>

      {items.map((item, index) => {
        const value = type === 'team' ? item.teamValue : item.gamesValue

        return (
          <React.Fragment key={`${type}-${item.id}`}>
            {index > 0 ? (
              <Typography level="body-xs" component="span" sx={sx.dot}>
                ·
              </Typography>
            ) : null}

            <CompareItem item={item} value={value} />
          </React.Fragment>
        )
      })}
    </Box>
  )
}

export default function SourceCompareStrip({
  teamSource = {},
  gamesSource = {},
}) {
  const items = buildCompareItems({
    teamSource,
    gamesSource,
  })

  return (
    <Box sx={sx.root}>
      <SourceRow
        type="team"
        label="קבוצה"
        icon="teams"
        color="primary"
        items={items}
      />

      <SourceRow
        type="games"
        label="משחקים"
        icon="game"
        color="neutral"
        items={items}
      />
    </Box>
  )
}
