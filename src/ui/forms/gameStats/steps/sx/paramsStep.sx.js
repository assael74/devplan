// src/ui/forms/gameStats/steps/sx/paramsStep.sx.js

import { getParamFamilyTone } from '../../sx/paramFamilies.sx.js'

export const paramsStepSx = {
  stepContent: {
    display: 'grid',
    gap: 1,
    width: '100%',
  },

  stepHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  headerMain: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 1.5,
  },

  headerTitle: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },

  presetsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  compactButton: {
    '--Button-minHeight': '25px',
    minHeight: 25,
    px: 0.85,
    py: 0.2,
    fontSize: '0.72rem',
    borderRadius: 'sm',
  },

  paramGroups: {
    display: 'grid',
    gap: 1,
  },

  paramGroup: {
    display: 'grid',
    gap: 0.65,
    p: 0.85,
    borderRadius: 'md',
    borderColor: getParamFamilyTone('general').border,
    bgcolor: 'background.level1',
  },

  groupTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
  },

  paramGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 1.5,
  },

  paramFamily: family => {
    const tone = getParamFamilyTone(family)

    return {
      display: 'grid',
      alignContent: 'center',
      gap: 0.65,
      p: 0.85,
      minWidth: 0,
      border: '1px solid',
      borderColor: 'neutral.outlinedBorder',
      borderRadius: 'md',
      bgcolor: 'background.surface',
      boxShadow: 'xs',
      color: tone.text,
    }
  },

  familyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    minHeight: 26,
  },

  familyTitle: {
    flex: 1,
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'inherit',
  },

  familyItems: count => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
    gap: 0.4,
  }),

  paramCardState: ({ selected, family }) => {
    const tone = getParamFamilyTone(family)

    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0.4,
      minHeight: { xs: 40, sm: 36 },
      px: 0.65,
      py: 0.4,
      borderRadius: 'sm',
      cursor: 'pointer',
      bgcolor: selected ? tone.selectedBg : tone.bg,
      color: tone.text,
      borderColor: selected ? tone.selectedBorder : tone.border,
      boxShadow: 'none',
      transition: 'background-color .14s ease, border-color .14s ease',

      '&:hover': {
        bgcolor: tone.hoverBg,
        borderColor: tone.selectedBorder,
      },
    }
  },

  paramCardMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    flex: 1,
    minWidth: 0,
  },

  paramIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
    color: 'inherit',

    '& svg': {
      fontSize: 15,
    },
  },

  paramLabel: {
    minWidth: 0,
    color: 'inherit',
    fontSize: '0.75rem',
    lineHeight: 1.25,
    fontWeight: 600,
  },

  paramCheckbox: {
    flex: '0 0 auto',
    '--Checkbox-size': '16px',
  },
}
