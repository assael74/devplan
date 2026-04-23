// teamProfile/mobile/modules/videos/components/insightsDrawer/TeamVideosInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
  InsightsChipsList,
} from '../../../../../../../../ui/patterns/insights'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { buildTeamVideosInsightsViewModel } from '../../../../../sharedLogic/videos'

const c = getEntityColors('teams')

const safeArray = (value) => (Array.isArray(value) ? value : [])

const toNum = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const buildStableId = (item, fallbackPrefix = 'item', index = 0) => {
  return item?.id || item?.key || item?.label || item?.title || `${fallbackPrefix}-${index}`
}

const mapRowToChip = (item, fallbackIcon = 'insights', index = 0) => ({
  id: buildStableId(item, 'row', index),
  label: item?.title || item?.label || item?.name || '',
  value: item?.value ?? item?.count ?? '',
  sub: item?.sub || item?.subValue || item?.subtitle || '',
  icon: item?.icon || fallbackIcon,
  color: item?.color || 'neutral',
})

const flattenMonthlyRowsToChips = (months = [], fallbackIcon = 'calendar') => {
  return safeArray(months).flatMap((month, monthIndex) => {
    const monthLabel =
      month?.label || month?.title || month?.monthLabel || month?.month || `חודש ${monthIndex + 1}`

    const items =
      month?.items ||
      month?.rows ||
      month?.children ||
      month?.values ||
      []

    return safeArray(items).map((item, itemIndex) => ({
      id: `${buildStableId(month, 'month', monthIndex)}-${buildStableId(item, 'item', itemIndex)}`,
      label: item?.title || item?.label || item?.name || monthLabel,
      value: item?.value ?? item?.count ?? '',
      sub: [monthLabel, item?.sub || item?.subValue || item?.subtitle].filter(Boolean).join(' · '),
      icon: item?.icon || fallbackIcon,
      color: item?.color || 'neutral',
    }))
  })
}

const mapMonthlyActivityToChips = (items = []) => {
  return safeArray(items).map((item, index) => ({
    id: buildStableId(item, 'activity', index),
    label: item?.title || item?.label || item?.monthLabel || item?.month || 'חודש',
    value: item?.value ?? item?.count ?? item?.total ?? '',
    sub: item?.sub || item?.subValue || item?.subtitle || '',
    icon: item?.icon || 'calendar',
    color: item?.color || 'primary',
  }))
}

export default function TeamVideosInsightsDrawer({
  open,
  onClose,
  videos,
  tags,
  entity,
  seasonStartYear,
}) {
  const vm = useMemo(() => {
    return buildTeamVideosInsightsViewModel({
      videos,
      tags,
      seasonStartYear,
      tagType: 'analysis',
    })
  }, [videos, tags, seasonStartYear])

  const {
    totals,
    pace,
    monthlyActivity,
    topCategoryRows,
    topTopicRows,
    monthlyCategoryRows,
    monthlyTopicRows,
    title,
    totalVideosSubText,
    paceVideosSubText,
  } = vm || {}

  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name || entity?.club?.clubName,
  })

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={
        <InsightsDrawerHeader
          title={entity?.teamName || entity?.name || ''}
          subtitle="תובנות וידאו קבוצה"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
      <InsightsSection title={title || 'תובנות וידאו'} icon="insights">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          <InsightsStatCard
            title="סה״כ וידאו"
            value={toNum(totals?.totalVideos)}
            sub={totalVideosSubText}
            icon="videoAnalysis"
          />

          <InsightsStatCard
            title="קצב וידאו נכון להיום"
            value={toNum(pace?.avgVideosPerActiveMonth)}
            sub={paceVideosSubText}
            icon="speed"
          />
        </Box>
      </InsightsSection>

      <InsightsSection title="קטגוריות מובילות" icon="parents">
        <InsightsChipsList
          items={safeArray(topCategoryRows).map((item, index) => mapRowToChip(item, 'parents', index))}
          iconFallback="parents"
        />
      </InsightsSection>

      <InsightsSection title="נושאים מובילים" icon="children">
        <InsightsChipsList
          items={safeArray(topTopicRows).map((item, index) => mapRowToChip(item, 'children', index))}
          iconFallback="children"
        />
      </InsightsSection>

      <InsightsSection title="פעילות לפי חודשים" icon="meetingDone">
        <InsightsChipsList
          items={mapMonthlyActivityToChips(monthlyActivity)}
          iconFallback="meetingDone"
        />
      </InsightsSection>

      <InsightsSection title="קטגוריות מובילות לפי חודש" icon="parents">
        <InsightsChipsList
          items={flattenMonthlyRowsToChips(monthlyCategoryRows, 'parents')}
          iconFallback="parents"
        />
      </InsightsSection>

      <InsightsSection title="נושאים מובילים לפי חודש" icon="children">
        <InsightsChipsList
          items={flattenMonthlyRowsToChips(monthlyTopicRows, 'children')}
          iconFallback="children"
        />
      </InsightsSection>

      {!toNum(totals?.totalVideos) ? (
        <Box sx={{ mt: 0.5 }}>
          <Typography level="body-sm" sx={{ opacity: 0.7 }}>
            אין נתוני וידאו להצגה
          </Typography>
        </Box>
      ) : null}
    </InsightsDrawerShell>
  )
}
