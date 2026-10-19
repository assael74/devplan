// src/ui/patterns/scout/scoutPriorityDetails.sx.js

import { COLORS, devPlanColors } from '../../core/theme/Colors.js'

export const scoutPriorityDetailsSx = {
  popover: {
    width: 352,
    boxSizing: 'border-box',
    maxWidth: 'calc(100vw - 32px)',
    maxHeight: 'calc(100dvh - 32px)',
    borderRadius: '16px',
    bgcolor: devPlanColors.surface,
    border: `1px solid ${devPlanColors.border}`,
    boxShadow: 'var(--joy-shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'visible',
  },

  arrow: {
    position: 'absolute',
    width: 6,
    height: 6,
    transform: 'translateY(-50%) rotate(45deg)',
    bgcolor: devPlanColors.surface,
    border: `1px solid ${devPlanColors.border}`,
    pointerEvents: 'none',
  },

  backdrop: { bgcolor: `${devPlanColors.primaryDark}1F` },

  drawer: {
    '--Drawer-transitionDuration': '260ms',
    '--Drawer-transitionFunction': 'cubic-bezier(0.22, 1, 0.36, 1)',

    '@media (prefers-reduced-motion: reduce)': {
      '--Drawer-transitionDuration': '1ms',
    },
  },

  drawerContent: {
    width: '100%',
    height: 'auto',
    maxHeight: '85dvh',
    borderStartStartRadius: 20,
    borderStartEndRadius: 20,
    overflow: 'hidden',
    pb: 'env(safe-area-inset-bottom)',
  },

  content: {
    color: devPlanColors.text,
    bgcolor: devPlanColors.surface,
    p: 1.5,
    position: 'relative',
    borderRadius: 'inherit',
    minHeight: 0,
    overflowY: 'auto',
    overscrollBehavior: 'contain',
  },

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    mb: 1,
  },

  heading: { flex: 1, minWidth: 0 },

  context: {
    color: devPlanColors.subText,
    overflowWrap: 'anywhere',
    mt: 0.1,
  },

  summary: colors => ({
    p: 1,
    mb: 0.75,
    borderRadius: 'md',
    bgcolor: colors.light,
    borderInlineStart: `3px solid ${colors.main}`,
  }),

  summaryTop: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
    mb: 0.35,
  },

  score: { color: devPlanColors.subText, fontSize: 11 },

  summaryText: { fontSize: 13, lineHeight: 1.5, color: devPlanColors.text },

  items: { display: 'grid' },

  item: {
    display: 'grid',
    gap: 0.25,
    py: 1,

    '& + &': {
      borderTop: `1px solid ${devPlanColors.border}`,
    },
  },

  itemHeading: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  itemTitle: { fontSize: 12.5, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },

  impact: level => {
    const colors = COLORS.status[level === 'positive' ? 'success' : level === 'negative' ? 'warning' : 'neutral']
    return {
      fontSize: 10.5,
      fontWeight: 600,
      color: colors.text,
      bgcolor: colors.softBg,
      px: 0.75,
      borderRadius: 'sm',
      flexShrink: 0,
    }
  },

  contribution: { fontSize: 12, fontWeight: 600, color: devPlanColors.text, fontVariantNumeric: 'tabular-nums' },

  calculationRoot: { minWidth: 0 },

  calculationHeader: { display: 'none' },

  calculationCollapse: reduceMotion => ({
    transition: reduceMotion ? 'none' : 'grid-template-rows 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms ease',
  }),

  calculationBody: { display: 'grid', gap: 0.5, pt: 0.5, pb: 0.5 },

  calculation: {
    bgcolor: devPlanColors.body,
    borderRadius: 'sm',
    p: 1,
    mt: 0.5,
    display: 'grid',
    gap: 0.25,
  },

  text: { fontSize: 12.5, lineHeight: 1.5, color: devPlanColors.text },

  meaningLine: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.5,
    minWidth: 0,
    fontFamily: 'var(--joy-fontFamily-body)',
    fontSize: 12.5,
    lineHeight: 1.5,
  },

  meaningText: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: devPlanColors.text,
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  more: {
    display: 'inline',
    border: 0,
    p: 0,
    m: 0,
    bgcolor: 'transparent',
    color: devPlanColors.petrolDark,
    font: 'inherit',
    fontWeight: 500,
    flexShrink: 0,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',

    '&:hover': { color: devPlanColors.primaryDark },

    '&:focus-visible': { outline: `2px solid ${devPlanColors.petrol}`, outlineOffset: 2, borderRadius: 2 },
  },

  actual: {
    fontSize: 12,
    lineHeight: 1.45,
    fontWeight: 600,
    color: devPlanColors.text,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },

  evidence: { color: devPlanColors.subText, fontSize: 11, lineHeight: 1.4 },
}
