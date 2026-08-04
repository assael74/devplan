import { devPlanColors, getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const toolbarSx = {
  toolbar: () => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    px: 1.2,
    py: 0.8,
    minHeight: 60,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: devPlanColors.border,
    borderBottomColor: devPlanColors.tertiaryLight,
    boxShadow: '0 1px 0 rgba(16, 43, 64, 0.04)',
    minWidth: 0,
    flexWrap: 'nowrap',

    '@media (max-width: 900px)': {
      alignItems: 'stretch',
      flexDirection: 'column',
    },
  }),

  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.85,
    minWidth: 0,
  },

  titleCopy: {
    display: 'grid',
    gap: 0.1,
    minWidth: 0,
  },

  title: {
    fontWeight: 700,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.15,
  },

  subtitle: {
    color: 'text.secondary',
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.55,
    flexShrink: 0,
    flexWrap: 'nowrap',
  },

  statusChip: {
    fontWeight: 600,
    flexShrink: 0,
  },

  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    bgcolor: c.accent,
    boxShadow: `0 0 0 4px ${c.bg}`,
    flexShrink: 0,
  },

  secondaryAction: {
    border: '1px solid',
    borderColor: 'divider',
    fontWeight: 600,
  },

  confBtn: (enabled) => ({
    bgcolor: enabled ? devPlanColors.primary : 'neutral.softBg',
    color: enabled ? '#fff' : 'text.tertiary',
    fontWeight: 600,
    boxShadow: 'none',
    px: 1.5,
    transition: 'background .15s ease, transform .12s ease',
    border: '1px solid',
    borderColor: enabled ? devPlanColors.primary : 'divider',

    '&:hover': {
      bgcolor: enabled ? devPlanColors.primaryDark : 'neutral.softBg',
      color: enabled ? '#fff' : 'text.tertiary',
      transform: enabled ? 'translateY(-1px)' : 'none',
    },

    '&.Mui-disabled': {
      bgcolor: 'neutral.softBg',
      color: 'text.tertiary',
      borderColor: 'divider',
    },
  }),
}
