// src/dev/reports/sx/reportsDev.sx.js

export const sx = {
  page: {
    height: 'calc(100dvh - var(--Header-height, 64px))',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  header: {
    flexShrink: 0,
    px: { xs: 1.5, md: 2.5 },
    pt: { xs: 1.5, md: 2 },
    pb: 1.5,
    display: 'flex',
    alignItems: { xs: 'stretch', md: 'center' },
    justifyContent: 'space-between',
    gap: 1.5,
    flexWrap: 'wrap',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  headerContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  content: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: '320px minmax(0, 1fr)',
    },
    gridTemplateRows: {
      xs: 'auto minmax(0, 1fr)',
      lg: 'minmax(0, 1fr)',
    },
    overflow: 'hidden',
  },

  toolbar: {
    minWidth: 0,
    minHeight: 0,
    p: 1.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
    overflowY: 'auto',
    overflowX: 'hidden',
    borderInlineEnd: {
      xs: 0,
      lg: '1px solid',
    },
    borderBottom: {
      xs: '1px solid',
      lg: 0,
    },
    borderColor: 'divider',
    bgcolor: 'background.surface',
  },

  toolbarHeader: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.25,
  },

  category: {
    minWidth: 0,
  },

  categoryHeader: open => ({
    width: '100%',
    minHeight: 56,
    px: 1,
    py: 0.75,
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr) 24px',
    alignItems: 'center',
    gap: 0.75,
    border: '1px solid',
    borderColor: open ? 'primary.300' : 'divider',
    borderRadius: 'md',
    bgcolor: open ? 'primary.softBg' : 'background.surface',
    cursor: 'pointer',
    transition: 'background-color 180ms ease, border-color 180ms ease',

    '&:hover': {
      bgcolor: open ? 'primary.softHoverBg' : 'background.level1',
    },

    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'primary.400',
      outlineOffset: 2,
    },
  }),

  categoryIcon: {
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 'sm',
    bgcolor: 'background.level1',
    color: 'primary.600',

    '& svg': {
      fontSize: 18,
    },
  },

  categoryContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.1,
    textAlign: 'start',
  },

  categoryTitle: {
    minWidth: 0,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  categoryArrow: open => ({
    display: 'grid',
    placeItems: 'center',
    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 180ms ease',

    '& svg': {
      fontSize: 20,
    },
  }),

  categoryCollapse: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    opacity: open ? 1 : 0,
    transition: 'grid-template-rows 220ms ease, opacity 180ms ease',

    '& > *': {
      minHeight: 0,
      overflow: 'hidden',
    },
  }),

  reportsList: {
    minHeight: 0,
    pt: 0.75,
    px: 0.35,
  },

  reportRow: (selected, disabled) => ({
    minWidth: 0,
    minHeight: 54,
    px: 1,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.75,
    border: '1px solid',
    borderColor: selected ? 'primary.400' : 'divider',
    borderRadius: 'sm',
    bgcolor: selected ? 'primary.softBg' : 'background.surface',
    opacity: disabled ? 0.58 : 1,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background-color 160ms ease, border-color 160ms ease',

    '&:hover': disabled
      ? {}
      : {
          bgcolor: selected ? 'primary.softHoverBg' : 'background.level1',
        },

    '&:focus-visible': disabled
      ? {}
      : {
          outline: '2px solid',
          outlineColor: 'primary.400',
          outlineOffset: 2,
        },
  }),

  reportContent: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.1,
    textAlign: 'start',
  },

  reportTitle: {
    minWidth: 0,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  statusChip: {
    flexShrink: 0,
    maxWidth: 112,
    fontSize: 10,
  },

  scenario: {
    mt: 0.5,
    pt: 1.25,
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
    borderTop: '1px solid',
    borderColor: 'divider',
  },

  scenarioSelect: {
    width: '100%',
  },

  previewArea: {
    minWidth: 0,
    minHeight: 0,
    p: { xs: 1, md: 2 },
    overflow: 'auto',
    overscrollBehavior: 'contain',
    bgcolor: 'neutral.100',
  },

  previewFrame: {
    width: 'fit-content',
    minWidth: '100%',
    minHeight: '100%',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  reportContainer: {
    width: 'min(1120px, 100%)',
    minWidth: 0,
    flexShrink: 0,
  },

  emptyPreview: {
    width: 'min(680px, 100%)',
    minHeight: 240,
    p: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    textAlign: 'center',
    borderRadius: 'lg',
    bgcolor: 'background.surface',
  },
}
