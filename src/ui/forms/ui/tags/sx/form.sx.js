// C:\projects\devplan\src\ui\forms\sx\form.sx.js

export const vaSx = {
  // generic form root
  root: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  // common grids used by VideoCreateForm + VideoAnalysisCreateForm
  grid2: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    alignItems: 'start',
    minWidth: 0,
  },

  grid3: {
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
    alignItems: 'start',
    minWidth: 0,
  },

  cell: {
    minWidth: 0,
  },

  divider: {
    my: 1,
  },

  // lock note in VideoAnalysisCreateForm (Sheet warning)
  showLo: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    p: 1,
    borderRadius: 12,
    minWidth: 0,
  },

  // optional: can be used later for consistent outlined blocks (Tags uses inline today)
  sheetCard: {
    p: 1.25,
    borderRadius: 12,
    minWidth: 0,
  },
}
