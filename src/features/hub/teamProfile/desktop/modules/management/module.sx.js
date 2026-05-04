// teamProfile/desktop/modules/management/module.sx.js

import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

export const moduleSx = {
  headerDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    bgcolor: c.accent,
    boxShadow: '0 0 0 4px rgba(76,110,245,0.12)',
    flexShrink: 0,
  },

  stickyToolbar: {
    position: 'sticky',
    top: -6,
    zIndex: 5,
    display: 'grid',
    gap: 1,
    borderRadius: 'md',
    bgcolor: 'background.body',
    mb: 0.5,
    boxShadow: `inset 0 0 1px 2px ${c.accent}33`,
  },

  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    px: 1.25,
    py: 0.85,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    minWidth: 0,
    flexWrap: 'wrap',
  },

  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
  },

  topGrid: {
    display: 'grid',
    gap: 1.25,
    gridTemplateColumns: { xs: '1fr', xl: '1.1fr 0.9fr' },
    gridTemplateAreas: {
      xs: `
        "info"
        "targets"
      `,
      xl: `
        "targets info"
      `,
    },
    alignItems: 'start',
    minWidth: 0,
  },

  targetsArea: {
    gridArea: 'targets',
    minWidth: 0,
    alignSelf: 'start',
    border: '1px solid',
    borderColor: `${c.accent}33`,
    borderRadius: 'md'
  },

  infoArea: {
    gridArea: 'info',
    minWidth: 0,
    alignSelf: 'start',
    border: '1px solid',
    borderColor: `${c.accent}33`,
    borderRadius: 'md'
  },

  staffArea: {
    minWidth: 0,
    alignSelf: 'start',
  },

  card: {
    p: 1.25,
    borderRadius: 'md',
    boxShadow: 'sm',
    bgcolor: 'background.surface',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
    minHeight: 0,
  },

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    pb: 1,
    flexWrap: 'wrap',
  },

  cardTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  actions: {
    display: 'flex',
    gap: 0.75,
    alignItems: 'center',
    flexShrink: 0,
  },

  firstRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    alignItems: 'center',
  },

  chipsRow: {
    display: 'flex',
    gap: 2,
    flexWrap: 'nowrap',
    alignItems: 'center',
    mt: 2.7,
  },

  secondRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    alignItems: 'start',
  },

  thirdRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr' },
    alignItems: 'start',
  },

  forthRow: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
    alignItems: 'start',
  },

  targetsSummaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  confBtn: {
    bgcolor: c.bg,
    color: c.text,
    fontWeight: 700,
    boxShadow: 'sm',
    px: 1.5,
    transition: 'filter .15s ease, transform .12s ease',
    border: '1px solid',
    borderColor: 'divider',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },

  leagueTargetsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 1.25,
    alignItems: 'start',
    minWidth: 0,
  },

  leagueTargetsCol: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    alignContent: 'start',
    minWidth: 0,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  targetsColTitle: {
    fontWeight: 700,
    color: 'text.primary',
    pb: 0.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  targetAchievementRow: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 105px',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },

  actualGoalsRow: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 1,
    alignItems: 'start',
    minWidth: 0,
  },
}
