// src/features/playersDatabase/ui/pages/playerPage/sx/playerScoutOverview.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const softBorder = `1px solid ${devPlanColors.border}`

export const playerScoutOverviewSx = {
  panel: {
    flexShrink: 0,
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
  },

  content: {
    p: 1,
    gap: 0.8,
    overflow: 'visible',
  },

  decisionBar: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'minmax(0, 1fr) minmax(0, 1fr) minmax(290px, 1.12fr)',
    },
    gap: 0.65,
    alignItems: 'stretch',
  },

  decisionSignal: {
    minWidth: 0,
    minHeight: 96,
    px: 1,
    py: 0.85,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 9,
    bgcolor: '#fff',
    border: softBorder,
  },

  decisionTone: {
    immediate: {
      bgcolor: '#fff5f5',
      borderColor: '#f3c8c8',
    },
    priority: {
      bgcolor: '#fff9ef',
      borderColor: '#ecd8aa',
    },
    watch: {
      bgcolor: '#f7fbff',
      borderColor: '#d6e7f3',
    },
    exposed: {
      bgcolor: '#f4f2ff',
      borderColor: '#ddd6fe',
    },
    unknown: {
      bgcolor: '#f8fafc',
    },
    success: {
      bgcolor: '#f2fbf6',
      borderColor: '#cfe9da',
    },
    warning: {
      bgcolor: '#fff9ef',
      borderColor: '#ecd8aa',
    },
    info: {
      bgcolor: '#f4f9fd',
      borderColor: '#d4e5f1',
    },
    depth: {
      bgcolor: '#f7f6fd',
      borderColor: '#ddd9ee',
    },
  },

  decisionSignalHeader: {
    minHeight: 26,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
  },

  decisionSignalIcon: {
    width: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: 'rgba(255,255,255,0.82)',
    color: devPlanColors.primary,
    border: '1px solid rgba(214,224,231,0.9)',
    flexShrink: 0,
  },

  decisionSignalLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  decisionSignalBody: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  decisionPrimaryValue: {
    mt: 0.4,
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 20,
      md: 22,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  dataDepthPrimaryValue: {
    mt: 0.4,
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 20,
      md: 22,
    },
    lineHeight: 1.05,
    fontWeight: 700,
  },

  decisionSignalNote: {
    mt: 0.35,
    minHeight: 0,
    color: devPlanColors.secondary,
    lineHeight: 1.45,
    whiteSpace: {
      xs: 'normal',
      lg: 'nowrap',
    },
  },

  reliabilityRow: {
    mt: 0.35,
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.6,
  },

  reliabilityScore: {
    color: devPlanColors.primaryDark,
    fontSize: {
      xs: 25,
      md: 28,
    },
    fontWeight: 700,
    lineHeight: 1,
  },

  reliabilityLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  sectionCard: {
    minWidth: 0,
    bgcolor: '#fff',
    border: softBorder,
    borderRadius: 9,
    overflow: 'hidden',
  },

  sectionHeader: {
    minWidth: 0,
    px: 1,
    py: 0.7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid #edf2f6',
  },

  sectionHeading: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.8,
  },

  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 7,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  },

  sectionIconTone: {
    info: {
      bgcolor: devPlanColors.tertiaryLight,
      color: devPlanColors.tertiaryDark,
    },
    context: {
      bgcolor: '#edf9f3',
      color: '#23805b',
    },
    path: {
      bgcolor: '#f1f3fb',
      color: '#536c9d',
    },
    profile: {
      bgcolor: '#F3F0FA',
      color: '#67538E',
    },
    question: {
      bgcolor: '#fff5df',
      color: '#9d6b16',
    },
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  sectionSubtitle: {
    mt: 0.1,
    color: devPlanColors.secondary,
    lineHeight: 1.4,
  },

  profilesBody: {
    px: 0.9,
    py: 0.65,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(260px, 0.92fr) minmax(0, 1.55fr) auto',
    },
    alignItems: 'stretch',
    gap: 0.65,
  },

  primaryProfileCard: {
    minWidth: 0,
    height: '100%',
    px: 0.85,
    py: 0.7,
    display: 'grid',
    gridTemplateColumns: '34px minmax(0, 1fr)',
    alignItems: 'center',
    gap: 0.65,
    borderRadius: 7,
    bgcolor: '#F7F5FC',
    border: '1px solid #DED8ED',
  },

  primaryProfileIcon: {
    width: 34,
    height: 34,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    bgcolor: '#FFFFFF',
    color: '#67538E',
    border: '1px solid #E4DEEF',
  },

  primaryProfileContent: {
    minWidth: 0,
  },

  profileEyebrow: {
    color: '#75678D',
    fontWeight: 700,
  },

  primaryProfileTitle: {
    mt: 0.05,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  profileMeta: {
    mt: 0.3,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    flexWrap: 'wrap',
  },

  profileMetaText: {
    color: devPlanColors.secondary,
  },

  supportingProfiles: {
    minWidth: 0,
    height: '100%',
    px: 0.8,
    py: 0.6,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 7,
    bgcolor: '#FBFCFD',
    border: '1px solid #E5ECF1',
  },

  profileGroupLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  profileChipRow: {
    mt: 0.4,
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    flexWrap: 'wrap',
  },

  supportingProfileChip: {
    maxWidth: '100%',
    fontWeight: 700,
  },

  nearProfileCompact: {
    minWidth: 185,
    height: '100%',
    px: 0.8,
    py: 0.6,
    display: 'grid',
    gridTemplateColumns: '32px minmax(0, 1fr)',
    alignItems: 'center',
    gap: 0.7,
    borderRadius: 7,
    bgcolor: '#F5FAFD',
    border: '1px solid #D9E8F1',
  },

  nearProfileCompactIcon: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: '#FFFFFF',
    color: devPlanColors.tertiaryDark,
    border: '1px solid #DCE8EF',
  },

  nearProfileCompactText: {
    minWidth: 0,
  },

  nearProfileCompactTitle: {
    mt: 0.15,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  reasonGrid: {
    p: 1.1,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  reasonCard: {
    minWidth: 0,
    p: 1,
    display: 'grid',
    gridTemplateColumns: '34px minmax(0, 1fr)',
    gap: 0.8,
    borderRadius: 7,
    bgcolor: '#fbfdfe',
    border: '1px solid #e3ebf0',
  },

  reasonCardStrong: {
    bgcolor: '#f5fbf8',
    borderColor: '#d7eadf',
  },

  reasonIcon: {
    width: 34,
    height: 34,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 9,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
  },

  reasonBody: {
    minWidth: 0,
  },

  reasonTitle: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  reasonValueRow: {
    mt: 0.35,
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.5,
  },

  reasonValue: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    lineHeight: 1,
  },

  reasonUnit: {
    color: devPlanColors.secondary,
  },

  reasonMeta: {
    mt: 0.6,
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    flexWrap: 'wrap',
  },

  reasonSupplement: {
    color: devPlanColors.secondary,
  },


  whyProfileSummary: {
    px: 1,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    bgcolor: '#F7FAFC',
  },

  whyProfileIdentity: {
    minWidth: 0,
  },

  whyProfileEyebrow: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  whyProfileName: {
    mt: 0.05,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  whyProfileMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  whyEvidenceGrid: {
    p: 0.9,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
      xl: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.65,
  },

  whyEvidenceCard: {
    minWidth: 0,
    p: 0.85,
    borderRadius: 7,
    bgcolor: '#FBFDFE',
    border: '1px solid #E2EAF0',
  },

  whyEvidenceTop: {
    display: 'grid',
    gridTemplateColumns: '30px minmax(0, 1fr)',
    alignItems: 'center',
    gap: 0.65,
  },

  whyEvidenceIcon: {
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primary,
  },

  whyEvidenceHeading: {
    minWidth: 0,
  },

  whyEvidenceTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    lineHeight: 1.25,
  },

  whyEvidenceMetric: {
    mt: 0.05,
    color: devPlanColors.secondary,
  },

  whyEvidenceValueRow: {
    mt: 0.55,
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.45,
  },

  whyEvidenceValue: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    lineHeight: 1,
  },

  whyEvidenceUnit: {
    color: devPlanColors.secondary,
  },

  whyRuleRow: {
    mt: 0.6,
    pt: 0.55,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 0.6,
  },

  whyRuleLabel: {
    color: devPlanColors.secondary,
    flexShrink: 0,
  },

  whyRuleValue: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    textAlign: 'left',
  },

  whyEvidenceMeta: {
    mt: 0.55,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  whyEvidenceSupplement: {
    color: devPlanColors.secondary,
  },

  detailGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      xl: 'minmax(0, 1.08fr) minmax(360px, 0.92fr)',
    },
    gap: 1.15,
    alignItems: 'start',
  },

  contextChips: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },

  contextColumns: {
    p: 1.1,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
    },
    gap: 0.65,
  },

  contextGroup: {
    minWidth: 0,
    p: 0.95,
    borderRadius: 7,
    bgcolor: '#fafcfd',
    border: '1px solid #e7eef3',
  },

  contextGroupPlayer: {
    bgcolor: '#F5FBF8',
    borderColor: '#D7EADF',
  },

  contextEntityHeader: {
    mb: 0.85,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  contextAvatar: {
    width: 38,
    height: 38,
    display: 'block',
    objectFit: 'cover',
    borderRadius: 9,
    border: `1px solid ${devPlanColors.border}`,
    bgcolor: '#fff',
  },

  contextEntityText: {
    minWidth: 0,
  },

  contextEntityTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  contextEntitySub: {
    mt: 0.1,
    color: devPlanColors.secondary,
  },

  contextGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 0.6,
  },

  contextItem: {
    minWidth: 0,
    px: 0.75,
    py: 0.7,
    borderRadius: 7,
    bgcolor: '#fff',
    border: '1px solid #e5edf2',
  },

  contextLabel: {
    color: devPlanColors.secondary,
  },

  contextValue: {
    mt: 0.15,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  contextNote: {
    mt: 0.25,
    color: devPlanColors.secondary,
    lineHeight: 1.35,
  },

  contextEmptyText: {
    color: devPlanColors.secondary,
    lineHeight: 1.5,
  },


  pathInsight: {
    mx: 1.1,
    mt: 1,
    px: 0.9,
    py: 0.7,
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    border: '1px solid #D8E9F4',
  },

  pathInsightIcon: {
    width: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: '#FFFFFF',
    color: devPlanColors.tertiaryDark,
    flexShrink: 0,
  },

  pathInsightText: {
    color: '#38586F',
    lineHeight: 1.4,
  },

  pathInsightLabel: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  pathGrid: {
    p: 1.1,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.75,
  },

  pathGridEmerging: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },

  pathItem: {
    minWidth: 0,
    p: 0.95,
    borderRadius: 7,
    bgcolor: '#fafcfd',
    border: '1px solid #e4edf2',
  },

  pathTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.7,
  },

  pathAvatar: {
    width: 34,
    height: 34,
    display: 'block',
    objectFit: 'cover',
    borderRadius: 7,
    border: `1px solid ${devPlanColors.border}`,
  },

  pathHeadingText: {
    minWidth: 0,
  },

  pathSeason: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  pathTeam: {
    mt: 0.05,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  pathMain: {
    mt: 0.4,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  pathSub: {
    mt: 0.25,
    color: devPlanColors.secondary,
    lineHeight: 1.4,
  },

  pathEmptyState: {
    p: 1.15,
    display: 'flex',
    alignItems: 'center',
    gap: 0.8,
  },

  pathEmptyIcon: {
    width: 34,
    height: 34,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 9,
    bgcolor: '#f1f3fb',
    color: '#536c9d',
    flexShrink: 0,
  },

  pathEmptyTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  nearProfileRow: {
    mx: 1.1,
    mb: 1.1,
    px: 1,
    py: 0.85,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    border: '1px solid #d8e9f4',
  },

  nearProfileText: {
    minWidth: 0,
  },

  nearProfileTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  nearProfileSub: {
    mt: 0.15,
    color: devPlanColors.secondary,
  },

  bottomDecisionGrid: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: 'minmax(0, 1fr) minmax(0, 1.2fr)',
    },
    gap: 1.15,
  },

  bottomDecisionCard: {
    minWidth: 0,
    p: 1.15,
    borderRadius: 9,
    border: softBorder,
  },

  questionsCard: {
    bgcolor: '#fffaf1',
    borderColor: '#eadbb7',
  },

  actionCard: {
    bgcolor: '#f3fbf6',
    borderColor: '#cfe8d8',
  },

  bottomDecisionHeader: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  bottomDecisionHeading: {
    minWidth: 0,
    flex: 1,
  },

  openQuestionsList: {
    mt: 0.9,
    display: 'grid',
    gap: 0.55,
  },

  openQuestionRow: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '24px minmax(0, 1fr)',
    alignItems: 'center',
    gap: 0.65,
  },

  questionBullet: {
    width: 24,
    height: 24,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    fontSize: 11,
    fontWeight: 700,
  },

  questionDone: {
    bgcolor: '#eaf7f0',
    color: '#20845a',
  },

  questionOpen: {
    bgcolor: '#fff0c9',
    color: '#9d6b16',
  },

  questionLabel: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  bottomEmptyText: {
    mt: 0.9,
    color: devPlanColors.secondary,
    lineHeight: 1.5,
  },

  actionIcon: {
    bgcolor: '#e4f6eb',
    color: '#23805b',
  },

  actionTitle: {
    color: '#176c49',
    fontWeight: 700,
  },

  actionEyebrow: {
    mt: 0.1,
    color: '#52806c',
  },

  nextActionTitle: {
    mt: 1,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  nextActionDescription: {
    mt: 0.3,
    color: '#527064',
    lineHeight: 1.5,
  },

  emptyText: {
    p: 1.15,
    color: devPlanColors.secondary,
    lineHeight: 1.5,
  },

  storyModalContent: {
    p: 0,
  },

  storyModalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    p: 1.25,
  },

  storyLead: {
    p: 1.25,
    borderRadius: 7,
    bgcolor: devPlanColors.primaryLight,
    border: '1px solid #d7e8f4',
  },

  storyParagraph: {
    px: 0.35,
    py: 0.75,
  },

  storyModalText: {
    color: '#38586f',
    lineHeight: 1.8,
  },

  questionsHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    marginInlineStart: 'auto',
  },
}
