// src/features/playersDatabase/ui/pages/leaguePage/sx/leagueKpiOverview.sx.js

import { COLORS, devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const card = {
  minWidth: 0,
  height: 60,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  px: 1.25,
  py: 0,
  font: 'inherit',
  textAlign: 'start',
  cursor: 'pointer',
  border: `1px solid ${devPlanColors.border}`,
  borderRadius: '8px',
  bgcolor: devPlanColors.surface,

  '&:hover': {
    bgcolor: devPlanColors.secondaryLight,
    borderColor: devPlanColors.secondary,
  },

  '&:focus-visible': {
    outline: `2px solid ${devPlanColors.petrol}`,
    outlineOffset: 2,
  },

  '&:disabled': {
    cursor: 'default',
    opacity: 0.6,
  },
}

export const leagueKpiOverviewSx = {
  kpiRow: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
  },

  card,

  selectedCard: {
    borderColor: devPlanColors.petrol,
    bgcolor: devPlanColors.petrolLight,
    boxShadow: `inset 0 0 0 1px ${devPlanColors.petrol}`,

    '&:hover': {
      borderColor: devPlanColors.petrol,
      bgcolor: devPlanColors.petrolLight,
    },
  },

  selectedText: {
    color: devPlanColors.petrolDark,
  },

  text: {
    flex: 1,
    minWidth: 0,
    display: 'grid',
  },

  label: {
    minWidth: 0,
    color: devPlanColors.secondary,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.25,
  },

  caption: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
    lineHeight: 1.25,
    mt: 0.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  value: {
    flexShrink: 0,
    color: devPlanColors.primaryDark,
    fontSize: 26,
    lineHeight: 1,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },

  icon: (tone, selected = false) => ({
    width: 28,
    height: 28,
    boxSizing: 'border-box',
    border: '1px solid',
    borderColor: selected ? 'transparent' : `${COLORS.status[tone].solid}66`,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    bgcolor: selected ? devPlanColors.petrol : COLORS.status[tone].softBg,
    color: selected ? devPlanColors.surface : COLORS.status[tone].text,
  }),
}
