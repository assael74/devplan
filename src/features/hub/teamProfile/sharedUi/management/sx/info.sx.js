// teamProfile/sharedUi/management/sx/info.sx.js

export const infoSx = {
  card: (isMobile, editing = false) => ({
    p: isMobile ? 1 : 1.15,
    mt: isMobile ? 1 : 1,
    borderRadius: 'md',
    boxShadow: 'none',
    border: '1px solid',
    borderColor: editing ? 'primary.outlinedBorder' : 'divider',
    bgcolor: editing ? 'background.level1' : 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? 1 : 0.9,
    minWidth: 0,
    minHeight: 0,
  }),

  editHeader: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: isMobile ? 0.75 : 0.9,
    py: 0.75,
    borderRadius: 'sm',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
  }),

  editTitle: {
    fontWeight: 600,
    lineHeight: 1.2,
  },

  editSubtitle: {
    color: 'text.tertiary',
    mt: 0.15,
  },

  sectionBlock: {
    display: 'grid',
    gap: 0.65,
    p: 0.85,
    borderRadius: 'sm',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
  },

  sectionTitleWrap: {
    display: 'grid',
    gap: 0.1,
    minWidth: 0,
  },

  sectionTitle: {
    fontWeight: 600,
    lineHeight: 1.2,
  },

  sectionHelper: {
    color: 'text.tertiary',
  },

  fieldWrap: (tone = 'editable') => ({
    minWidth: 0,
    p: 0,
    borderRadius: 'sm',
    opacity: tone === 'disabled' ? 0.62 : 1,

    '& .MuiInput-root': {
      bgcolor: tone === 'readonly' ? 'background.level1' : 'background.surface',
      borderColor: tone === 'readonly' ? 'divider' : 'neutral.outlinedBorder',
    },

    '& .MuiFormLabel-root': {
      fontWeight: 500,
      color: 'text.secondary',
    },

    '& .MuiFormHelperText-root': {
      mt: 0.35,
      color: tone === 'readonly' ? 'text.tertiary' : undefined,
    },
  }),

  statusRow: (isMobile) => ({
    display: 'flex',
    gap: 0.5,
    flexWrap: 'wrap',
    justifyContent: isMobile ? 'flex-start' : 'flex-end',
  }),

  readGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile
      ? '1fr'
      : {
          xs: '1fr',
          md: 'repeat(4, minmax(0, 1fr))',
        },
    gap: 0.75,
    minWidth: 0,
  }),

  readItem: (wide) => ({
    minWidth: 0,
    p: 0.75,
    borderRadius: 'sm',
    bgcolor: 'background.level1',
    gridColumn: wide
      ? {
          xs: 'auto',
          md: 'span 2',
        }
      : 'auto',
  }),

  readLabel: {
    color: 'text.tertiary',
    fontWeight: 500,
    mb: 0.2,
  },

  readValue: {
    color: 'text.primary',
    fontWeight: 600,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  basicGrid: (isMobile) => ({
    display: 'grid',
    gap: 0.85,
    gridTemplateColumns: isMobile
      ? '1fr'
      : {
          xs: '1fr',
          md: 'repeat(4, minmax(0, 1fr))',
        },
    alignItems: 'start',
    minWidth: 0,
  }),

  chipsRow: (isMobile) => ({
    display: 'flex',
    gap: isMobile ? 0.75 : 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    minWidth: 0,
    pt: isMobile ? 0 : 2.45,
  }),

  leagueGrid: (isMobile) => ({
    display: 'grid',
    gap: 0.85,
    gridTemplateColumns: isMobile
      ? '1fr 1fr'
      : {
          xs: '1fr',
          md: 'repeat(4, minmax(0, 1fr))',
        },
    alignItems: 'start',
    minWidth: 0,
  }),
}
