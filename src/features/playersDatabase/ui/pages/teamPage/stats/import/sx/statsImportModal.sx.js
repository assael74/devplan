// src/features/playersDatabase/ui/pages/teamPage/stats/import/sx/statsImportModal.sx.js

import { devPlanColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { importModalChromeSx } from '../../../../../components/modals/paste/sx/importModalChrome.sx.js'
import { leagueImportModalSx } from '../../../../../components/modals/paste/sx/leagueImportModal.sx.js'

export const statsImportModalSx = {
  // Keep the background-sync step visually identical to League import.
  syncPanel: leagueImportModalSx.syncPanel,
  syncHeading: leagueImportModalSx.syncHeading,
  syncDescription: leagueImportModalSx.syncDescription,
  syncScope: leagueImportModalSx.syncScope,
  syncScopeHint: leagueImportModalSx.syncScopeHint,
  syncError: leagueImportModalSx.syncError,
  syncRetryButton: leagueImportModalSx.syncRetryButton,
  modalHeaderIcon: {
    ...importModalChromeSx.modalHeaderIcon,
    color: devPlanColors.tertiaryDark,

    '& svg': {
      fontSize: 28,
      color: `${devPlanColors.tertiaryDark} !important`,
    },
  },

  selectionPanel: {
    width: '100%',
    alignSelf: 'start',
    p: {
      xs: 1,
      md: 1.5,
    },
    display: 'grid',
    gap: 3.5,
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

  statsTypeCards: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },


  validationIssuesChip: {
    borderRadius: 999,
    minHeight: 23,
    px: 0.8,
    gap: 0.55,
    fontSize: 11,
    lineHeight: 1.2,

    '& .MuiChip-label': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.55,
      p: 0,
      whiteSpace: 'nowrap',
    },
  },

  validationInvalidChip: {
    boxShadow: 'inset 0 0 0 1px #f09a9a',
  },

  validationValidChip: {
    opacity: 0.82,
  },

  validationCheckWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
  },

  validationCheckLabel: {
    color: 'neutral.800',
    fontWeight: 700,
  },

  validationCheckValue: {
    fontWeight: 600,
  },

  validationAdjustmentAction: {
    minHeight: 21,
    px: 0.65,
    fontSize: 10,
    fontWeight: 700,
  },

  rosterExceptionsChip: {
    borderRadius: 999,
    minHeight: 23,
    px: 0.85,
    fontSize: 11,
    fontWeight: 700,
  },
}
