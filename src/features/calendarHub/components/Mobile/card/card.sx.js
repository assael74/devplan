
export const cardSx = {
  root: (typeMeta) => ({
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    p: 1.2,
    borderRadius: 18,
    bgcolor: '#ffffff',
    border: '1px solid',
    borderColor: 'rgba(15, 23, 42, 0.08)',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
    cursor: 'pointer',
    display: 'flex',
    gap: 1,
    alignItems: 'flex-start',
    transition: '120ms ease',

    '&::before': {
      content: '""',
      position: 'absolute',
      insetInlineStart: 0,
      top: 0,
      bottom: 0,
      width: 4,
      bgcolor: typeMeta?.color || 'primary.300',
    },

    '&:active': {
      transform: 'scale(0.99)',
    },
  }),

  avatarWrap: {
    width: 46,
    minWidth: 46,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0.5,
    pt: 0.1,
  },

  avatar: (typeMeta) => ({
    width: 36,
    height: 36,
    bgcolor: typeMeta?.color || 'primary.softBg',
    boxShadow: '0 2px 8px rgba(15,23,42,0.10)',
    border: '1px solid',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  }),

  typoTime: {
    color: 'text.secondary',
    fontWeight: 800,
    lineHeight: 1.1,
    textAlign: 'center',
    direction: 'ltr',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  chip: {
    flexShrink: 0,
    borderRadius: 999,
    fontWeight: 700,
    boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.04)',
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    },
  },

  chipLable: {
    maxWidth: '100%',
    borderRadius: 999,
    bgcolor: 'rgba(15, 23, 42, 0.05)',
    color: 'text.primary',
    fontWeight: 600,
    '& .MuiChip-label': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'block',
    },
  }
}
