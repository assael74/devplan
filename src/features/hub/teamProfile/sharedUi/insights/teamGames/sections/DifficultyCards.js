// teamProfile/sharedUi/insights/teamGames/sections/DifficultyCards.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { difficultySx as sx } from './sx/difficulty.sx.js'

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

function getDifficultyBriefBucket(brief, id) {
  const metrics = brief?.metrics || {}

  if (metrics?.[id]) return metrics[id]

  const buckets = Array.isArray(metrics?.buckets) ? metrics.buckets : []

  return buckets.find((bucket) => bucket?.id === id) || null
}

function getDifficultyCardColor(item, brief) {
  const bucket = getDifficultyBriefBucket(brief, item?.id)
  const evaluationTone = bucket?.evaluation?.tone

  return normalizeTone(evaluationTone, item?.color || 'neutral')
}

function getDifficultyMetaText(item) {
  return `${item?.points ?? 0}/${item?.maxPoints ?? 0} נק׳ · ${
    item?.games ?? 0
  } משחקים`
}

function getPrimaryTakeaway(brief) {
  const items = Array.isArray(brief?.items) ? brief.items : []

  return (
    items.find((item) => item?.id === 'action_focus') ||
    items.find((item) => item?.type === 'focus') ||
    items.find((item) => item?.type === 'risk') ||
    items.find((item) => item?.type === 'advantage') ||
    null
  )
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

function CurrentDifficultyCard({ data, brief }) {
  const readiness = data?.readiness || {}
  const current = data?.current || {}

  const items = [current?.easy, current?.equal, current?.hard].filter(Boolean)

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
          startDecorator={iconUi({ id: 'difficulty', size: 'sm' })}
        >
          רמת יריבה
        </Chip>
      </Box>

      {readiness?.isCurrentReady ? (
        <Box sx={sx.splitGrid}>
          {items.map((item) => {
            const color = getDifficultyCardColor(item, brief)

            return (
              <Box key={item.id} sx={sx.miniBlock(color)}>
                <Box sx={sx.miniTop}>
                  <Typography level="body-xs" sx={sx.miniTitle}>
                    {item.label}
                  </Typography>

                  {iconUi({ id: item.icon, size: 'sm' })}
                </Box>

                <Typography level="h3" sx={sx.miniValue}>
                  {item.pointsPct ?? 0}%
                </Typography>

                <Typography level="body-xs" sx={sx.subTextBottom}>
                  {getDifficultyMetaText(item)}
                </Typography>
              </Box>
            )
          })}
        </Box>
      ) : (
        <EmptyState
          title="אין מספיק נתוני רמת יריבה"
          text={readiness?.missing?.join(' · ') || 'חסרים משחקים להצגה'}
        />
      )}
    </Sheet>
  )
}

function DifficultyInsightCard({ data, brief }) {
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
    'כאן תוצג תובנה לפי רמת יריבה.'

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
            id:
              takeaway?.type === 'focus'
                ? 'target'
                : insight?.icon || 'insights',
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

function DifficultyProjectionCard({ data }) {
  const projection = data?.projection || {}
  const readiness = data?.readiness || {}
  const color = projection?.color || 'neutral'
  const remaining = projection?.remaining || {}

  return (
    <Sheet variant="soft" sx={sx.card(color)}>
      <Box sx={sx.cardTop}>
        <Typography level="body-sm" sx={sx.cardTitle}>
          תחזית רמת יריבה
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
            נשארו {remaining.easy ?? 0} קל · {remaining.equal ?? 0} שווה ·{' '}
            {remaining.hard ?? 0} קשה
          </Typography>
        </Box>
      ) : (
        <EmptyState
          title="תחזית לא זמינה"
          text={
            readiness?.missing?.length
              ? readiness.missing.join(' · ')
              : 'חסר מידע לחישוב תחזית לפי רמת יריבה'
          }
        />
      )}
    </Sheet>
  )
}

export default function DifficultyCards({ data, brief }) {
  return (
    <Box sx={sx.grid}>
      <CurrentDifficultyCard data={data} brief={brief} />
      <DifficultyInsightCard data={data} brief={brief} />
      <DifficultyProjectionCard data={data} />
    </Box>
  )
}
