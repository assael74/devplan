// features/playersDatabase/ui/pages/searchPage/results/sx/searchResultNotes.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const searchResultNotesSx = {
  root: {
    minWidth: 0,
    height: '100%',
    pt: 0.55,
    px: 0.7,
    pb: 0.4,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #dbe5f4',
    borderRadius: 7,
    bgcolor: '#f8fbff',
  },

  header: {
    minWidth: 0,
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.45,
  },

  titleWrap: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.65,
  },

  icon: {
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 7,
    bgcolor: '#e9f1fb',
    color: devPlanColors.primary,
  },

  title: {
    color: devPlanColors.primaryDark,
    fontWeight: 700,
  },

  headerActions: {
    minHeight: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
  },

  editButton: {
    minHeight: 26,
    px: 0.65,
  },

  textarea: ({ editing = false, hasNotes = false } = {}) => ({
    '--Textarea-radius': '7px',
    '--Textarea-minHeight': '64px',
    minHeight: 64,
    maxHeight: 64,
    flex: '0 0 64px',
    bgcolor: editing
      ? '#fff'
      : hasNotes
        ? devPlanColors.tertiaryLight
        : 'transparent',
    borderColor: editing
      ? devPlanColors.tertiary
      : hasNotes
        ? '#c8dff0'
        : '#dbe5f4',
    boxShadow: editing ? `0 0 0 2px ${devPlanColors.tertiaryLight}` : 'none',
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.6,
    fontFamily: 'inherit',
    textAlign: 'left',
    '& textarea': {
      cursor: editing ? 'text' : 'default',
    },
  }),

  saveError: ({ visible = false } = {}) => ({
    minHeight: 14,
    mt: 0.2,
    mb: 0,
    opacity: visible ? 1 : 0,
    textAlign: 'left',
  }),

  cancelButton: {
    minHeight: 24,
    px: 0.6,
    fontSize: 12,
  },

  saveButton: {
    minHeight: 24,
    px: 0.75,
    py: 0.15,
    borderRadius: 6,
    bgcolor: devPlanColors.tertiary,
    color: '#fff',
    fontSize: 12,
    '&:hover': {
      bgcolor: devPlanColors.primary,
    },
  },
}
