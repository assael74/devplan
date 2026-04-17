// previewDomainCard/domains/team/players/sx/teamPlayersTable.sx.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const tableSx = {
  tableWrapSx: {
    p: 0.75,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    overflow: 'hidden',
  },

  headRowSx: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1.2fr 1.2fr .5fr .5fr .6fr .3fr' },
    gap: 1,
    alignItems: 'center',
    pl: 1,
    py: 0.9,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    mb: 0.75,
  },

  headTextSx: {
    fontWeight: 700,
    color: 'text.secondary',
    textAlign: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  },

  rowCardSx: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1.2fr 1.2fr .5fr .5fr .6fr .3fr' },
    gap: 1,
    alignItems: 'center',
    pl: 1,
    py: 0.95,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'rgba(76,110,245,0.08)',
    mb: 0.75,
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: 'md',
      bgcolor: c.bg,
      borderColor: 'rgba(76,110,245,0.22)',
    },
    '&:last-of-type': {
      mb: 0,
    },
  },

  rowCardKeySx: {
    background:
      'linear-gradient(90deg, rgba(255,196,61,0.13) 0%, rgba(255,255,255,0.00) 45%)',
    borderColor: 'rgba(255,184,77,0.28)',
  },

  playerCellSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  avatarBoxSx: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    bgcolor: 'neutral.softBg',
    color: 'text.secondary',
    flexShrink: 0,
    boxShadow: 'xs',
  },

  playerTextWrapSx: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
  },

  playerNameSx: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
  },

  playerMetaSx: {
    color: 'text.tertiary',
    fontSize: 12,
  },

  centerCellSx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  }
}
