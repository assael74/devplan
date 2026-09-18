// src/features/playersDatabase/ui/components/modals/paste/sx/rosterImportModal.sx.js

export const rosterImportModalSx = {
  previewStatusColumn: {
    width: '5%',
    minWidth: '5%',
    maxWidth: '5%',
  },

  previewIndexColumn: {
    width: '5%',
    minWidth: '5%',
    maxWidth: '5%',
  },

  previewTable: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',
  },

  missingStatusColumn: {
    width: 42,
    minWidth: 42,
    maxWidth: 42,
    px: 0.4,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },

  missingIndexColumn: {
    width: 54,
    minWidth: 54,
    maxWidth: 54,
    px: 0.4,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },

  identityColumn: {
    width: '25%',
    minWidth: '25%',
    maxWidth: '25%',
  },

  playerNameColumn: {
    width: '20%',
    minWidth: '20%',
    maxWidth: '20%',
    textAlign: 'left !important',
  },

  playerNameHeader: {
    justifyContent: 'flex-start',
  },

  playerNameCell: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0,
    minWidth: 0,
  },

  rosterMembershipColumn: {
    width: '40%',
    minWidth: '40%',
    maxWidth: '40%',
  },

  externalPlayerIdColumn: {
    width: '5%',
    minWidth: '5%',
    maxWidth: '5%',
  },
}
