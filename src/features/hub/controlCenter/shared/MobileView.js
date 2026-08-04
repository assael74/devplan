// src/features/hub/controlCenter/shared/MobileView.js

import React from 'react'
import { Avatar, Box, Button, Sheet, Typography } from '@mui/joy'

import AttentionPanel from './AttentionPanel.js'
import DomainCard from './DomainCard.js'
import KpiRow from './KpiRow.js'
import { devPlanColors, getEntityColors } from '../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

export default function MobileView({ model, onBack, onOpenRoute, emptyText }) {
  if (!model) return null

  const colors = getEntityColors(model.entityType)

  return (
    <Sheet
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1.25,
        bgcolor: 'background.body',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.25,
          borderRadius: 12,
          bgcolor: colors.bg,
        }}
      >
        <Button
          size="sm"
          variant="plain"
          onClick={onBack}
          sx={{ minWidth: 34, px: 0.75 }}
        >
          {iconUi({ id: 'back', size: 'small' })}
        </Button>

        <Avatar
          src={model.avatar}
          alt={model.title}
          sx={{
            width: 52,
            height: 52,
            border: `2px solid ${colors.accent}`,
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-md" noWrap sx={{ fontWeight: 700 }}>
            {model.title}
          </Typography>

          <Typography
            level="body-xs"
            noWrap
            sx={{
              mt: 0.25,
              color: 'text.secondary',
            }}
          >
            {model.subtitle || emptyText}
          </Typography>
        </Box>
      </Box>

      <Button
        size="sm"
        variant="solid"
        onClick={() => onOpenRoute?.(model.profileRoute)}
        startDecorator={iconUi({ id: 'profile', size: 'small' })}
        sx={{
          bgcolor: devPlanColors.primary,
          '&:hover': {
            bgcolor: devPlanColors.primaryDark,
          },
        }}
      >
        {model.actionLabel || 'לפרופיל המלא'}
      </Button>

      <KpiRow items={model.kpis} compact={true} />

      <AttentionPanel items={model.attentionItems} />

      <Box
        className="dpScrollThin"
        sx={{
          minHeight: 0,
          display: 'grid',
          gap: 1,
          overflowY: 'auto',
          pb: 1,
        }}
      >
        {model.domains.map((domain) => (
          <DomainCard
            key={domain.id}
            compact={true}
            domain={domain}
            onOpen={(item) => onOpenRoute?.(item.route)}
          />
        ))}
      </Box>
    </Sheet>
  )
}
