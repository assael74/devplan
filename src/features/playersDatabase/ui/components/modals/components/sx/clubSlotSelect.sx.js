import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const slotSecondBackground = `color-mix(in srgb, ${devPlanColors.tertiary} 45%, ${devPlanColors.surface})`
const slotThirdBackground = `color-mix(in srgb, ${devPlanColors.petrol} 45%, ${devPlanColors.surface})`

export const clubSlotSelectSx = {
  root: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 80fr) minmax(0, 20fr)',
    gridTemplateAreas: `
      'club slot'
    `,
    gap: 0.5,
  },

  clubAutocomplete: {
    minWidth: 0,
    width: '100%',
    minHeight: 32,
    gridArea: 'club',
    textAlign: 'right',
  },

  slotSelect: {
    width: '100%',
    minWidth: 0,
    minHeight: 32,
    gridArea: 'slot',
    textAlign: 'center',
  },

  listbox: {
    fontSize: '0.72rem',
    '--ListItem-minHeight': '26px',
    py: 0.25,
  },

  slotSelectSecond: {
    '--Select-indicatorColor': devPlanColors.tertiaryDark,
    '--Select-color': devPlanColors.tertiaryDark,
    '--Select-borderColor': devPlanColors.tertiaryDark,
    '--Select-background': slotSecondBackground,
    '--Select-hoverBackground': slotSecondBackground,
    '--Select-activeBackground': slotSecondBackground,
    bgcolor: slotSecondBackground,
    fontWeight: 700,
    '&:hover': {
      backgroundColor: `${slotSecondBackground} !important`,
      borderColor: `${devPlanColors.tertiaryDark} !important`,
      color: `${devPlanColors.tertiaryDark} !important`,
    },
    '& .MuiSelect-button': {
      bgcolor: slotSecondBackground,
      color: devPlanColors.tertiaryDark,
      '&:hover': { bgcolor: slotSecondBackground },
    },
  },

  slotSelectThird: {
    '--Select-indicatorColor': devPlanColors.petrolDark,
    '--Select-color': devPlanColors.petrolDark,
    '--Select-borderColor': devPlanColors.petrolDark,
    '--Select-background': slotThirdBackground,
    '--Select-hoverBackground': slotThirdBackground,
    '--Select-activeBackground': slotThirdBackground,
    bgcolor: slotThirdBackground,
    fontWeight: 700,
    '&:hover': {
      backgroundColor: `${slotThirdBackground} !important`,
      borderColor: `${devPlanColors.petrolDark} !important`,
      color: `${devPlanColors.petrolDark} !important`,
    },
    '& .MuiSelect-button': {
      bgcolor: slotThirdBackground,
      color: devPlanColors.petrolDark,
      '&:hover': { bgcolor: slotThirdBackground },
    },
  },
}
