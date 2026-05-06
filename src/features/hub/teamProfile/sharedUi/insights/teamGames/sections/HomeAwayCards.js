// teamProfile/sharedUi/insights/teamGames/sections/HomeAwayCards.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { homeAwaySx as sx } from './sx/homeAway.sx.js'

const toneColor = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  primary: 'primary',
  neutral: 'neutral',
}

function normalizeTone(value, fallback = 'neutral') {
  return toneColor[value] || fallback
}

function getVenueEvaluation(brief, key) {
  return brief?.metrics?.evaluation[key] || null
}

function getVenueCardColor(item, brief, key) {
  const evaluationTone = getVenueEvaluation(brief, key)?.tone

  return normalizeTone(evaluationTone, item?.color || 'neutral')
}

function getVenueMetaText(item) {
  return `${item?.points ?? 0}/${item?.maxPoints ?? 0} נק׳ · ${
    item?.games ?? 0
  } משחקים`
}

function getPrimaryTakeaway(brief) {
  const items = Array.isArray(brief?.items) ? brief.items : []

  const byPriority = [
    (item) => item?.id === 'action_focus',
    (item) => item?.type === 'focus',
    (item) => item?.type === 'risk',
    (item) => item?.type === 'advantage',
  ]

  for (const predicate of byPriority) {
    const match = items.find(predicate)

    if (match) return match
  }

  return null
}

function getMenuItems(items, primaryTakeaway) {
  if (!Array.isArray(items)) return []

  const primary = primaryTakeaway
    ? {
        ...primaryTakeaway,
        menuId: `${primaryTakeaway.id || primaryTakeaway.type}-primary`,
        isPrimary: true,
      }
    : null

  const rest = items
    .filter((item) => item?.id !== primaryTakeaway?.id)
    .map((item) => ({
      ...item,
      menuId: item.id || item.type || item.label,
      isPrimary: false,
    }))

  return [primary, ...rest].filter(Boolean)
}

function EmptyState({ title = 'אין נתונים', text = '' }) {
  return (
    <Box sx={sx.cardBody}>
      <Typography level="title-sm" sx={sx.emptyTitle}>
        {title}
      </Typography>

      <Box />

      {text ? (
        <Typography level="body-xs" sx={sx.subTextBottom}>
          {text}
        </Typography>
      ) : null}
    </Box>
  )
}

function CurrentVenueCard({ data, brief }) {
  const readiness = data?.readiness || {}
  const home = data?.current?.home || {}
  const away = data?.current?.away || {}

  const homeColor = getVenueCardColor(home, brief, 'home')
  const awayColor = getVenueCardColor(away, brief, 'away')

  return (
    <Sheet variant="soft" sx={sx.currentCard}>
      <Box sx={sx.cardTop}>
        <Typography level="body-sm" sx={sx.cardTitle}>
          מצב עד עכשיו
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={readiness?.isCurrentReady ? 'primary' : 'neutral'}
          startDecorator={iconUi({ id: 'home', size: 'sm' })}
        >
          בית / חוץ
        </Chip>
      </Box>

      {readiness?.isCurrentReady ? (
        <Box sx={sx.splitGrid}>
          <Box sx={sx.miniBlock(homeColor)}>
            <Box sx={sx.miniTop}>
              <Typography level="body-xs" sx={sx.miniTitle}>
                בית
              </Typography>

              {iconUi({ id: 'home', size: 'sm' })}
            </Box>

            <Typography level="h3" sx={sx.miniValue}>
              {home?.pointsPct ?? 0}%
            </Typography>

            <Typography level="body-xs" sx={sx.subTextBottom}>
              {getVenueMetaText(home)}
            </Typography>
          </Box>

          <Box sx={sx.miniBlock(awayColor)}>
            <Box sx={sx.miniTop}>
              <Typography level="body-xs" sx={sx.miniTitle}>
                חוץ
              </Typography>

              {iconUi({ id: 'away', size: 'sm' })}
            </Box>

            <Typography level="h3" sx={sx.miniValue}>
              {away?.pointsPct ?? 0}%
            </Typography>

            <Typography level="body-xs" sx={sx.subTextBottom}>
              {getVenueMetaText(home)}
            </Typography>
          </Box>
        </Box>
      ) : (
        <EmptyState
          title="אין מספיק נתוני בית / חוץ"
          text={readiness?.missing?.join(' · ') || 'חסרים משחקים להצגה'}
        />
      )}
    </Sheet>
  )
}

