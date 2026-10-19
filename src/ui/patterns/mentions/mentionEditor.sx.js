// src/ui/patterns/mentions/mentionEditor.sx.js

import { devPlanColors as c } from '../../core/theme/Colors.js'

export const mentionEditorSx = {
  root: {
    position: 'relative',
    display: 'flex',
    flex: '1 1 auto',
    minHeight: 168,
    minWidth: 0,
  },
  editor: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    px: 1.5,
    py: 0.75,
    border: '1px solid',
    borderColor: c.border,
    borderRadius: 'sm',
    bgcolor: '#FFFEFB',
    outline: 'none',
    fontSize: 14,
    lineHeight: '28px',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, #DCE8EC 28px)',
    '&:focus-visible': { borderColor: c.primary, boxShadow: `0 0 0 2px ${c.primaryLight}` },
    '&[data-empty="true"]::before': {
      content: 'attr(data-placeholder)',
      color: c.secondary,
      pointerEvents: 'none',
    },
    '& .dpMentionToken': {
      display: 'inline',
      color: c.primary,
      bgcolor: c.primaryLight,
      borderRadius: '4px',
      px: 0.25,
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  },
  suggestions: {
    position: 'absolute',
    insetInline: 8,
    zIndex: 2,
    display: 'grid',
    maxHeight: 180,
    overflowY: 'auto',
    p: 0.5,
    bgcolor: '#FFFFFF',
    border: '1px solid',
    borderColor: c.border,
    borderRadius: 'sm',
    boxShadow: '0 8px 20px rgba(16, 43, 64, 0.18)',
  },
  option: {
    justifyContent: 'flex-start',
    textAlign: 'start',
    minHeight: 32,
  },
}
