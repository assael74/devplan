// src/ui/sort/sort.sx.js
export const sortSx = {
  drawerContent: {
    bgcolor: 'transparent',
    boxShadow: 'none',
    p: { xs: 0, sm: 1.5, md: 2 },
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },

  sheet: {
    width: '100%',
    maxWidth: { xs: '100%', sm: 640 },
    mx: 'auto',
    maxHeight: { xs: '70dvh', sm: '60dvh', md: '55dvh' },
    overflowY: 'auto',
    overflowX: 'hidden',
    bgcolor: 'background.surface',
    boxShadow: 'lg',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderRadius: { xs: 0, sm: 'md' },
    p: 0,
  },

  headerWrap: {
    px: 2,
    pt: 1.5,
    pb: 1,
  },

  dialogTitle: {
    p: 0,
    m: 0,
  },

  title: {
    fontWeight: 700,
    fontSize: 16,
  },

  dialogContent: {
    p: 0,
    overflowX: 'hidden',
  },

  listFooterPad: {
    height: 8,
  },

  itemBtn: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    px: 1.5,
    width: '100%',
    justifyContent: 'space-between',
    cursor: 'pointer',
    textAlign: 'start',
    outline: 'none',
    '&:hover': { bgcolor: 'neutral.softBg' },
    ...(selected ? { bgcolor: 'neutral.softBg' } : null),
  }),

  itemText: {
    display: 'flex',
    gap: 0.25,
    width: '100%',
  },

  itemLabel: {
    fontWeight: 700,
    fontSize: 15,
    lineHeight: 1.15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  itemDesc: {
    fontSize: 12,
    opacity: 0.75,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  // עוזר להימנע מחריגות רוחב בגלל button all: unset
  buttonReset: {
    all: 'unset',
    width: '100%',
    display: 'block',
  },
}
