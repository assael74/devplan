// src/features/hub/teamProfile/desktop/modules/games/components/details/sx/details.sx.js

export const detailsSx = {
  root: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.75,
    minWidth: 0,
  },

  metricCard: (active = false, clickable = false) => ({
    minWidth: 0,
    px: clickable ? 1 : 1,
    pt: clickable ? 0.2 : 1,
    pb: 1,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: active ? 'primary.outlinedBorder' : 'divider',
    bgcolor: active ? 'background.level1' : 'background.surface',
    display: 'grid',
    gap: 0.35,
    cursor: clickable ? 'pointer' : 'default',
    outline: 'none',
    transition:
      'background-color .16s ease, border-color .16s ease, box-shadow .16s ease',

    '&:hover': clickable
      ? {
          bgcolor: 'background.level1',
          borderColor: 'primary.outlinedBorder',
          boxShadow: 'sm',
        }
      : undefined,

    '&:focus-visible': clickable
      ? {
          boxShadow: 'inset 0 0 0 2px var(--joy-palette-primary-outlinedBorder)',
        }
      : undefined,
  }),

  metricHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
    minWidth: 0,
  },

  metricIconBox: {
    width: 24,
    height: 24,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'background.level1',
    color: 'text.secondary',
    flex: '0 0 auto',
    border: '1px solid',
    borderColor: 'divider',
  },

  metricLabel: {
    color: 'text.tertiary',
    fontWeight: 700,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metricValue: {
    fontWeight: 700,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metricSub: {
    color: 'text.tertiary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  teamTrendCollapse: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    transition: 'grid-template-rows 220ms ease',
    overflow: open ? 'visible' : 'hidden',
    minWidth: 0,
  }),

  teamTrendInner: {
    overflow: 'hidden',
    minHeight: 0,
    minWidth: 0,
  },

  teamTrendBody: {
    minWidth: 0,
  },

  section: {
    display: 'grid',
    gap: 0.75,
    minWidth: 0,
  },

  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  sectionTitle: {
    fontWeight: 700,
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
  },

  sectionSub: {
    color: 'text.tertiary',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'left',
  },
}
