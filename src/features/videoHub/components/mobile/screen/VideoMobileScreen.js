// src/features/videoHub/components/mobile/screen/VideoMobileScreen.js

import React from 'react'
import { Box, Chip, IconButton, Typography } from '@mui/joy'

import { VIDEO_TAB } from '../../../logic/videoHub.model.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import VideoMobileToolbar from '../toolbar/VideoMobileToolbar.js'
import VideoGeneralMobileList from '../lists/VideoGeneralMobileList.js'
import VideoAnalysisMobileList from '../lists/VideoAnalysisMobileList.js'
import { screenSx as sx } from './screen.sx.js'

function getModeMeta(mode) {
  if (mode === VIDEO_TAB.ANALYSIS) {
    return {
      tone: 'analysis',
      iconId: 'videoAnalysis',
      title: 'ניתוחי וידאו',
      subtitle: 'שיוכים מקצועיים, תגים וחיבורים',
      emptyTitle: 'רשימת ניתוחי הווידאו תיבנה כאן',
      emptyText: 'בשלב הבא נחבר כרטיסים, פילטרים, מיון ופעולות לפי ניתוח וידאו.',
      countLabel: 'ניתוחים',
    }
  }

  return {
    tone: 'general',
    iconId: 'videoGeneral',
    title: 'וידאו כללי',
    subtitle: 'ניהול מאגר הסרטונים הכללי',
    emptyTitle: 'אין סרטונים להצגה',
    emptyText: 'לא נמצאו סרטונים שתואמים לסינון הנוכחי.',
    countLabel: 'סרטונים',
  }
}

export default function VideoMobileScreen({
  mode,
  items = [],
  rawItems = [],
  total = 0,
  shown = 0,
  filters,
  sortBy,
  sortDirection,
  onBack,
  onWatch,
  onEdit,
  onShare,
  onDelete,
  onChangeSource,
  onChangeTag,
  onChangeSortBy,
  onChangeSortDirection,
  onResetFilters,
}) {
  const meta = getModeMeta(mode)

  return (
    <Box sx={sx.page}>
      <Box sx={sx.header(meta.tone)}>
        <Box sx={sx.headerTop}>
          <Box sx={sx.titleIcon(meta.tone)}>
            {iconUi({ id: meta.iconId, size: 'lg' })}
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              level="h3"
              noWrap
              sx={{ fontWeight: 950, lineHeight: 1.05, fontSize: '1.12rem' }}
            >
              {meta.title}
            </Typography>

            <Typography level="body-sm" sx={sx.subtitle}>
              {meta.subtitle}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <IconButton
            size="sm"
            variant="soft"
            onClick={onBack}
            sx={sx.backButton(meta.tone)}
          >
            {iconUi({ id: 'forward' })}
          </IconButton>
        </Box>

        <Box sx={sx.kpiRow}>
          <Chip size="sm" variant="soft" sx={sx.kpiChip(meta.tone)}>
            {total} {meta.countLabel}
          </Chip>
        </Box>
      </Box>

      <Box sx={sx.toolbarWrap}>
        <VideoMobileToolbar
          mode={mode}
          items={rawItems}
          filters={filters}
          filteredCount={shown}
          totalCount={total}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onChangeSource={onChangeSource}
          onChangeTag={onChangeTag}
          onChangeSortBy={onChangeSortBy}
          onChangeSortDirection={onChangeSortDirection}
          onResetFilters={onResetFilters}
        />
      </Box>

      <Box sx={sx.content} className="dpScrollThin">
        {mode === VIDEO_TAB.GENERAL ? (
          <VideoGeneralMobileList
            items={items}
            onWatch={onWatch}
            onEdit={onEdit}
            onShare={onShare}
            onDelete={onDelete}
          />
        ) : (
          <VideoAnalysisMobileList
            items={items}
            onWatch={onWatch}
            onEdit={onEdit}
            onShare={onShare}
            onDelete={onDelete}
          />
        )}
      </Box>
    </Box>
  )
}
