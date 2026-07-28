// features/reports/renderers/external/league/leagueTable.sx.js

export const leagueTableSx = {
  root: {
    display: 'grid',
    gap: 1,
  },

  intro: {
    display: 'grid',
    gap: 1,
  },

  introCopy: {
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
    color: 'var(--report-type-text)',
  },

  description: {
    mt: 0.35,
    color: 'text.secondary',
  },

  summary: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 0.65,
  },

  summaryItem: {
    px: 0.75,
    py: 0.75,
    borderRadius: 10,
    border: '1px solid',
    borderColor: 'var(--report-type-border)',
    bgcolor: 'var(--report-type-soft)',
    textAlign: 'center',
  },

  summaryValue: {
    display: 'block',
    fontSize: 16,
    lineHeight: 1.1,
    fontWeight: 700,
    color: 'var(--report-type-text)',
  },

  summaryLabel: {
    display: 'block',
    mt: 0.25,
    fontSize: 9,
    lineHeight: 1.2,
    color: 'text.secondary',
  },


  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 0.65,
    mt: 0.45,
    mb: 0.15,
    px: 0.25,
  },

  sortControl: {
    flexShrink: 0,
  },

  viewControl: {
    minWidth: 0,

    '& button[aria-pressed="true"]': {
      bgcolor: '#10B981',
      borderColor: '#10B981',
      color: '#FFFFFF',
      boxShadow: '0 2px 6px rgba(16, 185, 129, 0.22)',
    },

    '& button[aria-pressed="false"]': {
      bgcolor: 'background.surface',
      borderColor: 'divider',
      color: 'text.primary',
    },
  },

  identity: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  rank: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: 30,
    height: 30,
    borderRadius: '50%',
    bgcolor: 'var(--report-type-soft)',
    color: 'var(--report-type-text)',
    fontWeight: 700,
    fontSize: 12,
  },

  teamName: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
    color: 'text.primary',
  },

  performance: {
    display: 'grid',
    gridTemplateColumns: { xs: 'auto 1fr auto', md: '1fr auto' },
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    px: 0.75,
    py: 0.65,
    borderRadius: 8,
    border: '1px solid',
  },

  performanceMobileLabel: {
    display: { xs: 'inline', md: 'none' },
    fontSize: 9,
    fontWeight: 700,
  },

  performanceLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 10,
    fontWeight: 700,
  },

  performanceRate: {
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
  },
}
