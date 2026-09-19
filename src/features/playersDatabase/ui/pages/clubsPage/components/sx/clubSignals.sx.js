// src/features/playersDatabase/ui/pages/clubsPage/components/sx/clubSignals.sx.js
import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const clubSignalsSx = {
  summarySpotlightContent: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    gap: 0.75,
  },

  summarySpotlightCopy: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.25,
  },

  summarySpotlightSignalLine: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  summarySpotlightSignalIcon: {
    width: 42,
    height: 42,
    flex: '0 0 auto',
    objectFit: 'contain',
    alignSelf: 'center',
  },

  summarySpotlightTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
    fontSize: 15,
    lineHeight: 1.25,
    minWidth: 0,
  },

  summarySpotlightDirectionWord: {
    fontWeight: 700,
  },

  summarySpotlightDirectionRise: {
    color: 'success.500',
  },

  summarySpotlightDirectionDrop: {
    color: 'warning.500',
  },

  summarySpotlightDirectionBelow: {
    color: 'danger.600',
  },

  summarySpotlightTeamIdentity: {
    color: 'neutral.500',
    fontWeight: 700,
    fontSize: 12,
  },

  summarySpotlightTeamIdentities: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.5,
  },

  summarySpotlightTeamIdentityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  summarySpotlightTeamIdentitySeparator: {
    color: 'neutral.500',
    fontSize: 12,
  },

  summarySpotlightAdditionalTeams: {
    '--Chip-minHeight': '20px',
    '--Chip-paddingInline': '6px',
    border: '1px solid',
    borderColor: 'neutral.300',
    fontSize: 11,
    fontWeight: 800,
  },

  summarySpotlightEmpty: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  summarySpotlightNoSignal: {
    color: 'neutral.500',
    fontWeight: 700,
    fontSize: 12,
  },

  summarySpotlightCoverageContent: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.75,
  },

  summarySpotlightCoverageIcon: {
    width: 42,
    height: 42,
    flex: '0 0 auto',
    objectFit: 'contain',
  },

  summarySpotlightCoverageCopy: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.25,
  },

  summarySpotlightCoverageTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
    fontSize: 14,
    lineHeight: 1.25,
  },

  summarySpotlightCoverageAction: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.75,
  },

  summarySpotlightCoverageActionChip: {
    px: 0.75,
    fontWeight: 700,
  },

  summarySpotlightCoverageActionText: {
    color: 'neutral.500',
    fontWeight: 700,
    fontSize: 12,
  },

  ageGroupSignalCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
  },

  ageGroupSignalFocusCards: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 1,
  },

  ageGroupSignalAdditionalCards: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  ageGroupSignalCard: {
    minWidth: 0,
    border: '1px solid',
    borderColor: 'neutral.200',
    borderRadius: 'sm',
    bgcolor: 'background.surface',
    overflow: 'hidden',
  },

  ageGroupSignalFocusCard: {
    borderColor: 'primary.300',
    boxShadow: 'sm',
  },

  ageGroupSignalCardHeader: {
    minWidth: 0,
    px: 1,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'neutral.100',
  },

  ageGroupSignalCardIdentity: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.5,
  },

  ageGroupSignalCardTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
    fontSize: 13,
  },

  ageGroupSignalBirthYear: {
    color: 'neutral.500',
    fontSize: 11,
    fontWeight: 600,
    minHeight: 19,
    px: 0.55,
  },

  ageGroupSignalMeta: {
    flex: '0 0 auto',
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    fontSize: 10,
    whiteSpace: 'nowrap',
  },

  ageGroupSignalSection: {
    minWidth: 0,
    px: 1,
    pt: 0.75,
    pb: 0.85,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0.4,
  },

  ageGroupSignalSectionLabel: {
    color: 'neutral.500',
    fontWeight: 700,
    fontSize: 10,
  },

  ageGroupSignalContent: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  ageGroupSignalIcon: {
    width: 30,
    height: 30,
    flex: '0 0 auto',
    objectFit: 'contain',
  },

  ageGroupSignalTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 800,
    fontSize: 13,
    lineHeight: 1.25,
  },

  ageGroupSignalEmpty: {
    color: 'neutral.500',
    fontWeight: 700,
    fontSize: 12,
  },

  ageGroupSignalCoverage: {
    minWidth: 0,
    px: 1,
    pb: 0.85,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0.35,
  },

  ageGroupSignalCoverageMessage: {
    minWidth: 0,
    width: '100%',
    px: 0.75,
    py: 0.45,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.45,
    borderRadius: 'sm',
    bgcolor: 'neutral.100',
  },

  ageGroupSignalCoverageTitle: {
    color: 'neutral.500',
    fontSize: 10,
    fontWeight: 700,
  },

  ageGroupSignalCoverageDetail: {
    color: devPlanColors.primaryDark,
    fontSize: 10,
    fontWeight: 700,
  },

}
