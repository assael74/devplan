// teamProfile/desktop/modules/players/sx/toolbar.sx.js

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const toolbarSx = {
  toolbar: {
    display: 'grid',
    gap: 0.6,
    p: 0.8,
    borderRadius: '16px',
    bgcolor: 'background.level',
  },

  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.5,
    minWidth: 0,
    flexWrap: 'wrap',
  },

  toolbarInput: {
    width: 220,
    maxWidth: '100%',
    flexShrink: 0,
    bgcolor: 'background.surface',
    fontSize: 12,
    px: 0.75,

    '--Input-minHeight': '28px',
    '--Input-radius': '8px',
    '--Input-decoratorChildHeight': '20px',

    '& svg': {
      fontSize: 16,
    },
  },

  toolbarIconButton: {
    minHeight: 28,
    minWidth: 28,
    p: 0,

    '& svg': {
      fontSize: 16,
    },
  },

  selectValueDecorator: {
    minInlineSize: 18,
    mr: 0.25,

    '& svg': {
      fontSize: 16,
    },
  },

  selectionToolbar: {
    minHeight: 56,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    p: 1,
    borderRadius: '16px',
    bgcolor: 'danger.softBg',
    border: '1px solid',
    borderColor: 'danger.outlinedBorder',
  },

  selectionCount: {
    minWidth: 130,
    fontWeight: 700,
    color: 'danger.500',
  },

  selectionSpacer: {
    flex: 1,
  },

  viewModeGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    p: 0.25,
    borderRadius: 999,
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
  },

  inlineIconGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    flexShrink: 0,
  },

  filterChip: {
    cursor: 'pointer',
    transition: 'transform .12s ease, filter .12s ease',
    whiteSpace: 'nowrap',
    minHeight: 28,
    fontSize: 12,

    '--Chip-minHeight': '28px',
    '--Chip-radius': '8px',
    '--Chip-paddingInline': '8px',
    '--Icon-fontSize': '16px',

    '&:hover': {
      transform: 'translateY(-1px)',
      filter: 'brightness(1.03)',
    },
  },

  statusChipGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.35,
    flexShrink: 0,
    marginInlineStart: 'auto',
  },

  selectDecorator: {
    minInlineSize: 18,
    mr: 0.25,

    '& svg': {
      fontSize: 16,
    },
  },

  positionSelect: {
    width: 155,
    minWidth: 155,
    maxWidth: 155,
    flexShrink: 0,
    bgcolor: 'background.surface',
    fontSize: 12,
    px: 0.65,

    '--Select-minHeight': '28px',
    '--Select-radius': '8px',
    '--Select-decoratorChildHeight': '20px',
    '--Icon-fontSize': '16px',

    '& .MuiSelect-button': {
      minHeight: 28,
      minWidth: 0,
      py: 0,
      gap: 0.4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },

    '& .MuiListItemDecorator-root': {
      minInlineSize: 18,
      flexShrink: 0,
      mr: 0.25,
    },

    '& svg': {
      fontSize: 16,
      flexShrink: 0,
    },
  },
}
