// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/sx/players.sx.js

const getProblemShadow = damage => {
  const n = Number(damage)

  if (n >= 2) return 'lg'
  if (n >= 1) return 'md'
  if (n > 0) return 'sm'

  return 'xs'
}

const getProblemBorder = damage => {
  const n = Number(damage)

  if (n >= 2) return 'danger.outlinedBorder'
  if (n > 0) return 'warning.outlinedBorder'

  return 'divider'
}

const getProblemBg = damage => {
  const n = Number(damage)

  if (n >= 2) return 'danger.softBg'
  if (n > 0) return 'warning.softBg'

  return 'background.surface'
}

export const playersSx = {
  root: {
    display: 'grid',
    gap: 0.85,
  },

  title: {
    fontWeight: 700,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(3, minmax(0, 1fr))',
      md: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.65,
  },

  card: ({ variant, damage }) => ({
    minWidth: 0,
    height: 54,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    p: 0.45,
    borderRadius: 'md',
    border: '1px solid',
    borderColor: variant === 'problem'
      ? getProblemBorder(damage)
      : 'divider',
    bgcolor: variant === 'problem'
      ? getProblemBg(damage)
      : 'background.surface',
    boxShadow: variant === 'problem'
      ? getProblemShadow(damage)
      : 'xs',
    overflow: 'hidden',
  }),

  text: {
    minWidth: 0,
    flex: 1,
    display: 'grid',
    gap: 0.35,
  },

  top: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.5,
  },

  name: {
    minWidth: 0,
    maxWidth: '100%',
    fontWeight: 700,
    lineHeight: 1.15,
  },

  metrics: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.3,
    flex: '0 0 auto',
  },

  metricChip: {
    minHeight: 18,
    px: 0.45,
    fontSize: 10.5,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.35,
    minWidth: 0,
    overflow: 'hidden',
  },

  chip: {
    minHeight: 20,
    maxWidth: 86,
    fontSize: 10.5,
    px: 0.5,
    border: '1px solid',
    borderColor: 'divider',
    alignItems: 'center',

    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },

  iconChip: {
    minHeight: 20,
    width: 24,
    px: 0,
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    placeItems: 'center',
  },

  moreChip: {
    width: 'fit-content',
    alignSelf: 'center',
    fontWeight: 700,
  },

  empty: {
    color: 'text.tertiary',
  },
}
