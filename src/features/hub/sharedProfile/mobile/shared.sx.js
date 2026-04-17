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

  topRow: {
    minWidth: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  secondRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  avatarWraper: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75
  },

  iconBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    minWidth: 0
  },

  panel: {
    p: 1,
    borderRadius: 'md',
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden',
  },

  pathRoot: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 0,
    flexWrap: 'nowrap'
  },

  link: (isLast) => ({
    p: 0,
    m: 0,
    border: 'none',
    bgcolor: 'transparent',
    fontSize: 12,
    color: isLast ? 'text.primary' : 'text.tertiary',
    fontWeight: isLast ? 700 : 500,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  }),

  typoLink: (isLast) => ({
    color: isLast ? 'text.primary' : 'text.tertiary',
    fontWeight: isLast ? 700 : 500,
    whiteSpace: 'nowrap',
  })
}
