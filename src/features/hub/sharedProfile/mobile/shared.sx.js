// features/hub/sharedProfile/mobile/navMobile.sx.js

export const sharedSx = {
  nav: (active, colors) => {
    const accent = colors?.accent || '#3B82F6'
    const softBg = colors?.bg || 'rgba(59,130,246,0.08)'
    return {
      minWidth: 0,
      minHeight: 72,
      px: 1,
      py: 1,
      borderRadius: '16px',
      cursor: 'pointer',
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      border: '1px solid',
      borderColor: active ? accent : 'divider',
      bgcolor: active ? softBg : 'background.surface',
      boxShadow: active ? `0 0 0 1px ${accent}22 inset` : 'sm',
      transition: '0.2s ease',
      '&:active': {
        transform: 'scale(0.985)',
      },
    }
  },

  navIcon: (active, colors, size = {}) => {
    const accent = colors?.accent || '#3B82F6'
    const softBg = colors?.bg || 'rgba(59,130,246,0.08)'
    const sizeDefault = {
      width: 34,
      height: 34,
    }

    const finalSize = {
      ...sizeDefault,
      ...(size || {}),
    }
    return {
      width: finalSize.width,
      height: finalSize.height,
      borderRadius: '10px',
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: active ? accent : softBg,
      color: active ? '#fff' : accent,
    }
  },

  navLabel: (active, colors) => {
    return {
      color: active ? (colors?.accent || 'text.primary') : 'text.primary',
      fontWeight: active ? 700 : 600,
    }
  },

  headerSheet: (sticky) => ({
    px: 1.25,
    py: 0.5,
    borderRadius: 12,
    ...(sticky ? { position: 'sticky', top: 0, zIndex: 10 } : {}),
  }),

  clickBox: (isClickable) => ({
    position: 'relative',
    borderRadius: 999,
    cursor: isClickable ? 'pointer' : 'default',
    lineHeight: 0,
    flexShrink: 0,
    '&:focus-visible': isClickable
      ? { outline: '2px solid', outlineColor: 'primary.400', outlineOffset: 2 }
      : undefined,
    '&:hover ._hdrAvatarOverlay': isClickable ? { opacity: 1 } : undefined,
  }),

  avatarBox: {
    position: 'absolute',
    inset: 0,
    borderRadius: 999,
    bgcolor: 'rgba(0,0,0,0.35)',
    opacity: 0,
    transition: 'opacity 140ms ease',
    pointerEvents: 'none',
  },

  panel: {
    p: 1,
    borderRadius: 'md',
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  }
}
