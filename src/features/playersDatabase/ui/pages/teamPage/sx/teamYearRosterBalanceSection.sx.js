import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const teamYearRosterBalanceSectionSx = {
  evolutionCounts: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    flexWrap: 'wrap',
    color: devPlanColors.secondary,
    '& p': {
      fontSize: 10.5,
      fontWeight: 700,
    },
  },

  evolutionEmptyValue: {
    color: devPlanColors.secondary,
    fontSize: 11,
  },

  evolutionLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.7,
    flexWrap: 'wrap',
  },

  evolutionLegendColor: color => ({
    width: 8,
    height: 8,
    borderRadius: 99,
    flexShrink: 0,
    bgcolor: color,
  }),

  evolutionLegendItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.3,
    color: devPlanColors.secondary,
    '& p': {
      fontSize: 10,
      fontWeight: 700,
    },
  },

  evolutionTooltip: {
    p: 0.85,
    border: `1px solid ${devPlanColors.primaryDark}`,
    borderRadius: 8,
    bgcolor: devPlanColors.primaryDark,
    color: devPlanColors.surface,
    boxShadow: '0 10px 24px rgba(16, 43, 64, .24)',
  },

  evolutionTooltipColor: color => ({
    width: 9,
    height: 9,
    borderRadius: 99,
    bgcolor: color,
    boxShadow: '0 0 0 2px rgba(255,255,255,.2)',
  }),

  evolutionTooltipContent: {
    display: 'grid',
    gap: 0.25,
    minWidth: 150,
  },

  evolutionTooltipHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    '& p': {
      color: devPlanColors.surface,
      fontSize: 12,
      fontWeight: 900,
    },
  },

  evolutionTooltipMeta: {
    color: devPlanColors.primaryLight,
    fontSize: 10.5,
  },

  evolutionTooltipValue: {
    color: devPlanColors.surface,
    fontSize: 12,
    fontWeight: 800,
  },

  evolutionTotal: {
    color: devPlanColors.primaryDark,
    fontWeight: 900,
  },

  stackedBar: {
    display: 'flex',
    height: 14,
    overflow: 'hidden',
    borderRadius: 99,
    bgcolor: devPlanColors.secondaryLight,
  },

  stackedSegment: ({ width, color }) => ({
    width: `${width}%`,
    minWidth: width ? 4 : 0,
    height: '100%',
    bgcolor: color,
    transition: 'width .16s ease',
    cursor: 'help',
    '&:hover': {
      filter: 'brightness(.82)',
    },
  }),
}
