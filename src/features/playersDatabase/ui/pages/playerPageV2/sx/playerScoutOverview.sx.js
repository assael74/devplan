// src/features/playersDatabase/ui/pages/playerPage/sx/playerScoutOverview.sx.js

import { COLORS, devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

const softBorder = `1px solid ${devPlanColors.border}`

export const playerScoutOverviewSx = {
  panel: {
    flexShrink: 0,
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.45,
    flexWrap: 'wrap',
  },

  headerIconButton: {
    width: 30,
    minWidth: 30,
    height: 30,
    minHeight: 30,
    borderColor: devPlanColors.border,
    color: devPlanColors.tertiaryDark,
    bgcolor: devPlanColors.surface,

    '&:hover': {
      bgcolor: devPlanColors.tertiaryLight,
      borderColor: devPlanColors.tertiary,
    },
  },

  content: {
    p: 1,
    gap: 1.05,
    overflow: 'visible',
  },


  seasonContextBar: {
    minWidth: 0,
    px: 1,
    py: 0.75,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderRadius: 10,
    border: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.primaryLight,
    boxShadow: '0 3px 10px rgba(23, 59, 87, 0.05)',
  },

  seasonContextHeading: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
  },

  seasonContextIcon: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.tertiaryDark,
    border: `1px solid ${devPlanColors.border}`,
  },

  seasonContextTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  sectionBandHeader: {
    minWidth: 0,
    px: 1,
    py: 0.7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: `1px solid ${devPlanColors.border}`,
    bgcolor: COLORS.entity.team.bg,
  },

  sectionBandTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  sectionBandSubtitle: {
    mt: 0.05,
    color: devPlanColors.secondary,
  },

  sectionBandIndex: {
    minWidth: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.tertiaryDark,
    border: `1px solid ${devPlanColors.border}`,
    fontWeight: 700,
  },

  seasonProfilesSection: {
    minWidth: 0,
    borderRadius: 10,
    border: `1px solid ${COLORS.entity.scouting.accent}`,
    bgcolor: COLORS.entity.scouting.surface,
    overflow: 'hidden',
    boxShadow: '0 5px 16px rgba(124, 58, 237, 0.08)',
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

  profileWorkspaceTop: {
    minWidth: 0,
    px: 1,
    py: 0.8,
    bgcolor: COLORS.entity.scouting.bg,
    borderBottom: `1px solid ${COLORS.entity.scouting.accent}`,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: '260px minmax(0, 1fr)',
    },
    alignItems: 'start',
    gap: 0.8,
  },

  profileWorkspaceHeading: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.8,
    whiteSpace: 'nowrap',
  },

  profileWorkspaceTitleRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    whiteSpace: 'nowrap',
  },

  profileCountText: {
    color: devPlanColors.secondary,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  profileTabsRow: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: 0.55,
  },

  profileTabWrap: {
    minWidth: 0,
    maxWidth: '100%',
  },

  profileWorkspaceDetail: {
    minWidth: 0,
    bgcolor: devPlanColors.surface,
  },

  profileDetailHeader: {
    minWidth: 0,
    px: 1,
    py: 0.55,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  profileDetailTitleCompact: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
  },

  profileDetailTitle: {
    color: devPlanColors.secondary,
    fontWeight: 700,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
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

  whyEvidenceGrid: count => ({
    p: 0.8,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: Number(count) > 1 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
      lg: 'repeat(3, minmax(0, 1fr))',
    },
    gap: 0.7,
    alignItems: 'stretch',
  }),

  whyEvidenceCard: {
    minWidth: 0,
    minHeight: 126,
    p: 0.8,
    display: 'grid',
    gridTemplateRows: 'auto auto auto 1fr',
    alignContent: 'start',
    borderRadius: 7,
    bgcolor: devPlanColors.surface,
    border: `1px solid ${devPlanColors.tertiary}` ,
    boxShadow: '0 4px 12px rgba(23, 107, 166, 0.08)',
  },

  whyEvidenceIdentity: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '28px minmax(0, 1fr)',
    alignItems: 'center',
    gap: 0.55,
  },

  whyEvidenceTop: {
    display: 'grid',
    gridTemplateColumns: '30px minmax(0, 1fr)',
    alignItems: 'center',
    gap: 0.65,
  },

  whyEvidenceIcon: {
    width: 28,
    height: 28,
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
    lineHeight: 1.2,
  },

  whyEvidenceMetric: {
    mt: 0.05,
    color: devPlanColors.secondary,
  },

  whyEvidenceValueRow: {
    mt: 0.35,
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.45,
  },

  whyEvidenceValue: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
    lineHeight: 1,
    fontSize: 24,
  },

  whyEvidenceUnit: {
    color: devPlanColors.secondary,
  },

  whyRuleCompact: {
    mt: 0.35,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 0.55,
    minWidth: 0,
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
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  whyEvidenceMeta: {
    mt: 0.4,
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
    boxShadow: '0 4px 14px rgba(157, 107, 22, 0.08)',
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

  storyModalActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexWrap: 'wrap',
    px: 1.25,
    pt: 1,
    pb: 0.25,
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

  heroCard: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      lg: '220px minmax(0, 1fr)',
    },
    gap: 0.8,
    p: 0.8,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
    border: `1px solid ${devPlanColors.border}`,
    boxShadow: '0 8px 24px rgba(23, 59, 87, 0.06)',
  },

  heroDecisionRail: {
    display: 'grid',
    gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
    gap: 0.65,
  },

  heroDecisionItem: tone => ({
    minWidth: 0,
    p: 1,
    borderRadius: 8,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
    bgcolor: tone?.bg || devPlanColors.secondaryLight,
  }),

  heroDecisionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
  },

  heroDecisionIcon: tone => ({
    width: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: '#FFFFFFCC',
    color: tone?.icon || devPlanColors.primary,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
  }),

  heroDecisionLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  decisionInfoButton: tone => ({
    width: 30,
    minWidth: 30,
    height: 30,
    minHeight: 30,
    marginInlineStart: 'auto',
    color: tone?.icon || devPlanColors.secondary,
    bgcolor: '#FFFFFFD9',
    border: `1px solid ${tone?.border || devPlanColors.border}`,
    boxShadow: '0 2px 6px rgba(23, 59, 87, 0.08)',

    '&:hover': {
      color: tone?.text || devPlanColors.tertiaryDark,
      bgcolor: '#FFFFFF',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 10px rgba(23, 59, 87, 0.14)',
    },
  }),

  heroDecisionValue: tone => ({
    mt: 0.65,
    color: tone?.text || devPlanColors.primaryDark,
    fontSize: 25,
    lineHeight: 1.05,
    fontWeight: 700,
  }),

  heroDecisionNote: {
    mt: 0.35,
    color: devPlanColors.secondary,
  },

  immediacyModalBody: {
    display: 'grid',
    gap: 1,
    p: 1,
  },

  immediacyStatusFlow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 64px minmax(0, 1fr)',
    alignItems: 'center',
    gap: 0.75,
  },

  immediacyStatusItem: tone => ({
    minWidth: 0,
    p: 0.72,
    borderRadius: 8,
    bgcolor: tone?.bg || devPlanColors.secondaryLight,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
  }),

  immediacyModalLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  immediacyModalValue: tone => ({
    mt: 0.2,
    color: tone?.text || devPlanColors.primaryDark,
    fontWeight: 700,
  }),

  immediacyFlowScore: tone => ({
    width: 58,
    height: 58,
    display: 'grid',
    placeItems: 'center',
    alignContent: 'center',
    borderRadius: '50%',
    bgcolor: tone?.bg || devPlanColors.tertiaryLight,
    color: tone?.text || devPlanColors.tertiaryDark,
    border: `2px solid ${tone?.border || devPlanColors.border}`,
    fontWeight: 700,
  }),

  immediacyModalReasons: {
    display: 'grid',
    gap: 0.65,
  },

  immediacyModalReason: tone => ({
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.75,
    p: 0.8,
    borderRadius: 8,
    bgcolor: tone?.bg || devPlanColors.tertiaryLight,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
  }),

  immediacyModalReasonIcon: tone => ({
    width: 36,
    height: 36,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 9,
    bgcolor: '#FFFFFFD9',
    color: tone?.icon || devPlanColors.tertiaryDark,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
  }),

  immediacyModalReasonText: {
    color: devPlanColors.primaryDark,
    lineHeight: 1.45,
    fontWeight: 700,
  },

  immediacyFactorPoints: tone => ({
    minWidth: 48,
    px: 0.8,
    py: 0.45,
    borderRadius: 999,
    textAlign: 'center',
    bgcolor: '#FFFFFFD9',
    color: tone?.text || devPlanColors.primaryDark,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
    fontSize: 13,
    fontWeight: 700,
  }),

  immediacyScoreSummary: tone => ({
    display: 'grid',
    gridTemplateColumns: {
      xs: 'repeat(2, minmax(0, 1fr))',
      sm: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 0.6,
    p: 0.8,
    borderRadius: 8,
    bgcolor: tone?.bg || devPlanColors.secondaryLight,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
  }),

  immediacyScoreValue: {
    mt: 0.15,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  immediacyModalEmpty: {
    color: devPlanColors.secondary,
  },

  immediacyManualBox: {
    display: 'grid',
    justifyItems: 'start',
    gap: 0.45,
    p: 0.8,
    borderRadius: 8,
    bgcolor: '#FFFBEB',
    border: '1px solid #F3D89D',
  },

  strengthModalBody: {
    display: 'grid',
    gap: 1,
    p: 1,
  },

  strengthModalHeadline: tone => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    p: 0.9,
    borderRadius: 8,
    bgcolor: tone?.bg || devPlanColors.secondaryLight,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
  }),

  strengthProfileLabel: {
    mt: 0.2,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  strengthDepthBadge: tone => ({
    flexShrink: 0,
    px: 1,
    py: 0.65,
    borderRadius: 999,
    bgcolor: '#FFFFFFD9',
    color: tone?.text || devPlanColors.primaryDark,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
    fontWeight: 700,
  }),

  strengthRules: {
    display: 'grid',
    gap: 0.65,
  },

  strengthRule: {
    display: 'grid',
    gridTemplateColumns: '38px minmax(0, 1fr)',
    gap: 0.75,
    alignItems: 'start',
    p: 0.85,
    borderRadius: 8,
    bgcolor: devPlanColors.surface,
    border: `1px solid ${devPlanColors.border}`,
  },

  strengthRuleIcon: tone => ({
    width: 38,
    height: 38,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 9,
    bgcolor: tone?.bg || devPlanColors.secondaryLight,
    color: tone?.icon || devPlanColors.primary,
    border: `1px solid ${tone?.border || devPlanColors.border}`,
  }),

  strengthRuleBody: {
    minWidth: 0,
  },

  strengthRuleTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  strengthRuleValues: {
    mt: 0.65,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 0.55,
  },

  strengthRuleValue: {
    mt: 0.1,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  strengthFootnote: {
    color: devPlanColors.secondary,
    lineHeight: 1.45,
  },

  heroNarrative: {
    minWidth: 0,
    p: 1.15,
    borderRadius: 8,
    bgcolor: devPlanColors.primaryLight,
    border: '1px solid #D6E5EE',
    display: 'flex',
    flexDirection: 'column',
  },

  heroNarrativeTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  heroEyebrow: {
    color: devPlanColors.tertiaryDark,
    fontWeight: 700,
  },

  heroTitle: {
    mt: 0.15,
    color: devPlanColors.primaryDark,
    fontSize: { xs: 22, md: 28 },
    lineHeight: 1.2,
    fontWeight: 700,
  },

  heroSummary: {
    mt: 0.7,
    color: '#36566D',
    lineHeight: 1.65,
    maxWidth: 900,
  },

  immediacyReasons: {
    mt: 0.85,
    pt: 0.75,
    borderTop: '1px solid #CFE0EB',
  },

  immediacyReasonsLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  immediacyReasonChips: {
    mt: 0.45,
    display: 'flex',
    gap: 0.45,
    flexWrap: 'wrap',
  },

  manualReasonText: {
    mt: 0.45,
    color: '#7C5C1E',
  },

  heroFooter: {
    mt: 'auto',
    pt: 0.9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  heroBasis: {
    color: devPlanColors.secondary,
  },

  heroActions: {
    display: 'flex',
    gap: 0.6,
  },

  numbersCard: {
    borderRadius: 10,
    border: `1px solid ${devPlanColors.tertiary}`,
    bgcolor: devPlanColors.surface,
    overflow: 'hidden',
    boxShadow: '0 4px 14px rgba(28, 58, 79, 0.07)',
  },

  numbersHeader: {
    px: 1.1,
    py: 0.8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.tertiaryLight,
  },

  numbersHeading: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.7,
  },

  numbersHeadingIcon: {
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    bgcolor: devPlanColors.tertiaryLight,
    color: devPlanColors.tertiaryDark,
  },

  contextSelect: {
    minWidth: { xs: 240, md: 390 },
    maxWidth: 520,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    borderColor: devPlanColors.border,
    fontWeight: 700,
  },

  numbersBody: {
    display: 'grid',
    gridTemplateColumns: '1fr',
  },

  numberGroup: {
    minWidth: 0,
    p: 0.9,
  },

  numberGroupTeam: {
    bgcolor: '#F5FAFD',
    borderBottom: `1px solid ${devPlanColors.border}`,
  },

  numberGroupPlayer: {
    bgcolor: '#F8FCFA',
  },

  numberGroupHeader: {
    mb: 0.7,
    display: 'grid',
    gridTemplateColumns: '40px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.7,
  },

  numberGroupHeaderCompact: {
    mb: 0.6,
    display: 'flex',
    alignItems: 'baseline',
    gap: 0.7,
  },

  numberGroupAvatar: {
    width: 40,
    height: 40,
    display: 'block',
    objectFit: 'cover',
    borderRadius: 9,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.border}`,
  },

  numberGroupIdentity: {
    minWidth: 0,
  },

  numberGroupEntityTitle: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  numberGroupEntitySub: {
    color: devPlanColors.secondary,
  },

  numberGroupBadge: {
    px: 0.7,
    py: 0.3,
    borderRadius: 999,
    bgcolor: devPlanColors.surface,
    color: devPlanColors.tertiaryDark,
    border: `1px solid ${devPlanColors.border}`,
    fontWeight: 700,
  },

  numberGridPlayer: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 0.5,
  },

  numberGridTeam: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 0.5,
  },

  numberStatItem: {
    minWidth: 0,
    p: 0.7,
    borderRadius: 7,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.border}`,
    textAlign: 'center',
  },

  numberStatLabel: {
    color: devPlanColors.secondary,
  },

  numberStatValue: {
    mt: 0.15,
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  profileStrip: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: 'auto minmax(0, 1fr) auto' },
    gap: 0.8,
    alignItems: 'center',
    p: 0.75,
    borderRadius: 9,
    bgcolor: '#FAFBFC',
    border: `1px solid ${devPlanColors.border}`,
  },

  profileStripPrimary: {
    display: 'grid',
    gap: 0.4,
  },

  profileStripSupporting: {
    minWidth: 0,
    display: 'grid',
    gap: 0.4,
  },

  profileStripNear: {
    display: 'grid',
    gap: 0.4,
  },

  profileStripLabel: {
    color: devPlanColors.secondary,
    fontWeight: 700,
  },

  profileStripEmpty: {
    p: 0.8,
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    borderRadius: 8,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
    border: `1px solid ${devPlanColors.border}`,
  },

  profileTooltip: {
    maxWidth: 260,
  },

  profileTooltipTitle: {
    color: 'inherit',
    fontWeight: 700,
  },

  profileTooltipText: {
    mt: 0.35,
    color: 'inherit',
    lineHeight: 1.45,
  },

  questionText: {
    minWidth: 0,
  },

  questionMeta: {
    mt: 0.1,
    color: devPlanColors.secondary,
  },

  nextActionsList: {
    mt: 0.85,
    display: 'grid',
    gap: 0.65,
  },

  nextActionItem: {
    display: 'grid',
    gridTemplateColumns: '28px minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: 0.7,
    p: 0.7,
    borderRadius: 7,
    bgcolor: '#FFFFFFCC',
    border: '1px solid #D9E9DF',
  },

  nextActionIndex: {
    width: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 999,
    bgcolor: '#E4F6EB',
    color: '#176C49',
    fontWeight: 700,
  },

  nextActionBody: {
    minWidth: 0,
  },

}
