// --- פריט ניווט ---
export const navItemSx = (active, collapsed) => ({
  variant: active ? 'soft' : 'plain',
  sx: {
    mx: 0.75,
    my: 0.25,
    borderRadius: 'md',
    justifyContent: collapsed ? 'center' : 'space-between',
    ...(active && {
      bgcolor: 'primary.softBg',
      color: 'primary.softColor',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 6,
        bottom: 6,
        width: 4,
        borderRadius: 999,
        bgcolor: 'primary.500',
      },
    }),
  },
})

// --- מבנה פנימי ---
export const navBoxSx = (collapsed) => ({
  sx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    width: '100%',
    justifyContent: collapsed ? 'center' : 'flex-start',
  },
})

export const fabSx = {
  // --- מיקום ---
  wrap: { position: 'fixed', bottom: 40, left: 30, zIndex: 1300 },

  // --- כפתור ---
  button: {
    bgcolor: '#03396c',
    color: '#fff',
    boxShadow: 'sm',
    borderRadius: 'lg',
    transition: 'all 0.2s ease-in-out',
    '&:hover': { bgcolor: '#03588c', boxShadow: 'md', transform: 'scale(1.08)' },
    '&:active': { transform: 'scale(0.96)' },
  },
}
