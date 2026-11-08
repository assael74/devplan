// src/ui/forms/gameStats/steps/sx/entryStep.sx.js

import { getParamFamilyTone } from '../../sx/paramFamilies.sx.js'

export const entryStepSx = {
  stepContent: {
    display: 'grid',
    gap: 1,
    width: '100%',
  },

  placeholder: {
    display: 'grid',
    gap: 0.5,
    p: 1.25,
    borderRadius: 'md',
  },

  activePlayersBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
    p: 0.75,
    borderRadius: 'md',
    bgcolor: 'background.level1',
  },

  playerTabButton: {
    minHeight: 26,
    px: 0.85,
    py: 0.25,
    fontSize: '0.75rem',
    borderRadius: 'md',
    border: '1px solid',
    borderColor: 'divider',
  },

  entryCard: {
    display: 'grid',
    gap: 0.85,
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.level1',
  },

  entryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.25,
  },

  entryPlayerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  entryHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },

  entrySection: {
    display: 'grid',
    gap: 0.65,
    minWidth: 0,
  },

  entrySectionTitle: {
    fontWeight: 700,
    color: 'text.tertiary',
  },

  regularEntryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(4, minmax(110px, 1fr))',
      lg: 'repeat(6, minmax(100px, 1fr))',
    },
    gap: 1.5,
    minWidth: 0,
  },

  tripletEntryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(220px, 1fr))',
      lg: 'repeat(3, minmax(220px, 1fr))',
    },
    gap: 1.5,
    minWidth: 0,
  },

  entryFieldCard: family => {
    const tone = getParamFamilyTone(family)

    return {
      display: 'grid',
      gap: 0.65,
      p: 0.85,
      borderRadius: 'md',
      bgcolor: tone.selectedBg,
      borderColor: tone.border,
      boxShadow: 'xs',
      color: tone.text,
      transition: 'background-color .14s ease, border-color .14s ease',

      '&:hover': {
        borderColor: tone.selectedBorder,
      },

      '& .MuiFormLabel-root': {
        fontSize: '0.74rem',
      },
    }
  },
}
