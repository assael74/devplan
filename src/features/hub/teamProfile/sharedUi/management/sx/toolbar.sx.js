// teamProfile/sharedUi/management/sx/toolbar.sx.js

import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'

export const toolbarSx = {
  toolbar: (nonShow, isMobile) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: isMobile ? 0.75 : 1,
    px: isMobile ? 0.9 : 1,
    py: !nonShow
      ? isMobile
        ? 0.65
        : 0.65
      : isMobile
        ? 0.85
        : 1.1,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'none',
    minWidth: 0,
    flexWrap: 'nowrap',
  }),

  titleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0,
  },

  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    bgcolor: devPlanColors.tertiary,
    boxShadow: `0 0 0 4px ${devPlanColors.tertiaryLight}`,
    flexShrink: 0,
  },

  title: (isMobile) => ({
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: isMobile ? 170 : 'none',
  }),

  statusWrap: {
    pl: 0.5,
    flexShrink: 0,
  },

  toolbarActions: (isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 0.45 : 0.6,
    flexShrink: 0,
    flexWrap: 'nowrap',
  }),

  secondaryAction: {
    border: '1px solid',
    borderColor: 'divider',
    fontWeight: 600,
  },

  saveAction: (enabled) => ({
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

  mobileSaveBtn: {
    bgcolor: devPlanColors.primary,
    color: '#fff',
    border: '1px solid',
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
      color: '#fff',
    },
  },

  confBtn: {
    bgcolor: devPlanColors.primary,
    color: '#fff',
    fontWeight: 600,
    boxShadow: 'none',
    px: 1.5,
    transition: 'background .15s ease, transform .12s ease',
    border: '1px solid',
    borderColor: devPlanColors.primary,

    '&:hover': {
      bgcolor: devPlanColors.primaryDark,
      color: '#fff',
      transform: 'translateY(-1px)',
    },
  },
}
