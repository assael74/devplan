// previewDomainCard/domains/team/videos/sx/teamVideosFilters.sx.js

export const filtersSx = {
  filtersBoxSx: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.75,
    mt: 1,
  },

  filtersTopRowSx: {
    display: 'grid',
    gap: 0.75,
    gridTemplateColumns: {
      xs: '1fr',
      md: 'minmax(260px,1fr) 180px minmax(220px,auto) auto',
    },
    alignItems: 'center',
  },

  searchBoxSx: {
    minWidth: 0,
    width: '100%',
  },

  selectSx: {
    minWidth: 0,
    width: '100%',
  },

  togglesWrapSx: {
    px: 1,
    py: 0.5,
    borderRadius: 'md',
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    flexWrap: 'wrap',
    minHeight: 36,
  },

  icoResSx: {
    height: 36,
    width: 36,
    flexShrink: 0,
  },
}
