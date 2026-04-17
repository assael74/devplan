// preview/previewDomainCard/domains/player/info/sx/playerInfo.domain.sx.js

import { getEntityColors } from '../../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const sx = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    p: 1,
    borderRadius: 'md',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: c.accent,
  },

  headerIconWrap: {
    width: 34,
    height: 34,
    minWidth: 34,
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: c.surface,
    color: c.accent,
    border: '1px solid',
    borderColor: 'divider',
  },

  headerTitle: {
    color: c.text,
    lineHeight: 1.1,
  },

  headerSub: {
    color: c.text,
    opacity: 0.72,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  topTitlesGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1.4fr .6fr' },
    alignItems: 'center',
    gap: 1,
  },

  topGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto auto' },
    gap: 1,
    alignItems: 'stretch',
  },

  sectionTitle: {
    px: 0.25,
    fontWeight: 700,
    color: c.accent,
  },

  namesGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
    gap: 1,
    minWidth: 0,
    '& .MuiFormControl-root': { minWidth: 0 },
  },

  contactGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr' },
    gap: 1,
    '& .MuiFormControl-root': { minWidth: 0 },
  },

  projectBox: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '.8fr 1.2fr' },
    gap: 1.5,
    pt: 1
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 1,
    pt: 1,
  },

  statusCard: {
    minWidth: { xs: '100%', md: 250 },
    maxWidth: { xs: '100%', md: 350 },
    width: '100%',
    display: 'grid',
    gap: 0.75,
    alignContent: 'center',
    justifyContent: 'stretch',
    p: 1,
    mt: 1,
    borderRadius: 'md',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: 'divider',
  },

  statusTitle: {
    fontWeight: 700,
    color: c.accent,
    lineHeight: 1,
    px: 0.25,
  },

  statusChipsRow: {
    display: 'grid',
    gridTemplateColumns: 'max-content minmax(170px, 1fr)',
    gap: 1,
    alignItems: 'end',
    width: '100%',

    '& .MuiFormControl-root': {
      minWidth: 0,
      m: 0,
    },

    '& .MuiFormControl-root:first-of-type': {
      width: 'auto',
    },

    '& .MuiFormControl-root:last-of-type': {
      width: '100%',
    },
  },

  conBut: {
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',

    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
