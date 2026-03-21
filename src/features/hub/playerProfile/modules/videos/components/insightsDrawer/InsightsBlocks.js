// playerProfile/modules/videos/components/insightsDrawer/InsightsBlocks.js

import React from 'react'
import {
  Box,
  Divider,
  Sheet,
  Typography,
  Avatar,
  DialogTitle,
  ModalClose,
} from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'

import { insightsBlockSx as sx } from './sx/playerVideos.insightsBlock.sx.js'
import { InsightRow } from './InsightsRows.js'

const c = getEntityColors('players')

export function StatCard({ title, value, sub, icon }) {
  return (
    <Sheet variant="soft" sx={sx.statCard}>
      <Box sx={sx.statCardHead}>
        <Box sx={sx.iconWrap}>{iconUi({ id: icon, size: 'sm' })}</Box>

        <Typography level="body-md" sx={{ opacity: 0.82, fontWeight: 700, fontSize: 12 }}>
          {title}
        </Typography>

        <Typography level="body-sm" variant="outlined" sx={sx.insightValue}>
          {value}
        </Typography>
      </Box>

      {sub ? (
        <Typography level="body-xs" sx={{ opacity: 0.68 }}>
          {sub}
        </Typography>
      ) : null}
    </Sheet>
  )
}

export function SectionBlock({ title, icon, children, endDecorator = null }) {
  return (
    <Box sx={sx.sectionBlock}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={sx.sectionIcon}>{iconUi({ id: icon })}</Box>

        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        {endDecorator}
      </Box>

      <Divider sx={{ my: 0.1 }} />

      {children}
    </Box>
  )
}

export function InsightsDrawerHeader({ entity }) {
  const src = entity?.photo || playerImage

  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar src={src} />

        <Box sx={{ ml: 2 }}>
          <Typography level="title-md" sx={sx.formNameSx}>
            {entity?.teamName}
          </Typography>

          <Typography
            level="body-sm"
            sx={sx.formNameSx}
            startDecorator={iconUi({ id: 'insights' })}
          >
            תובנות שימוש בוידאו
          </Typography>
        </Box>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}

export function MonthlyInsightsBlock({
  monthLabel,
  items = [],
  emptyText = 'אין נתונים לחודש זה',
}) {
  return (
    <Sheet variant="soft" sx={sx.monthBlock}>
      <Typography level="title-sm" sx={{ fontWeight: 700, fontSize: 12 }}>
        {monthLabel}
      </Typography>

      {!items.length ? (
        <Typography level="body-xs" sx={{ opacity: 0.7 }}>
          {emptyText}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.6 }}>
          {items.map((item) => (
            <InsightRow key={item.id} {...item} />
          ))}
        </Box>
      )}
    </Sheet>
  )
}

export function MonthlyInsightsList({ months = [], emptyText = 'אין נתונים להצגה' }) {
  if (!months.length) {
    return <Typography level="body-sm" sx={{ opacity: 0.7 }}>{emptyText}</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {months.map((month) => (
        <MonthlyInsightsBlock key={month.monthKey} {...month} />
      ))}
    </Box>
  )
}
