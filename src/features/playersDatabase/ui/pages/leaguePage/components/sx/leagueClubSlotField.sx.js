// src/features/playersDatabase/ui/pages/leaguePage/components/sx/leagueClubSlotField.sx.js

export const leagueClubSlotFieldSx = {
  tooltipAnchor: {
    width: '100%',
    minWidth: 0,
  },

  root: {
    minWidth: 0,
    display: 'grid',
    width: '100%',
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
    textAlign: 'right',
  },

  slotSelect: {
    gridArea: 'slot',
    width: '100%',
    minWidth: 0,
    minHeight: 32,
    textAlign: 'center',
  },

  errorTooltip: {
    maxWidth: 240,
    whiteSpace: 'normal',
    textAlign: 'right',
  },
}
