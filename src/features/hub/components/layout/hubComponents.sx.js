// src/features/hub/components/layout/hubComponents.sx.js

export const rowSx = (selected) => ({
  px: 1,
  py: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  borderRadius: 12,
  cursor: 'pointer',

  bgcolor: selected ? 'background.level2' : 'transparent',
  border: '1px solid',
  borderColor: selected ? 'primary.outlinedBorder' : 'transparent',

  '&:hover': { bgcolor: 'background.level1' },
})

export const layoutSx = {
  listPane: {
    width: '100%',
    flex: { xs: 1, md: '0 0 34.5%' },
    minWidth: { md: 0 },
    height: 'auto',
    minHeight: 0,

    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'divider',

    overflowY: 'auto',
    scrollbarGutter: 'stable',
    scrollbarWidth: 'thin',

    '&::-webkit-scrollbar': { width: 6},
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 999,
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    '&:hover::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,0.38)',
    },
  },
}
