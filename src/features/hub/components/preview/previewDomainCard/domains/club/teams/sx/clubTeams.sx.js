// preview/previewDomainCard/domains/club/teams/sx/clubTeamsTable.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('teams')

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
    gridTemplateColumns: { xs: '1fr', md: '1.35fr .55fr .5fr .5fr .45fr .25fr' },
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
  },

  rowCardSx: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1.35fr .55fr .5fr .5fr .45fr .25fr' },
    gap: 1,
    alignItems: 'center',
    pl: 1,
    py: 0.95,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'rgba(16,185,129,0.10)',
    mb: 0.75,
    transition: 'transform .14s ease, box-shadow .14s ease, border-color .14s ease',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: 'md',
      bgcolor: c.bg,
      borderColor: 'rgba(16,185,129,0.24)',
    },
    '&:last-of-type': {
      mb: 0,
    },
  },

  rowCardProjectSx: {
    background:
      'linear-gradient(90deg, rgba(16,185,129,0.10) 0%, rgba(255,255,255,0.00) 45%)',
    borderColor: 'rgba(16,185,129,0.22)',
  },

  teamCellSx: {
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

  teamTextWrapSx: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  teamNameSx: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 700,
  },

  teamMetaSx: {
    color: 'text.tertiary',
    fontSize: 12,
  },

  valueTextSx: {
    fontWeight: 600,
    textAlign: 'center',
  },

  centerCellSx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  emptyBoxSx: {
    py: 3,
    px: 1.5,
    borderRadius: 'lg',
    bgcolor: 'background.surface',
    border: '1px dashed',
    borderColor: 'divider',
    textAlign: 'center',
  },
}
