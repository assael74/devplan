
export const hubSx = {
  // TagsManagementMobile
  root: {
    minHeight: '100dvh',
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'background.body',
    overflow: 'hidden',
  },

  sheet: {
    px: 1.5,
    py: 1.25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    flexShrink: 0,
  },

  boxTrig: {
    px: 1.25,
    py: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexShrink: 0,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
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
    px: 1.25,
    py: 1.25,
  },

  // SectionMobile
  sheetRoot: {
    borderRadius: 18,
    p: 1.25,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    boxShadow: 'sm',
  },

  boxTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    minWidth: 0,
  },

  sheetClick: (inactive) => ({
    p: 1,
    borderRadius: 14,
    opacity: inactive ? 0.65 : 1,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.75,
  }),

  chip: (inactiveChild, typeColor) => ({
    maxWidth: '100%',
    opacity: inactiveChild ? 0.65 : 1,
    cursor: 'pointer',
    borderColor: typeColor,
  }),

  // TagsFiltersContent
  contRoot: (isColumn) => ({
    display: 'flex',
    flexDirection: isColumn ? 'column' : 'row',
    alignItems: isColumn ? 'stretch' : 'center',
    gap: 1,
    width: '100%',
  }),
}
