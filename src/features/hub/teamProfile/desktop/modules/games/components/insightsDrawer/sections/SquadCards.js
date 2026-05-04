// teamProfile/modules/games/components/insightsDrawer/sections/SquadCards.js

import React from 'react'
import { Box, Chip, Sheet, Tooltip, Typography } from '@mui/joy'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { squadSx as sx } from './sx/squad.sx.js'

const toneColor = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  primary: 'primary',
  neutral: 'neutral',
}

const statConfigByMetricId = {
  squadScorersRate: {
    statKey: 'goals',
    label: 'שערים',
    emptyText: 'אין כובשים רשומים',
  },
  squadAssistersRate: {
    statKey: 'assists',
    label: 'בישולים',
    emptyText: 'אין מבשלים רשומים',
  },
  squadGoalContributorsRate: {
    statKey: 'goalContributions',
    label: 'מעורבות',
    emptyText: 'אין מעורבים בשערים',
  },
  squadStartersRate: {
    statKey: 'starts',
    label: 'פתיחות',
    emptyText: 'אין שחקני הרכב רשומים',
  },
  squadUsedPlayersRate: {
    statKey: 'appearances',
    label: 'הופעות',
    emptyText: 'אין שחקנים ששולבו',
  },
}

const fallbackInsights = [
  {
    id: 'attacking_involvement',
    label: 'מעורבות התקפית',
    actionLabel: 'המשך בדיקה',
    tone: 'neutral',
    value: '—',
    text: 'כאן תופיע תובנה על פיזור הכובשים, המבשלים והמעורבים בשערים.',
    details: [],
  },
  {
    id: 'lineup_stability',
    label: 'יציבות הרכב',
    actionLabel: 'המשך בדיקה',
    tone: 'neutral',
    value: '—',
    text: 'כאן תופיע תובנה על יציבות ההרכב, עומק הרוטציה ושחקני מפתח.',
    details: [],
  },
  {
    id: 'player_integration',
    label: 'שילוב שחקנים',
    actionLabel: 'המשך בדיקה',
    tone: 'neutral',
    value: '—',
    text: 'כאן תופיע תובנה על כמות השחקנים שמשולבים בפועל לאורך העונה.',
    details: [],
  },
]

const iconByInsightId = {
  attacking_involvement: 'goals',
  lineup_stability: 'lineup',
  player_integration: 'players',
}

const getPlayerStatValue = (player, metricId) => {
  if (metricId === 'squadGoalContributorsRate') {
    return Number(player?.goals || 0) + Number(player?.assists || 0)
  }

  const config = statConfigByMetricId[metricId]

  return Number(player?.[config?.statKey] || 0)
}

const getSortedPlayers = (players = [], metricId) => {
  return Array.isArray(players)
    ? [...players]
        .filter((player) => getPlayerStatValue(player, metricId) > 0)
        .sort((a, b) => {
          const diff =
            getPlayerStatValue(b, metricId) -
            getPlayerStatValue(a, metricId)

          if (diff !== 0) return diff

          return String(a?.playerName || '').localeCompare(
            String(b?.playerName || '')
          )
        })
    : []
}

function getInsightColor(item) {
  return toneColor[item?.tone] || 'neutral'
}

function getInsightItems(brief) {
  const items = Array.isArray(brief?.items) ? brief.items : []

  if (items.length) {
    return items
  }

  return fallbackInsights
}

function EmptyState({ title = 'אין נתונים', text = '' }) {
  return (
    <Box>
      <Typography level="title-sm" sx={sx.emptyTitle}>
        {title}
      </Typography>

      {text ? (
        <Typography level="body-xs" sx={sx.subText}>
          {text}
        </Typography>
      ) : null}
    </Box>
  )
}

