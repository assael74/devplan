// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/sx/cards.sx.js

export const cardsSx = {
  cards: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(5, minmax(0, 1fr))',
    },
    gap: 0.85,
  },

  card: selected => ({
    cursor: 'pointer',
    position: 'relative',
    minWidth: 0,
    display: 'grid',
    gap: 0.8,
    p: 0.9,
    borderRadius: 'lg',
    border: '3px solid',
    borderColor: selected ? 'primary.outlinedBorder' : 'divider',
    bgcolor: selected ? 'background.surface' : 'background.body',
    boxShadow: selected ? 'md' : 'xs',
    outline: selected ? '2px solid' : '0 solid',
    outlineColor: selected ? 'primary.softBg' : 'transparent',
    transform: selected ? 'translateY(-1px)' : 'translateY(0)',
    transition:
      'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background-color 0.18s ease, outline-color 0.18s ease',

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: selected ? 'md' : 'sm',
      borderColor: selected ? 'primary.outlinedBorder' : 'neutral.outlinedBorder',
      bgcolor: 'background.surface',
    },
  }),

  cardHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  cardTitleWrap: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1,
    minWidth: 0,
  },

  cardIcon: (color, selected) => ({
    width: 22,
    height: 22,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    bgcolor: `${color}.softBg`,
    color: `${color}.softColor`,
    border: '1px solid',
    borderColor: `${color}.outlinedBorder`,
    flex: '0 0 auto',
  }),

  cardPIcon:{
    width: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    mt: -0.4
  },

  cardText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  cardTitle: {
    fontWeight: 700,
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  cardSub: {
    color: 'text.tertiary',
    lineHeight: 1.25,
  },

  scoreChip: selected => ({
    fontWeight: 700,
    flex: '0 0 auto',
    boxShadow: selected ? 'xs' : 'none',
    textAlign: 'left',
    direction: 'rtl',
    border: '1px solid',
    borderColor: 'divider',
    fontSize: 10
  }),

  scoreWrap: {
    display: 'flex',
    gap: 0.25
  },

  diagnosisRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    minWidth: 0,
    gap: 0.25
  },

  diagnosisChip: {
    maxWidth: '100%',
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
    fontSize: 11,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.5,
  },

  metricsP: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.5,
    overflow: 'hidden',
    minWidth: 0,
  },

  metric: {
    minWidth: 0,
    p: 0.6,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
  },

  metricLabel: {
    color: 'text.tertiary',
    lineHeight: 1.15,
  },

  metricLabelP: {
    color: 'text.tertiary',
    lineHeight: 1.15,
    fontSize: 11,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  metricValue: {
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: 'left',
    direction: 'rtl',
  },

  metricValueP: {
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: 'left',
    direction: 'rtl',
    fontSize: 12
  },
}
