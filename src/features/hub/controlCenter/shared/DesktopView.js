// src/features/hub/controlCenter/shared/DesktopView.js

import React from 'react'
import { Avatar, Box, Button, Sheet, Typography } from '@mui/joy'

import AttentionPanel from './AttentionPanel.js'
import DomainCard from './DomainCard.js'
import KpiRow from './KpiRow.js'
import { devPlanColors, getEntityColors } from '../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

export default function DesktopView({ model, onOpenRoute, emptyText }) {
  if (!model) return null

  const colors = getEntityColors(model.entityType)

  return (
    <Sheet
      variant="outlined"
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        p: 1.75,
        borderRadius: 14,
        borderColor: 'divider',
        bgcolor: 'background.surface',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 12,
          bgcolor: colors.bg,
        }}
      >
        <Avatar
          src={model.avatar}
          alt={model.title}
          sx={{
            width: 64,
            height: 64,
            border: `2px solid ${colors.accent}`,
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-lg" sx={{ fontWeight: 700 }}>
            {model.title}
          </Typography>

          <Typography
            level="body-sm"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
            }}
          >
            {model.subtitle || emptyText}
          </Typography>
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
      </Box>

      <KpiRow items={model.kpis} />

      <AttentionPanel items={model.attentionItems} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1.25,
          pr: 0.25,
        }}
      >
        {model.domains.map((domain) => (
          <DomainCard
            key={domain.id}
            domain={domain}
            onOpen={(item) => onOpenRoute?.(item.route)}
          />
        ))}
      </Box>
    </Sheet>
  )
}
