// teamProfile/sharedUi/insights/teamGames/sections/sx/squadOffense.sx.js

import { accordionDetailsClasses } from '@mui/joy/AccordionDetails';
import { accordionSummaryClasses } from '@mui/joy/AccordionSummary';

export const squadOffenseSx = {
  root: {
    borderRadius: 16,
    p: 1.15,
    display: 'grid',
    gap: 0.85,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  header: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  headerText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.1,
  },

  title: {
    fontWeight: 700,
    color: 'text.primary',
    lineHeight: 1.25,
  },

  subtitle: {
    color: 'text.tertiary',
    lineHeight: 1.25,
    fontWeight: 600,
  },

  headerChip: {
    flexShrink: 0,
    fontWeight: 700,
    '--Chip-minHeight': '24px',
  },

  sectionTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
  },

  sectionSubtitle: {
    color: 'text.secondary',
    lineHeight: 1.3,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(3, minmax(0, 1fr))',
      sm: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.55,
    alignItems: 'start',
  },

  metricMini: (color = 'neutral') => ({
    minHeight: 78,
    borderRadius: 12,
    px: 0.85,
    py: 0.75,
    display: 'grid',
    alignContent: 'start',
    gap: 0.25,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: `${color}.outlinedBorder`,
    bgcolor: `${color}.softBg`,
  }),

  miniTitleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  miniTitle: {
    minWidth: 0,
    color: 'text.secondary',
    fontWeight: 700,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  miniValue: {
    fontWeight: 700,
    lineHeight: 1,
    color: 'text.primary',
    mt: 0.05,
  },

  subText: {
    color: 'text.secondary',
    lineHeight: 1.15,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  accordionGroup: (theme) => ({
    border: 0,
    bgcolor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',

    [`& .${accordionSummaryClasses.root}`]: {
      p: 0,
      borderRadius: 12,
    },

    [`& .${accordionSummaryClasses.button}`]: {
      minHeight: 0,
      alignItems: 'flex-start',
      borderRadius: 12,
      bgcolor: 'background.level1',
      border: '1px solid',
      borderColor: 'divider',
      px: 0.9,
      py: 0.75,
      transition:
        'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    },

    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: 'background.surface',
      borderColor: 'neutral.outlinedBorder',
      boxShadow: 'xs',
    },

    [`& .${accordionSummaryClasses.indicator}`]: {
      ml: 0.75,
      mt: 0.15,
      color: 'text.tertiary',
    },

    [`& .${accordionDetailsClasses.content}`]: {
      mt: 0.55,
      px: 0.9,
      borderRadius: 10,
      boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,

      [`&.${accordionDetailsClasses.expanded}`]: {
        paddingBlock: '0.65rem',
      },
    },
  }),

  accordion: {
    border: 0,
    bgcolor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: 'none',

    '&::before': {
      display: 'none',
    },
  },

  takeaway: {
    width: '100%',
    display: 'grid',
    gap: 0.28,
    minWidth: 0,
    bgcolor: 'transparent',
    border: 0,
    p: 0,
  },

  takeawayHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  takeawayTitleWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
  },

  takeawayMark: (color = 'neutral') => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: `${color}.500`,
    flexShrink: 0,
  }),

  takeawayTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  takeawayChip: {
    flexShrink: 0,
    fontWeight: 700,
    '--Chip-minHeight': '22px',
    '--Chip-paddingInline': '8px',
    fontSize: 11,
  },

  takeawayText: {
    color: 'text.secondary',
    lineHeight: 1.35,
    fontWeight: 500,
  },

  detailsStack: {
    display: 'grid',
    gap: 0.65,
  },

  detailItem: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  detailLabel: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.secondary',
  },

  detailText: {
    color: 'text.secondary',
    lineHeight: 1.4,
  },

  accordionGroup1: {
    mt: 0.1,
    borderRadius: 14,
    bgcolor: 'transparent',
    border: 0,
  },

  accordion: {
    borderRadius: 14,
    overflow: 'hidden',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    '&::before': {
      display: 'none',
    },
  },

  accordionSummary: {
    px: 1,
    py: 0.85,
    minHeight: 0,
    '& .MuiAccordionSummary-button': {
      minHeight: 0,
      alignItems: 'flex-start',
      '&:hover': {
        bgcolor: 'transparent',
      },
    },
  },

  summaryContent: {
    minWidth: 0,
    display: 'grid',
    gap: 0.35,
    width: '100%',
  },

  summaryTop: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  summaryTitleWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
  },

  summaryMark: (color = 'neutral') => ({
    width: 7,
    height: 7,
    borderRadius: '50%',
    bgcolor: `${color}.500`,
    flexShrink: 0,
  }),

  summaryTitle: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  summaryChip: {
    flexShrink: 0,
    fontWeight: 700,
    '--Chip-minHeight': '23px',
  },

  summaryText: {
    color: 'text.secondary',
    lineHeight: 1.35,
  },

  detailsStack: {
    display: 'grid',
    gap: 0.75,
    px: 1,
    pb: 1,
    pt: 0.25,
  },

  detailItem: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  detailLabelPrimary: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.primary',
  },

  detailLabel: {
    fontWeight: 700,
    lineHeight: 1.25,
    color: 'text.secondary',
  },

  detailText: {
    color: 'text.secondary',
    lineHeight: 1.45,
  },

  emptyState: {
    minHeight: 78,
    display: 'grid',
    alignContent: 'center',
    gap: 0.25,
    borderRadius: 12,
    p: 1,
    bgcolor: 'background.level1',
    border: '1px dashed',
    borderColor: 'divider',
  },

  emptyTitle: {
    fontWeight: 700,
    color: 'text.secondary',
    lineHeight: 1.25,
  },

  tooltip: {
    border: '1px solid',
    borderColor: 'divider',
    p: 1,
  },

  tooltipBox: {
    display: 'grid',
    gap: 0.5,
    maxWidth: 280,
  },

  tooltipTitle: {
    fontWeight: 700,
    color: 'text.primary',
    lineHeight: 1.25,
  },

  tooltipList: {
    display: 'grid',
    gap: 0.25,
  },

  tooltipText: {
    color: 'text.secondary',
    lineHeight: 1.45,
  },
}
