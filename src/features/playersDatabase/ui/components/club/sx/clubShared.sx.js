import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const clubSharedSx = {
  clubIdentity: {
    pt: 0.15,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 1,
  },

  clubIdentityCompact: {
    pt: 0,
  },

  clubAvatar: {
    width: 44,
    height: 44,
    flexShrink: 0,
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    overflow: 'visible',
    borderRadius: '50%',
    bgcolor: '#FFFFFF',
    border: `1px solid ${devPlanColors.border}`,
  },

  clubLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '50%',
  },

  clubCopy: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  clubNameRow: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  clubName: {
    maxWidth: '100%',
    color: devPlanColors.primaryDark,
    fontWeight: 800,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'right',
  },

  clubNameLink: {
    minWidth: 0,
    maxWidth: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
    color: devPlanColors.primaryDark,
    textDecoration: 'none',
    cursor: 'pointer',
    borderRadius: 5,
    transition: 'color 140ms ease, background-color 140ms ease',
    '&:hover, &:focus-visible': {
      color: devPlanColors.tertiaryDark,
      bgcolor: '#DCE8F0',
      outline: 'none',
    },
    '&:hover [data-link-indicator], &:focus-visible [data-link-indicator]': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },

  clubNameLinkIndicator: {
    flex: '0 0 auto',
    width: 5,
    height: 5,
    borderRadius: '50%',
    bgcolor: 'currentColor',
    opacity: 0.72,
    transform: 'scale(1)',
    transition: 'opacity 140ms ease, transform 140ms ease',
  },

  openClubButton: {
    minHeight: 22,
    mt: 0.2,
    px: 0,
    fontSize: 11,
    fontWeight: 700,
    color: devPlanColors.tertiaryDark,
    '&:hover': {
      bgcolor: 'transparent',
      textDecoration: 'underline',
    },
  },

  clubLevelBadge: {
    position: 'absolute',
    left: -7,
    bottom: -7,
    minWidth: 26,
    height: 26,
    px: 0.6,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 13,
    bgcolor: devPlanColors.tertiary,
    border: '2px solid #FFFFFF',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 800,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },

  metricLabel: {
    color: devPlanColors.secondary,
    fontSize: 10,
    fontWeight: 800,
  },

  metricLabelRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  inlineItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.55,
    alignItems: 'center',
  },

  performancePriorityChips: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 0.7,
  },

  performancePriorityChipsDistributed: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.7,
  },

  performancePriorityPositive: {
    '--Chip-paddingInline': '4px',
    '--Chip-gap': '3px',
    bgcolor: 'transparent',
    borderColor: '#64748B',
    color: '#64748B',
    fontSize: 11,
    fontWeight: 700,
  },

  performancePriorityBelow: {
    '--Chip-paddingInline': '4px',
    '--Chip-gap': '3px',
    bgcolor: 'transparent',
    borderColor: '#64748B',
    color: '#64748B',
    fontSize: 11,
    fontWeight: 700,
  },

  metricItem: {
    fontSize: 11,
    color: devPlanColors.primaryDark,
    whiteSpace: 'nowrap',
  },

  path: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0.45,
  },

  pathLine: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 1.25,
  },

  pathLineCompact: {
    gap: 1,
  },

  pathNode: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 55,
    color: devPlanColors.primaryDark,
    fontSize: 14,
    fontWeight: 800,
  },

  pathNodeCompact: {
    minWidth: 52,
    fontSize: 13,
  },

  pathYear: {
    color: devPlanColors.secondary,
    fontSize: 12,
    fontWeight: 700,
  },

  pathYearCompact: {
    fontSize: 11,
  },

  pathBirthYear: {
    color: devPlanColors.secondary,
    fontSize: 12,
    fontWeight: 700,
  },

  pathBirthYearCompact: {
    fontSize: 11,
  },

  pathLevel: {
    color: devPlanColors.secondary,
    fontSize: 12,
    fontWeight: 700,
  },

  pathLevelRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
  },

  pathLeagueLevelDecline: {
    bgcolor: '#FFF0DB',
    color: '#A95A00',
  },

  pathLeagueLevelIncrease: {
    bgcolor: '#DDF1E5',
    color: '#28734E',
  },

  pathDirectionAbove: {
    color: '#28734E',
    fontSize: 17,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 17,
    height: 17,
    flex: '0 0 17px',
  },

  pathDirectionBelow: {
    color: '#A95A00',
    fontSize: 17,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 17,
    height: 17,
    flex: '0 0 17px',
  },

  pathArrow: {
    color: devPlanColors.secondary,
    fontSize: 18,
  },
}
