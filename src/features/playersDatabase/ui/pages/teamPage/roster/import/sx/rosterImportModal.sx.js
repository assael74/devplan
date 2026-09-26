// src/features/playersDatabase/ui/pages/teamPage/roster/import/sx/rosterImportModal.sx.js

import { devPlanColors } from '../../../../../../../../ui/core/theme/Colors.js'

export const rosterImportModalSx = {
  selectionPanel: {
    width: '100%',
    alignSelf: 'start',
    minHeight: 0,
    height: '100%',
    p: {
      xs: 1,
      md: 1.5,
    },
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    gap: 1.5,
  },

  choiceSection: {
    display: 'grid',
    gap: 0.75,
  },

  choiceSectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  seasonCards: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 300px))',
    },
    justifyContent: 'start',
    gap: 1,
  },

  previousRosterCard: {
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
  },

  previousRosterScroll: {
    minHeight: 0,
    overflow: 'auto',
  },

  previousRosterPlayer: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    minWidth: 0,
  },

  previousRosterTable: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',
  },

  previousRosterIndexColumn: {
    width: '7%',
    minWidth: '7%',
    maxWidth: '7%',
    textAlign: 'left',
  },

  previousRosterPlayerColumn: {
    width: '30%',
    minWidth: '30%',
    maxWidth: '30%',
  },

  previousRosterExternalIdColumn: {
    width: '15%',
    minWidth: '15%',
    maxWidth: '15%',
  },

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
    width: '5%',
    minWidth: '5%',
    maxWidth: '5%',
    px: 0.4,
    textAlign: 'center !important',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',

    '& > *': { marginInline: 'auto' },
  },

  missingIndexColumn: {
    width: '5%',
    minWidth: '5%',
    maxWidth: '5%',
    px: 0.4,
    textAlign: 'center !important',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',

    '& > *': { marginInline: 'auto' },
  },

  missingRosterHeader: {
    minWidth: 0,
    px: 1,
    py: 0.75,
    display: 'grid',
    gap: 0.75,
    bgcolor: '#edf6ff',
    borderBottom: '1px solid #c9ddec',
  },

  missingRosterSummaryChips: {
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    mt: 0.25,
  },

  missingRosterScroll: {
    maxHeight: 360,
    overflow: 'auto',
  },

  missingRosterTable: {
    width: '100%',
    minWidth: 0,
    tableLayout: 'fixed',
  },

  missingPlayerColumn: {
    width: '22%',
    minWidth: '22%',
    maxWidth: '22%',
  },

  missingExternalPlayerIdColumn: {
    width: '7%',
    minWidth: '7%',
    maxWidth: '7%',
  },

  missingResolutionColumn: {
    width: '10%',
    minWidth: '10%',
    maxWidth: '10%',
  },

  missingTargetColumn: {
    width: '51%',
    minWidth: '51%',
    maxWidth: '51%',
  },

  identityColumn: {
    width: '20%',
    minWidth: '20%',
    maxWidth: '20%',
  },

  playerNameColumn: {
    width: '20%',
    minWidth: '20%',
    maxWidth: '20%',
    textAlign: 'left !important',
  },

  playerNameHeader: {
    width: '100%',
    textAlign: 'left',
  },

  playerNameColumnHeader: {
    justifyContent: 'flex-start',
    textAlign: 'left',
  },

  playerNameCellContent: {
    justifyContent: 'flex-start',
    textAlign: 'left',
  },

  rosterMembershipColumn: {
    width: '28%',
    minWidth: '28%',
    maxWidth: '28%',
  },

  rosterResolutionColumn: {
    width: '12%',
    minWidth: '12%',
    maxWidth: '12%',
  },

  externalPlayerIdColumn: {
    width: '10%',
    minWidth: '10%',
    maxWidth: '10%',
  },

  syncPanel: {
    width: '100%',
    minHeight: 0,
    height: '100%',
    display: 'grid',
    alignContent: 'start',
    justifyItems: 'stretch',
    gap: 1.25,
    p: { xs: 2, md: 3 },
    border: '1px solid #d5e1ef',
    borderRadius: 'md',
    overflowY: 'auto',
  },

  syncCards: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 1,
  },

  syncCard: {
    minWidth: 0,
    flex: {
      xs: '0 0 100%',
      sm: '0 0 calc(50% - 4px)',
      md: '0 0 calc(33.333% - 6px)',
      lg: '0 0 calc(25% - 6px)',
    },
  },

  syncCardContent: {
    height: '100%',
  },

  syncCardActive: {
    borderColor: devPlanColors.primary,
    boxShadow: '0 8px 18px rgba(23, 76, 123, 0.18)',
  },

  syncCardAction: {
    alignSelf: 'flex-start',
  },

  syncScope: {
    display: 'grid',
    gap: 0.45,
  },

  syncScopeHint: { color: 'neutral.500' },
  syncError: { maxWidth: 720 },
  syncRetryButton: { mt: 0.5 },
}