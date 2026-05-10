// teamProfile/sharedUi/insights/teamGames/layout/SourceCompareStrip.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { compareSx as sx } from './sx/compare.sx'

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
      icon: 'position',
      teamValue: formatValue(teamSource?.leaguePosition),
      gamesValue: formatValue(teamSource?.leaguePosition),
      isMismatch: false,
    },
    {
      id: 'games',
      label: 'משחקים',
      icon: 'games',
      teamValue: `${formatValue(teamSource?.playedGames, '0')}/${formatValue(teamSource?.totalGames, '0')}`,
      gamesValue: `${formatValue(gamesSource?.playedGames, '0')}/${formatValue(gamesSource?.totalGames, '0')}`,
      isMismatch:
        isDifferent(teamSource?.playedGames, gamesSource?.playedGames) ||
        isDifferent(teamSource?.totalGames, gamesSource?.totalGames),
    },
    {
      id: 'points',
      label: 'נק׳',
      icon: 'points',
      teamValue: formatValue(teamSource?.points, '0'),
      gamesValue: formatValue(gamesSource?.points, '0'),
      isMismatch: isDifferent(teamSource?.points, gamesSource?.points),
    },
    {
      id: 'goals',
      label: 'שערים',
      icon: 'goals',
      teamValue: `${formatValue(teamSource?.goalsFor, '0')}-${formatValue(teamSource?.goalsAgainst, '0')}`,
      gamesValue: `${formatValue(gamesSource?.goalsFor, '0')}-${formatValue(gamesSource?.goalsAgainst, '0')}`,
      isMismatch:
        isDifferent(teamSource?.goalsFor, gamesSource?.goalsFor) ||
        isDifferent(teamSource?.goalsAgainst, gamesSource?.goalsAgainst),
    },
  ]
}

function CompareItem({ item, value, isMobile }) {
  return (
    <Box sx={sx.item}>
      {!isMobile ? (
        <Typography level="body-xs" component="span" sx={sx.label}>
          {item.label}
        </Typography>
      ) : (
        iconUi({id: item.icon})
      )}

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
  isMobile
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

            <CompareItem item={item} value={value} isMobile={isMobile} />
          </React.Fragment>
        )
      })}
    </Box>
  )
}

export default function SourceCompareStrip({ teamSource = {}, gamesSource = {}, isMobile }) {
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
        isMobile={isMobile}
      />

      <SourceRow
        type="games"
        label="משחקים"
        icon="game"
        color="neutral"
        items={items}
        isMobile={isMobile}
      />
    </Box>
  )
}
