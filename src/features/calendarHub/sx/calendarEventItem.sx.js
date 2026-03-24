// src/features/calendar/sx/calendarEventItem.sx.js

const H_GAP = 4

export const calendarEventItemSx = {
  root: (top, height, typeMeta, leftPct = 0, widthPct = 100, stackIndex = 0) => ({
    position: 'absolute',
    top,
    height,
    insetInlineStart: `calc(${leftPct}% + ${H_GAP}px)`,
    width: `calc(${widthPct}% - ${H_GAP * 2}px)`,
    borderRadius: 12,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: typeMeta.color,
    overflow: 'hidden',
    cursor: 'pointer',
    px: 0.75,
    py: 0.6,
    display: 'flex',
    minHeight: 0,
    zIndex: 5 + stackIndex,
    transition: '120ms ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: 'sm',
      zIndex: 30 + stackIndex,
    },
  }),

  inner: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.35,
    minWidth: 0,
    width: '100%',
    minHeight: 0,
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },

  iconWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    mt: '1px',
  },

  title: (isTiny) => ({
    minWidth: 0,
    lineHeight: 1.15,
    fontSize: isTiny ? '11px' : undefined,
  }),

  time: {
    lineHeight: 1.1,
    color: 'text.secondary',
    fontWeight: 600,
  },

  subtitle: {
    lineHeight: 1.1,
    color: 'text.secondary',
  },

  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    mt: 0.15,
    minWidth: 0,
  },

  metaChip: (typeMeta) => ({
    maxWidth: '100%',
    borderRadius: 999,
    border: '1px solid',
    borderColor: typeMeta?.color || 'divider',
    bgcolor: 'background.level1',
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    },
  }),
}
