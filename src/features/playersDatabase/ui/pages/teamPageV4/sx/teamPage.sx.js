// src/features/playersDatabase/ui/pages/teamPage/sx/teamPage.sx.js

export const teamPageSx = {
  loadingState: {
    minHeight: 320,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  viewTabs: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    width: 'fit-content',
    p: 0.35,
    border: '1px solid',
    borderColor: 'neutral.outlinedBorder',
    borderRadius: 'md',
    bgcolor: 'background.level1',
  },
  viewTabsToolbar: {
    width: 'calc(100% - 4px)',
    boxSizing: 'border-box',
    mx: '2px',
    display: 'flex',
    alignItems: 'center',
    minHeight: 46,
    p: 0.5,
    border: '1px solid',
    borderColor: 'neutral.outlinedBorder',
    borderRadius: 'md',
    bgcolor: 'background.surface',
    boxShadow: 'sm',
    justifyContent: 'space-between',
    gap: 1,
  },
  seasonPath: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 0.4,
    px: 1,
    overflow: 'hidden',
  },
  seasonPathArrow: { color: 'neutral.500', display: 'inline-flex' },
  seasonStatusChip: { flexShrink: 0, ml: 1.25 },
  seasonPathCurrent: {
    color: 'primary.700',
    fontSize: 14,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  seasonPathPrevious: { color: 'neutral.500', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },
}






