
export const hubSx = {
  /// CalendarHubMobile

  root: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'background.body',
    overflow: 'hidden',
  },

  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    bgcolor: 'background.surface',
    borderBottom: '1px solid',
    borderColor: 'divider',
  },

  butWrap: {
    display: 'flex',
    gap: 0.75,
    mt: 1,
    overflowX: 'auto',
    pb: 0.25,
  },

  trigWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    mt: 1,
  },

  sortButt: {
    maxHeight: 24,
    minHeight: 24,
    px: 0.75,
    pl: 1,
    borderRadius: 999,
    border: '1px solid',
    borderColor: 'divider',
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    px: 1,
    py: 1,
  },

  // CalendarMobileAgenda

  empty: {
    p: 2,
    borderRadius: 16,
    bgcolor: 'background.surface',
    border: '1px dashed',
    borderColor: 'divider',
  },

  wrapBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 0.75,
    px: 0.25,
  },

  /// CalendarMobileDayStrip

  dayWrap: {
    display: 'flex',
    gap: 0.75,
    overflowX: 'auto',
    px: 1,
    py: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.body',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },

  clickBox: (item) => ({
    width: 48,
    minWidth: 48,
    borderRadius: 14,
    px: 0.75,
    py: 0.75,
    cursor: 'pointer',
    textAlign: 'center',
    border: '1px solid',
    borderColor: item.active ? 'primary.400' : 'divider',
    bgcolor: item.active ? 'primary.softBg' : 'background.surface',
    boxShadow: item.active ? 'sm' : 'none',
    transition: '120ms ease',
    position: 'relative',
    '&:active': {
      transform: 'scale(0.98)',
    },
  }),

  typoBody: (item) => ({
    color: item.active ? 'primary.700' : 'text.tertiary',
    fontWeight: 700,
    lineHeight: 1.1,
  }),

  typoTitle: (item) => ({
    mt: 0.35,
    color: item.active ? 'primary.700' : 'text.primary',
    lineHeight: 1.1,
  }),

  itemDay: {
    position: 'absolute',
    top: 5,
    insetInlineEnd: 5,
    width: 6,
    height: 6,
    borderRadius: 999,
    bgcolor: 'primary.500',
  }
}
