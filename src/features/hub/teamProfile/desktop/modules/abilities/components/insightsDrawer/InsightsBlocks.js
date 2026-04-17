// teamProfile/modules/abilities/components/insightsDrawer/InsightsBlocks.js

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
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import { insightsBlockSx as sx } from './sx/teamAbilities.insightsBlock.sx.js'

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
    <Sheet
      variant="soft"
      sx={{
        p: 1.1,
        borderRadius: 16,
        minHeight: 92,
        bgcolor: `${tone}0d`,
        boxShadow: `
          inset 0 0 0 1px ${tone}28,
          0 6px 16px rgba(15, 23, 42, 0.04)
        `,
        display: 'grid',
        gap: 0.85,
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform .18s ease, box-shadow .18s ease',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          height: 3,
          bgcolor: tone,
          opacity: 0.95,
        },

        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: `
            inset 0 0 0 1px ${tone}38,
            0 10px 22px rgba(15, 23, 42, 0.07)
          `,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            minWidth: 24,
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${tone}18`,
            color: tone,
            boxShadow: `inset 0 0 0 1px ${tone}22`,
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {avatarText ? (
            <Typography level="body-xs" sx={{ fontWeight: 700, fontSize: 10 }}>
              {avatarText}
            </Typography>
          ) : (
            iconUi({ id: icon, size: 'sm' })
          )}
        </Box>

        <Typography
          level="body-sm"
          sx={{
            fontWeight: 700,
            fontSize: 12.5,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 0.35,
          alignContent: 'start',
          minHeight: 34,
        }}
      >
        <JoyStarRatingStatic
          value={Number(ratingValue) || 0}
          size="xs"
          color={valueTone}
          sx={{ direction: 'ltr' }}
        />

        <Typography
          level="body-xs"
          sx={{
            fontWeight: 700,
            fontSize: 11,
            color: valueTone,
            opacity: 0.9,
            lineHeight: 1,
          }}
        >
          דירוג {value || '—'}
        </Typography>
      </Box>

      {subValue ? (
        <Typography
          level="body-xs"
          sx={{
            opacity: 0.8,
            fontSize: 11,
            lineHeight: 1.35,
            fontWeight: 600,
          }}
        >
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
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(5, minmax(0, 1fr))',
        },
        gap: 1,
      }}
    >
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
  const src = entity?.photo || entity?.image || playerImage
  const teamName = entity?.teamName || entity?.name || 'קבוצה'

  return (
    <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
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
