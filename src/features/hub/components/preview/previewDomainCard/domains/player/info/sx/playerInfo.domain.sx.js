// preview/previewDomainCard/domains/player/info/sx/playerInfo.domain.sx.js

import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const sx = {
  root: {
    minWidth: 0,
    display: 'grid',
    gap: 1.25,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1,
    mb: 0.5,
    p: 1,
    borderRadius: 'md',
    bgcolor: c.bg,
    border: '1px solid',
    borderColor: c.accent,
  },

  headerMain: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flex: 1,
  },

  ageChip: {
    flexShrink: 0,
    fontWeight: 700,
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

  headerText: {
    minWidth: 0,
    display: 'grid',
    gap: 0.15,
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

  topDivider: {
    display: { xs: 'none', md: 'block' },
    height: '100%',
    minHeight: 72,
    mx: 0.25,
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
    gap: 0.5,
  },

  divider: {
    my: 0.25,
    opacity: 0.6,
  },

  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 1,
    pt: 0.5,
  },

  statusCard: {
    minWidth: { xs: '100%', md: 220 },
    maxWidth: { xs: '100%', md: 260 },
    display: 'grid',
    gap: 0.75,
    alignContent: 'center',
    justifyContent: 'center',
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
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    alignItems: 'center',
    justifyContent: 'center',

    '& .MuiFormControl-root': {
      width: 'auto',
      minWidth: 'unset',
      flex: '0 0 auto',
      m: 0,
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
