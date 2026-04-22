// teamProfile/mobile/modules/abilities/components/insightsDrawer/InsightsBlocks.js

import React from 'react'
import {
  Box,
  Divider,
  Sheet,
  Typography,
  Avatar,
  DialogTitle,
  ModalClose,
  Chip,
} from '@mui/joy'

import JoyStarRatingStatic from '../../../../../../../../ui/domains/ratings/JoyStarRating.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { insightsBlockSx as sx } from './sx/insightsBlock.sx.js'

const c = getEntityColors('teams')

export function StatCard({ title, value, sub, icon }) {
  return (
    <Sheet variant="soft" sx={sx.statCard}>
      <Box sx={sx.statCardHead}>
        <Box sx={sx.iconWrap}>{iconUi({ id: icon, size: 'sm' })}</Box>

        <Typography level="body-md" sx={{ opacity: 0.82, fontWeight: 700, fontSize: 12 }}>
          {title}
        </Typography>

        <Typography level="body-sm" sx={sx.insightValue}>
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

export function InsightMiniCard({
  title,
  value,
  subValue = '',
  ratingValue = 0,
  icon = 'insights',
  avatarText = '',
  accentHex = '',
  valueHex = '',
  endText = '',
}) {
  const tone = accentHex || c.accent
  const valueTone = valueHex || tone

  return (
    <Sheet variant="soft" sx={sx.sheetMiniCard(tone)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
        <Box sx={sx.boxWrap(tone)}>
          {avatarText ? (
            <Typography level="body-xs" sx={{ fontWeight: 700, fontSize: 10 }}>
              {avatarText}
            </Typography>
          ) : (
            iconUi({ id: icon, size: 'sm' })
          )}
        </Box>

        <Typography level="body-sm" sx={sx.typoTitle}>
          {title}
        </Typography>
      </Box>

      <Box sx={sx.boxStar}>
        <JoyStarRatingStatic
          value={Number(ratingValue) || 0}
          size="xs"
          color={valueTone}
          sx={{ direction: 'ltr' }}
        />

        <Typography level="body-xs" sx={sx.typoStar(valueTone)}>
          דירוג {value || '—'}
        </Typography>
      </Box>

      {subValue ? (
        <Typography level="body-xs" sx={sx.typoSub}>
          {subValue}
        </Typography>
      ) : null}
    </Sheet>
  )
}

export function InsightCardsGrid({ items = [], emptyText = 'אין נתונים להצגה' }) {
  if (!items.length) {
    return (
      <Typography level="body-sm" sx={{ opacity: 0.7 }}>
        {emptyText}
      </Typography>
    )
  }

  return (
    <Box sx={sx.boxGrid}>
      {items.map((item) => (
        <InsightMiniCard key={item.id} {...item} />
      ))}
    </Box>
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

export function InsightsDrawerHeader({ entity, isEligible = false }) {
  const src = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.clubName || '',
  })
  const teamName = entity?.teamName || entity?.name || 'קבוצה'

  return (
    <DialogTitle sx={sx.dialTit}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <Avatar src={src} />

        <Box sx={{ ml: 1, minWidth: 0 }}>
          <Typography level="title-md" sx={{ fontWeight: 700 }}>
            {teamName}
          </Typography>

          <Typography
            level="body-sm"
            sx={{ opacity: 0.8 }}
            startDecorator={iconUi({ id: 'insights' })}
          >
            תובנות יכולות קבוצה
          </Typography>
        </Box>

        <Chip
          size="sm"
          color={isEligible ? 'success' : 'warning'}
          variant="soft"
          sx={{ ml: 'auto', mr: 6, mt: -2 }}
        >
          {isEligible ? 'מוכן לתובנות' : 'חסר כיסוי'}
        </Chip>
      </Box>

      <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
    </DialogTitle>
  )
}
