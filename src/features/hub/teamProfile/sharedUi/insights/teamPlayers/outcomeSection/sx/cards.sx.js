// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/sx/cards.sx.js

export const cardsSx = {
  cards: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
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
    border: '1px solid',
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
    gap: 0.85,
    minWidth: 0,
  },

  cardIcon: (color, selected) => ({
    width: 30,
    height: 30,
    borderRadius: 'md',
    display: 'grid',
    placeItems: 'center',
    bgcolor: `${color}.softBg`,
    color: `${color}.softColor`,
    border: selected ? '1px solid' : '0 solid',
    borderColor: `${color}.outlinedBorder`,
    flex: '0 0 auto',
  }),

  cardText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  cardTitle: {
    fontWeight: 700,
    lineHeight: 1.2,
  },

  cardSub: {
    color: 'text.tertiary',
    lineHeight: 1.25,
  },

  scoreChip: selected => ({
    fontWeight: 700,
    flex: '0 0 auto',
    boxShadow: selected ? 'xs' : 'none',
  }),

  diagnosisRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 0,
  },

  diagnosisChip: {
    maxWidth: '100%',
    fontWeight: 700,

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.5,
  },

  metric: {
    minWidth: 0,
    p: 0.6,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  metricLabel: {
    color: 'text.tertiary',
    lineHeight: 1.15,
  },

  metricValue: {
    fontWeight: 700,
    lineHeight: 1.2,
  },
}