function MetricTooltipContent({ item }) {
  const config = statConfigByMetricId[item?.id] || {}
  const players = getSortedPlayers(item?.players, item?.id)

  return (
    <Box sx={sx.tooltipBox}>
      <Box>
        <Typography level="body-sm" sx={sx.tooltipTitle}>
          {item?.title || 'מדד סגל'}
        </Typography>

        <Typography level="body-xs" sx={sx.subText}>
          {item?.display || '—'} · {item?.pct ?? 0}%
        </Typography>
      </Box>

      {players.length > 0 ? (
        <Box sx={sx.tooltipList}>
          {players.map((player) => (
            <Box key={player.playerId} sx={sx.tooltipRow}>
              <Typography level="body-xs" sx={sx.tooltipName}>
                {player.playerName}
              </Typography>

              <Typography level="body-xs" sx={sx.tooltipStat}>
                {getPlayerStatValue(player, item?.id)} {config.label || ''}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography level="body-xs" sx={sx.subText}>
          {config.emptyText || 'אין רשימת שחקנים להצגה'}
        </Typography>
      )}
    </Box>
  )
}

function SquadMetricMini({ item }) {
  return (
    <Tooltip
      arrow
      placement="top"
      variant="soft"
      color="primary"
      sx={{ border: '1px solid', borderColor: 'divider', p: 1 }}
      title={<MetricTooltipContent item={item} />}
    >
      <Box sx={sx.metricMini(item?.color || 'neutral', 1)}>
        <Box sx={sx.miniTitleRow}>
          <Typography level="body-xs" sx={sx.miniTitle}>
            {item.title}
          </Typography>

          {iconUi({
            id: item?.icon || 'info',
            size: 'xs',
          })}
        </Box>

        <Typography level="h3" sx={sx.miniValue}>
          {item.pct}%
        </Typography>

        <Typography level="body-xs" sx={sx.subText}>
          {item.display}
        </Typography>
      </Box>
    </Tooltip>
  )
}

function SquadInsightCard({ item }) {
  const color = getInsightColor(item)
  const details = Array.isArray(item?.details) ? item.details : []

  return (
    <Sheet variant="soft" sx={sx.insightCard}>
      <Box sx={sx.insightTop}>
        <Typography level="body-sm" sx={sx.insightTitle}>
          {item?.label || 'תובנה'}
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={color}
          startDecorator={iconUi({
            id: iconByInsightId[item?.id] || 'insights',
            size: 'sm',
          })}
        >
          {item?.actionLabel || 'המשך בדיקה'}
        </Chip>
      </Box>

      <Box sx={sx.insightBody}>
        <Typography level="h3" sx={sx.insightValue}>
          {item?.value || '—'}
        </Typography>

        <Typography level="body-xs" sx={sx.insightText}>
          {item?.text || 'אין תובנה זמינה כרגע.'}
        </Typography>

        {details.length ? (
          <Dropdown>
            <MenuButton
              size="sm"
              variant="plain"
              color={color}
              sx={sx.detailsButton}
            >
              למה זו ההמלצה?
            </MenuButton>

            <Menu
              placement="bottom"
              size="sm"
              variant="outlined"
              sx={sx.detailsMenu}
            >
              {details.map((detail) => (
                <MenuItem key={detail.id} sx={sx.detailsMenuItem}>
                  <Box sx={sx.detailItem}>
                    <Typography level="body-sm" sx={sx.detailLabel}>
                      {detail.label}
                    </Typography>

                    <Typography level="body-xs" sx={sx.detailText}>
                      {detail.text}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Dropdown>
        ) : (
          <Box />
        )}
      </Box>
    </Sheet>
  )
}

function SquadInsightsRow({ brief }) {
  const items = getInsightItems(brief)

  return (
    <Box sx={sx.insightsRow}>
      {items.map((item) => (
        <SquadInsightCard key={item.id} item={item} />
      ))}
    </Box>
  )
}

function SquadCurrentCard({ data, brief }) {
  const rows = Array.isArray(data?.rows) ? data.rows : []
  const activePlayersCount = Number(data?.activePlayersCount || 0)

  return (
    <Sheet variant="soft" sx={sx.mainCard}>
      <Box sx={sx.top}>
        <Typography level="body-sm" sx={sx.title}>
          מצב הסגל
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={activePlayersCount > 0 ? 'primary' : 'neutral'}
          startDecorator={iconUi({ id: 'teams', size: 'sm' })}
        >
          {activePlayersCount > 0 ? `${activePlayersCount} פעילים` : 'אין סגל'}
        </Chip>
      </Box>

      {rows.length > 0 ? (
        <Box sx={sx.metricsGrid}>
          {rows.map((item) => (
            <SquadMetricMini key={item.id} item={item} />
          ))}
        </Box>
      ) : (
        <EmptyState
          title="אין נתוני סגל להצגה"
          text={data?.emptyText || 'חסרים נתוני שחקנים או משחקים'}
        />
      )}

      <SquadInsightsRow brief={brief} />
    </Sheet>
  )
}

export default function SquadCards({ data, brief }) {
  return (
    <Box sx={sx.grid}>
      <SquadCurrentCard data={data} brief={brief} />
    </Box>
  )
}
