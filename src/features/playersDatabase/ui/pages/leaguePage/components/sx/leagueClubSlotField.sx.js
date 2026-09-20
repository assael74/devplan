// src/features/playersDatabase/ui/pages/leaguePage/components/sx/leagueClubSlotField.sx.js

export const leagueClubSlotFieldSx = {
  root: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 58px',
    alignItems: 'start',
    gap: 0.5,
    minWidth: 0,
  },

  clubAutocomplete: {
    minWidth: 0,
  },

  slotSelect: {
    minWidth: 0,
  },

  slotSelectChanged: {
    '--Select-indicatorColor': 'var(--joy-palette-warning-500)',
    '--Select-color': 'var(--joy-palette-warning-700)',
    '--Select-borderColor': 'var(--joy-palette-warning-400)',
    fontWeight: 700,
  },

  message: {
    gridColumn: '1 / -1',
    minWidth: 0,
  },

  errorMessage: {
    fontWeight: 700,
  },

  warningMessage: {
    fontWeight: 700,
  },
}
