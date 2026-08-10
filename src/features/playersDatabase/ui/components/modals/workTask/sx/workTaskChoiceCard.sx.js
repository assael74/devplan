// src/features/playersDatabase/ui/components/modals/workTask/sx/workTaskChoiceCard.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const workTaskChoiceCardSx = {
  routeCard: {
      minWidth: 0,
      minHeight: 116,
      p: 1.25,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 0.45,
      borderRadius: 10,
      textAlign: 'left',
    },

  routeCardSelected: {
      borderColor: devPlanColors.tertiaryDark,
      bgcolor: devPlanColors.tertiaryLight,
      boxShadow: `0 0 0 1px ${devPlanColors.tertiaryDark}`,
    },

  routeCardTitle: {
      color: devPlanColors.primaryDark,
      fontSize: 16,
      fontWeight: 700,
    },

  routeCardDescription: {
      color: devPlanColors.secondary,
      lineHeight: 1.45,
    },

  levelCard: {
      minWidth: 0,
      minHeight: 0,
      p: 0.5,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      gap: 0,
      borderRadius: 10,
      textAlign: 'left',
      '--Button-gap': '0px',
      '--Button-paddingInline': '0px',
    },

  levelCardSelected: {
      borderColor: devPlanColors.tertiaryDark,
      bgcolor: devPlanColors.tertiaryLight,
    },

  levelCardTitle: {
      minWidth: 0,
      width: '100%',
      px: 0.85,
      py: 0.55,
      color: devPlanColors.primaryDark,
      fontSize: 14,
      fontWeight: 700,
    },

  levelSeasonList: {
      minWidth: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.75,
      pt: 0.5,
    },

  levelSeasonRow: {
      minWidth: 0,
      width: '100%',
      px: 0.35,
      py: 0.3,
      display: 'flex',
      alignItems: 'center',
      gap: 0.75,
    },

  levelSeasonMain: {
      minWidth: 0,
      flex: '0 0 auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.45,
    },

  levelSeasonName: {
      minWidth: 0,
      color: devPlanColors.primaryDark,
      fontSize: 13,
      fontWeight: 700,
    },

  levelSeasonStatus: {
      minWidth: 0,
      flex: 1,
      width: 'auto',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: devPlanColors.secondary,
      lineHeight: 1.35,
    },

  levelStatusIcon: {
      flex: '0 0 20px',
      width: 20,
      height: 20,
      display: 'grid',
      placeItems: 'center',
      borderRadius: '50%',
      fontSize: 12,
      fontWeight: 700,
    },

  levelStatusIconSuccess: {
      bgcolor: '#ECFDF5',
      color: '#16A34A',
    },

  levelStatusIconDanger: {
      bgcolor: '#FEF2F2',
      color: '#DC2626',
    },

  leagueCard: {
      minWidth: 0,
      minHeight: 100,
      p: 0.75,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'space-between',
      gap: 0.65,
      borderWidth: 1.5,
      borderColor: devPlanColors.tertiary,
      borderRadius: 10,
      bgcolor: devPlanColors.surface,
      textAlign: 'left',
      '--Button-gap': '0px',
      '--Button-paddingInline': '0px',
      '&:hover': {
        borderColor: devPlanColors.tertiaryDark,
        bgcolor: devPlanColors.tertiaryLight,
      },
    },

  leagueCardSelected: {
      borderWidth: 2,
      borderColor: devPlanColors.tertiaryDark,
      bgcolor: devPlanColors.tertiaryLight,
      boxShadow: `0 0 0 1px ${devPlanColors.tertiaryDark}`,
    },

  leagueCardDisabled: {
      opacity: 1,
      borderWidth: 1,
      borderColor: '#D9E4DC',
      bgcolor: '#F4F8F5',
      boxShadow: 'none',
      cursor: 'default',
      '&.Mui-disabled': {
        opacity: 1,
        color: 'inherit',
      },
    },

  leagueCardHead: {
      minWidth: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 0.75,
    },

  leagueName: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: devPlanColors.primaryDark,
      fontSize: 12.5,
      fontWeight: 700,
    },

  leagueSeasonWrap: {
      minWidth: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 0.75,
    },

  leagueSeasonLabel: {
      color: devPlanColors.secondary,
      fontSize: 11,
    },

  leagueSeasonValue: {
      color: devPlanColors.primaryDark,
      fontSize: 16,
      fontWeight: 700,
    },

  leagueCardFoot: {
      minWidth: 0,
      width: '100%',
      pt: 0.65,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0.75,
      borderTop: `1px solid ${devPlanColors.border}`,
    },

  leagueTaskLabel: {
      color: devPlanColors.secondary,
    },

  leagueAction: {
      color: devPlanColors.secondary,
      textAlign: 'left',
      fontWeight: 700,
    },

  leagueActionActive: {
      color: devPlanColors.tertiaryDark,
    },

  workChoiceCard: {
      minWidth: 0,
      width: {
        xs: '100%',
        sm: 'calc((100% - 0.75rem) / 2)',
        md: 'calc((100% - 1.5rem) / 3)',
      },
      flex: '0 0 auto',
      height: 88,
      minHeight: 88,
      p: 0.65,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      gap: 0.45,
      borderWidth: 1.5,
      borderColor: devPlanColors.border,
      borderRadius: 10,
      bgcolor: devPlanColors.surface,
      textAlign: 'left',
      '--Button-gap': '0px',
      '--Button-paddingInline': '0px',
      '&:hover': {
        borderColor: devPlanColors.tertiary,
        bgcolor: devPlanColors.tertiaryLight,
      },
      '&.Mui-disabled': {
        opacity: 0.58,
        borderColor: devPlanColors.border,
        bgcolor: devPlanColors.secondaryLight,
      },
    },

  workChoiceCardSelected: {
      borderWidth: 2,
      borderColor: devPlanColors.tertiaryDark,
      bgcolor: devPlanColors.tertiaryLight,
      boxShadow: `0 0 0 1px ${devPlanColors.tertiaryDark}`,
    },

  workChoiceHead: {
      minWidth: 0,
      width: '100%',
      minHeight: 24,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 0.6,
      flexShrink: 0,
    },

  workChoiceBody: {
      minWidth: 0,
      width: '100%',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
    },

  teamPrioritySignals: {
      minWidth: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 0.35,
    },

  teamPrioritySignal: {
      minWidth: 0,
      width: '100%',
      minHeight: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 0.35,
    },

  teamPriorityLabel: {
      color: devPlanColors.secondary,
      fontWeight: 700,
    },

  teamAppearanceLeague: {
      minWidth: 0,
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: devPlanColors.primaryDark,
      fontSize: 13,
      fontWeight: 700,
    },


  taskStateIcon: {
      width: 24,
      height: 24,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      borderRadius: '50%',
    },

  taskStateIconExists: {
      bgcolor: '#ECFDF5',
      color: '#16A34A',
    },

  taskStateIconMissing: {
      bgcolor: '#FEF2F2',
      color: '#DC2626',
    },

}
