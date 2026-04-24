// teamProfile/mobile/modules/players/sx/card.mobile.sx.js

import { accordionSummaryClasses } from '@mui/joy/AccordionSummary'
import { accordionDetailsClasses } from '@mui/joy/AccordionDetails'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const cardSx = {
  card: {
    width: '100%',
    borderRadius: '18px',
    overflow: 'hidden',
    bgcolor: 'background.surface',
    boxShadow: 'sm',
    position: 'relative',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 3,
      height: '100%',
      opacity: 0.95,
    },
  },

  header: {
    display: 'grid',
    gap: 0.8,
    minWidth: 0,
    borderBottom: '1px solid',
    borderColor: 'divider'
  },

  headerMain: {
    display: 'grid',
    gridTemplateColumns: '40px 1fr auto',
    alignItems: 'center',
    gap: 0.9,
    minWidth: 0,
  },

  avatarBtn: {
    position: 'relative',
    lineHeight: 0,
    borderRadius: 999,
    cursor: 'pointer',
    width: 36,
    height: 36,
    flexShrink: 0,

    '&:hover ._playerCardAvatarOverlay': {
      opacity: 1,
    },

    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: c.bg,
      outlineOffset: 2,
    },
  },

  avatar: {
    width: 36,
    height: 36,
    boxShadow: `0 0 0 2px ${c.bg}22`,
  },

  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    bgcolor: 'rgba(0,0,0,0.18)',
    opacity: 0,
    transition: 'opacity 140ms ease',
    pointerEvents: 'none',
  },

  avatarStatusDot: {
    position: 'absolute',
    bottom: -1,
    left: -1,
    width: 12,
    height: 12,
    borderRadius: '50%',
    border: '2px solid',
    borderColor: 'background.surface',
    zIndex: 2,
    boxShadow: 'sm',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    pb: 0.5
  },

  title: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    fontWeight: 600,
  },

  chip: {
    flexShrink: 0,
    fontSize: 10,
    border: '1px solid',
    borderColor: 'divider',
  },

  subtitle: {
    color: 'text.tertiary',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metaInline: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  levelWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 0,
  },

  metaChipsWrap: {
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  playerStatsWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
    minWidth: 0,
  },

  accordionGroup: (theme) => ({
    width: '100%',
    '--Accordion-radius': '0px',
    '--AccordionGroup-gap': '0px',
    [`& .${accordionSummaryClasses.button}`]: {
      px: 1,
      pb: 1,
      bgcolor: 'transparent',
    },
    [`& .${accordionSummaryClasses.button}:hover`]: {
      bgcolor: 'transparent',
    },
    [`& .${accordionDetailsClasses.content}`]: {
      px: 1,
      boxShadow: `inset 0 1px ${theme.vars.palette.divider}`,
      bgcolor: 'background.level2',
      [`&.${accordionDetailsClasses.expanded}`]: {
        pt: 1,
      },
    },
  }),

  accordion: {
    m: 0,
    borderRadius: 0,
    bgcolor: 'transparent',
    '&:before': {
      display: 'none',
    },
  },

  metaItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.4,
    px: 0.75,
    borderRadius: '12px',
    bgcolor: 'background.surface',
  },

  box: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  buttWrap: {
    display: 'flex',
    gap: 0.6,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
}
