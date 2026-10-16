// src/features/playersDatabase/ui/pages/teamPage/information/sx/teamInformation.sx.js
import { COLORS, devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

const INSIGHT_STATUS_COLORS = {
  significant: COLORS.status.warning,
  minor: COLORS.status.info,
  steady: COLORS.status.success,
  limited: COLORS.status.neutral,
  multiple: COLORS.status.warning,
  single: COLORS.status.info,
  none: COLORS.status.neutral,
  risk: COLORS.status.warning,
  upside: COLORS.status.success,
}

export const teamInformationSx = {
  rosterSelectionToolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, pb: 0.75 },
  workspaceHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0.5,
    p: 0.75,
    bgcolor: devPlanColors.surface,
    borderBottom: `1px solid ${devPlanColors.border}`,
  },

  workspaceBack: {
    flexShrink: 0,
  },

  workspaceDetail: {
    width: '100%',
    maxWidth: 1140,
    minWidth: 0,
    mx: 'auto',
    display: 'grid',
    alignContent: 'start',
    gap: 1.5,
    pb: 2,
  },

  insightBody: {
    display: 'grid',
    alignContent: 'start',
    gap: 1.5,
    minWidth: 0,
  },

  insightTitleRow: {
    position: 'sticky',
    top: 0,
    zIndex: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 1,
    px: 1,
    pt: 2.25,
    pb: 0.75,
    bgcolor: '#f7faff',
  },

  insightTitleMain: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: { xs: 'wrap', md: 'nowrap' },
    gap: 1,
  },

  insightTitle: {
    display: 'inline-flex',
    alignItems: 'center',
    direction: 'rtl',
    gap: 0.8,
    flexShrink: 0,
    color: devPlanColors.primaryDark,
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    '&::before': {
      content: '""',
      display: 'block',
      width: 3,
      height: 18,
      flexShrink: 0,
      borderRadius: 99,
      bgcolor: devPlanColors.tertiary,
    },
  },

  insightTitleActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
  },

  insightOverviewAction: {
    minWidth: 29,
    width: 29,
    minHeight: 29,
    height: 29,
    '& svg': { fontSize: 14 },
  },

  insightTitleAction: {
    minHeight: 29,
    px: 0.8,
    border: `1px solid ${devPlanColors.border}`,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.tertiaryDark,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    '--Button-gap': '4px',
    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
    },
    '& svg': { fontSize: 14 },
  },

  evidenceRow: {
    display: 'grid',
    gap: 0.5,
    p: 1.5,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 8,
    bgcolor: devPlanColors.surface,
  },

  rosterEntry: {
    width: 'fit-content',
    mx: 'auto',
  },

  sectionTiles: {
    width: '100%',
    maxWidth: 1140,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(2, minmax(0, 1fr))',
      lg: 'repeat(6, minmax(0, 1fr))',
    },
    gap: 1,
    mx: 'auto',
  },

  overviewRoster: {
    width: '100%',
    maxWidth: 1140,
    minWidth: 0,
    mx: 'auto',
  },

  sectionTile: {
    minWidth: 0,
    minHeight: 106,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    justifyItems: 'stretch',
    gap: 0.8,
    px: 1.25,
    py: 1,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 9,
    bgcolor: devPlanColors.surface,
    textAlign: 'start',
    boxShadow: '0 2px 8px rgba(17, 58, 90, 0.04)',
    transition: 'transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease, border-color 180ms ease',
    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
      boxShadow: '0 6px 16px rgba(17, 58, 90, 0.12)',
    },
    '@media (hover: hover) and (pointer: fine)': {
      '&:hover': { transform: 'translateY(-3px)' },
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '&:hover': { transform: 'none' },
    },
    '&:hover .team-insight-icon, &:focus-visible .team-insight-icon': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: COLORS.status.info.solid,
    },
    '&:focus-visible': {
      outline: `2px solid ${devPlanColors.primary}`,
      outlineOffset: 2,
    },
  },

  sectionTileFirstRow: {
    gridColumn: { lg: 'span 3' },
  },

  sectionTileSecondRow: {
    gridColumn: { lg: 'span 2' },
  },

  insightTileShadow: status => ({
    bgcolor: INSIGHT_STATUS_COLORS[status] === COLORS.status.warning
      ? COLORS.status.warning.softBg
      : devPlanColors.surface,
    boxShadow: status === 'none' || status === 'limited'
      ? '0 2px 8px rgba(17, 58, 90, 0.04)'
      : `inset 9px 0 14px -12px ${INSIGHT_STATUS_COLORS[status].solid}, 0 2px 8px rgba(17, 58, 90, 0.04)`,
  }),

  insightTileStatus: status => ({
    bgcolor: INSIGHT_STATUS_COLORS[status] === COLORS.status.warning
      ? COLORS.status.warning.solid
      : INSIGHT_STATUS_COLORS[status].softBg,
    borderColor: INSIGHT_STATUS_COLORS[status] === COLORS.status.warning
      ? 'common.white'
      : INSIGHT_STATUS_COLORS[status].solid,
    color: INSIGHT_STATUS_COLORS[status] === COLORS.status.warning
      ? 'common.white'
      : INSIGHT_STATUS_COLORS[status].text,
    whiteSpace: 'nowrap',
  }),

  sectionTileHeader: {
    width: '100%',
    minWidth: 0,
    minHeight: 40,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
  },

  sectionTileIdentity: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0.8,
  },

  sectionTileBody: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateRows: 'minmax(34px, auto) auto',
    alignItems: 'start',
    gap: 0.35,
    px: 1,
  },

  sectionTileNotes: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },

  sectionTileSecondaryNote: {
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.35,
  },

  sectionTileReliability: {
    color: devPlanColors.secondary,
    fontSize: 10.5,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  sectionTileIcon: {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    bgcolor: COLORS.status.info.softBg,
    border: `1px solid ${devPlanColors.border}`,
    color: COLORS.status.info.solid,
    '& svg': {
      color: `${COLORS.status.info.solid} !important`,
      fontSize: 18,
    },
  },

  sectionTileCopy: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  sectionTileTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 14,
    fontWeight: 800,
  },

  sectionTileSubtitle: {
    color: devPlanColors.secondary,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  sectionTileAction: {
    flexShrink: 0,
    px: 0.8,
    py: 0.2,
    borderRadius: 99,
    bgcolor: devPlanColors.primaryLight,
    border: `1px solid ${devPlanColors.border}`,
    color: devPlanColors.primary,
    fontSize: 11,
    fontWeight: 800,
  },

  compactRosterSection: {
    width: '100%',
    minWidth: 0,
    px: 0,
    py: 0.5,
    '& > :first-child': { pl: 1, pr: 0, mb: 0.5 },
  },
  rosterSectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    gap: 0.45,
    mb: 0,
  },
  rosterHeaderTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 1,
    minWidth: 0,
    pr: 0,
  },
  rosterHeaderMeta: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 0.65,
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    pr: 1,
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  rosterHeaderDivider: {
    width: '1px',
    height: 18,
    flexShrink: 0,
    mx: 0.75,
    bgcolor: devPlanColors.border,
  },
  rosterCollapseButton: open => ({
    position: 'relative',
    top: -5,
    left: -6,
    mr: -1,
    flexShrink: 0,
    width: 28,
    height: 28,
    borderRadius: 7,
    color: devPlanColors.secondary,
    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      color: devPlanColors.primary,
    },
    '& svg': {
      fontSize: 19,
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 300ms cubic-bezier(.22, 1, .36, 1)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      '& svg': { transition: 'none' },
    },
  }),
  rosterCollapseContent: open => ({
    display: 'grid',
    gridTemplateRows: open ? '1fr' : '0fr',
    opacity: open ? 1 : 0,
    visibility: open ? 'visible' : 'hidden',
    pointerEvents: open ? 'auto' : 'none',
    transition: open
      ? 'grid-template-rows 320ms cubic-bezier(.22, 1, .36, 1), opacity 260ms ease, visibility 0s'
      : 'grid-template-rows 320ms cubic-bezier(.22, 1, .36, 1), opacity 260ms ease, visibility 0s linear 320ms',
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  }),
  rosterCollapseInner: {
    minHeight: 0,
    overflow: 'hidden',
  },
  loadTimes: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    flex: '0 0 200px',
    width: 200,
    columnGap: 0.5,
    overflow: 'hidden',
  },
  loadTimeItem: {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
    flex: '0 1 auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '0.65rem',
    '& .MuiTypography-startDecorator': { flexShrink: 0 },
  },
  loadTimeText: {
    display: 'block',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  content: {
    minWidth: 0,
    minHeight: 0,
    pt: 1.5,
    overflowY: 'auto',
    overflowX: 'hidden',
    overflowAnchor: 'none',
    scrollbarGutter: 'stable',
    pr: 0.25,
    display: 'grid',
    alignContent: 'start',
    gap: 1.25,
  },

  contentInsight: {
    pt: 0,
  },

  workspaceRoute: {
    minWidth: 0,
    display: 'grid',
    alignContent: 'start',
    gap: 1.25,
  },

  insightSlide: direction => ({
    minWidth: 0,
    animation: direction > 0
      ? 'teamWorkspaceEnterNext 440ms cubic-bezier(.4, 0, .2, 1)'
      : direction < 0
        ? 'teamWorkspaceEnterPrevious 440ms cubic-bezier(.4, 0, .2, 1)'
        : 'teamWorkspaceEnterNeutral 200ms ease-out',
    animationFillMode: 'both',
    '@keyframes teamWorkspaceEnterNext': {
      from: { opacity: 0.45, transform: 'translateX(64px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    '@keyframes teamWorkspaceEnterPrevious': {
      from: { opacity: 0.45, transform: 'translateX(-64px)' },
      to: { opacity: 1, transform: 'translateX(0)' },
    },
    '@keyframes teamWorkspaceEnterNeutral': {
      from: { opacity: 0.8 },
      to: { opacity: 1 },
    },
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  }),

  section: {
    p: {
      xs: 1.25,
      md: 1.5,
    },
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 10,
    bgcolor: devPlanColors.surface,
  },

  sectionHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    pt: 0,
    pr: 0,
    mb: 2,
  },

  sectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  sectionTitleIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 23,
    height: 23,
    borderRadius: 7,
    border: `1px solid ${devPlanColors.primaryDark}`,
    bgcolor: devPlanColors.primary,
    color: devPlanColors.surface,
    '& svg': {
      color: `${devPlanColors.surface} !important`,
      fontSize: 14,
    },
  },

  sectionTitle: {
    color: devPlanColors.primaryDark,
    fontSize: 15,
    fontWeight: 800,
  },

  rosterPlayerCount: {
    px: 0.7,
    py: 0.15,
    borderRadius: 20,
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.primaryDark,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  rosterSeasonChips: {
    minWidth: 0,
    maxWidth: '100%',
    display: 'flex',
    flexWrap: 'nowrap',
    gap: 0.35,
    overflowX: 'auto',
  },

  rosterProfileSlot: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    flexShrink: 0,
    marginInlineStart: 'auto',
  },

  rosterSeasonChip: {
    minHeight: 20,
    px: 0.6,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    color: devPlanColors.secondary,
    bgcolor: '#fff',
    border: `1px solid ${devPlanColors.border}`,
    cursor: 'pointer',
    '&:hover': {
      bgcolor: devPlanColors.primaryLight,
      borderColor: devPlanColors.primary,
    },
  },

  rosterSeasonChipSelected: {
    color: devPlanColors.primary,
    bgcolor: '#fff',
    borderColor: devPlanColors.primary,
    boxShadow: 'none',
  },

  rosterSeasonChipContent: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.3,
    minWidth: 0,
  },

  rosterSeasonChipText: {
    color: 'inherit',
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  sectionExportButton: {
    px: 0.8,
    borderColor: devPlanColors.border,
    color: devPlanColors.primaryDark,
    bgcolor: devPlanColors.surface,
    fontSize: 11,
    fontWeight: 700,
  },


  rosterProfileFilterSelect: {
    width: 210,
    bgcolor: '#fff',
    color: devPlanColors.primaryDark,
    border: `1px solid ${devPlanColors.primary}`,
    fontWeight: 700,

    '& .MuiSelect-button': {
      justifyContent: 'flex-start',
      textAlign: 'start',
    },

    '& .MuiSelect-indicator': {
      display: 'none',
    },
  },

  rosterProfileFilterValue: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '18px minmax(0, 1fr) auto',
    gap: 0.5,
    alignItems: 'center',
    justifyItems: 'start',
    textAlign: 'start',
  },

  rosterProfileFilterIcon: {
    display: 'grid',
    placeItems: 'center',
    color: devPlanColors.primary,
    '& svg': {
      fontSize: 15,
    },
  },

  rosterProfileFilterValuePrimary: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  rosterProfileFilterValueCount: {
    minWidth: 0,
    p: 0,
    color: devPlanColors.primary,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
    justifySelf: 'end',
  },

  rosterProfileFilterListbox: {
    width: 210,
    minWidth: '210px !important',
    maxWidth: 210,
    maxHeight: 320,
    overflowX: 'hidden',
    overflowY: 'auto',
  },

  rosterProfileFilterOption: {
    minHeight: 38,
    py: 0.45,

    '&:hover': {
      bgcolor: '#eaf4ff',
    },

    '&[aria-selected="true"]': {
      bgcolor: '#dcecf8',
    },
  },

  rosterProfileFilterOptionContent: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '18px minmax(0, 1fr) auto',
    gap: 0.6,
    alignItems: 'center',
  },

  rosterProfileFilterOptionLabel: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  rosterProfileFilterOptionCount: {
    minWidth: 0,
    color: devPlanColors.primaryDark,
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1,
    justifySelf: 'end',
  },

  rosterSampleNotice: {
    mb: 1,
    px: 1,
    py: 0.65,
    borderRadius: 7,
    bgcolor: devPlanColors.secondaryLight,
    color: devPlanColors.secondary,
    fontSize: 12,
    fontWeight: 700,
  },

}