function HomeAwayInsightCard({ data, brief }) {
  const insight = data?.insight || {}
  const takeaway = getPrimaryTakeaway(brief)
  const items = Array.isArray(brief?.items) ? brief.items : []
  const menuItems = getMenuItems(items, takeaway)

  const color =
    toneColor[takeaway?.tone] ||
    insight?.color ||
    brief?.tone ||
    'neutral'

  const label = takeaway?.label || insight?.title || 'תובנה'

  const text =
    takeaway?.text ||
    insight?.text ||
    'כאן תוצג תובנה על פערי בית וחוץ.'

  return (
    <Sheet sx={sx.insightCard}>
      <Box sx={sx.cardTop}>
        <Typography level="body-sm" sx={sx.cardTitle}>
          תובנה
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={color}
          startDecorator={iconUi({
            id: takeaway?.type === 'focus' ? 'target' : insight?.icon || 'insights',
            size: 'sm',
          })}
        >
          {label}
        </Chip>
      </Box>

      <Box sx={sx.cardBody}>
        <Typography level="title-sm" sx={sx.emptyTitle}>
          {label}
        </Typography>

        <Typography level="body-xs" sx={sx.subTextBottom}>
          {text}
        </Typography>

        {menuItems.length ? (
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
              {menuItems.map((item) => (
                <MenuItem key={item.menuId} sx={sx.detailsMenuItem}>
                  <Box sx={{ display: 'grid', gap: 0.2, minWidth: 0 }}>
                    <Typography
                      level="body-sm"
                      sx={{
                        fontWeight: item.isPrimary ? 700 : 600,
                        lineHeight: 1.25,
                        color: item.isPrimary ? 'text.primary' : 'text.secondary',
                      }}
                    >
                      {item.isPrimary ? `${item.label} · עיקר התובנה` : item.label}
                    </Typography>

                    <Typography
                      level="body-xs"
                      sx={{ color: 'text.secondary', lineHeight: 1.45 }}
                    >
                      {item.text}
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

function HomeAwayProjectionCard({ data }) {
  const projection = data?.projection || {}
  const readiness = data?.readiness || {}
  const color = projection?.color || 'neutral'

  return (
    <Sheet variant="soft" sx={sx.card(color)}>
      <Box sx={sx.cardTop}>
        <Typography level="body-sm" sx={sx.cardTitle}>
          תחזית בית / חוץ
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={projection?.isReady ? color : 'neutral'}
          startDecorator={iconUi({ id: 'projection', size: 'sm' })}
        >
          {projection?.isReady ? 'מוכן' : 'חסר מידע'}
        </Chip>
      </Box>

      {projection?.isReady ? (
        <Box sx={sx.cardBody}>
          <Typography level="h3" sx={sx.mainValue}>
            {projection?.level?.rankRangeLabel || projection?.title || '—'}
          </Typography>

          <Box />

          <Typography level="body-xs" sx={sx.subTextBottom}>
            {projection?.text || ''}
            {projection?.text ? ' · ' : ''}
            נשארו {projection?.remainingHomeGames ?? 0} בית ·{' '}
            {projection?.remainingAwayGames ?? 0} חוץ
          </Typography>
        </Box>
      ) : (
        <EmptyState
          title="תחזית לא זמינה"
          text={
            readiness?.missing?.length
              ? readiness.missing.join(' · ')
              : 'חסר מידע לחישוב תחזית לפי בית / חוץ'
          }
        />
      )}
    </Sheet>
  )
}

export default function HomeAwayCards({ data, brief }) {
  return (
    <Box sx={sx.grid}>
      <CurrentVenueCard data={data} brief={brief} />
      <HomeAwayInsightCard data={data} brief={brief} />
      <HomeAwayProjectionCard data={data} />
    </Box>
  )
}
