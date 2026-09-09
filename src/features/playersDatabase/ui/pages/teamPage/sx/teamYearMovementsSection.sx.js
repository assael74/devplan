import { COLORS, devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
const statusColors = COLORS.status

export const teamYearMovementsSectionSx = {
  emptyInline: {
    color: devPlanColors.secondary,
    fontSize: 12,
    py: 1,
  },
  movementAvatar: {
    width: 24,
    height: 24,
    flexShrink: 0,
    fontSize: 10,
    bgcolor: devPlanColors.primaryLight,
  },
  movementCollapse: {
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 8,
    overflow: 'hidden',
    bgcolor: devPlanColors.primaryLight,
  },
  movementCollapseBody: {
    p: 0.75,
    borderTop: `1px solid ${devPlanColors.border}`,
  },
  movementCollapseHeader: {
    px: 1,
    py: 0.55,
    bgcolor: devPlanColors.primaryLight,
    '&:hover': {
      bgcolor: '#DCE8F0',
    },
  },
  movementItem: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.2fr) minmax(120px, .8fr) minmax(150px, 1fr)' },
    alignItems: 'center',
    gap: 1,
    p: 0.75,
    border: `1px solid ${devPlanColors.border}`,
    borderRadius: 8,
    bgcolor: devPlanColors.surface,
  },
  movementList: {
    display: 'grid',
    gap: 0.75,
  },
  movementName: {
    color: devPlanColors.primaryDark,
    fontSize: 12,
    fontWeight: 900,
  },
  movementPlayer: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
  },
  movementProfile: {
    color: devPlanColors.secondary,
    fontSize: 11,
  },
  movementSeasons: {
    display: 'grid',
    gap: 0.35,
  },
  movementTag: color => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    justifySelf: 'start',
    px: 0.65,
    py: 0.3,
    borderRadius: 99,
    border: `1px solid ${color === 'success' ? statusColors.success.solid : color === 'warning' ? statusColors.warning.solid : color === 'primary' ? devPlanColors.tertiary : devPlanColors.border}`,
    bgcolor: color === 'success' ? statusColors.success.softBg : color === 'warning' ? statusColors.warning.softBg : color === 'primary' ? devPlanColors.tertiaryLight : devPlanColors.secondaryLight,
    color: color === 'success' ? statusColors.success.text : color === 'warning' ? statusColors.warning.text : color === 'primary' ? devPlanColors.tertiaryDark : devPlanColors.secondary,
    fontSize: 10.5,
    fontWeight: 800,
    '& svg': { fontSize: 13 },
  }),
  movementTagText: {
    color: 'inherit',
    fontSize: 10.5,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
}
