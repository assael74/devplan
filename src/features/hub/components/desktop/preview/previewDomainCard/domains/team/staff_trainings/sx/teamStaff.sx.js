// preview/previewDomainCard/domains/team/staff/sx/teamStaff.sx.js

export const modalSx = {
  root: {
    minWidth: 0,
    display: 'grid',
    gap: 1.25,
  },

  sheet: {
    p: 1,
    borderRadius: 'md',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
  },

  headerStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    flexWrap: 'wrap',
  },
}

export const staffFilterBarSx = {
  root: {
    p: 1,
    borderRadius: 'md',
  },

  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },

  search: {
    flex: 1,
    minWidth: 180,
  },

  selectRole: {
    minWidth: 150,
  },

  selectContact: {
    minWidth: 130,
  },
}

export const emptyStateSx = {
  root: {
    p: 1,
    borderRadius: 'md',
  },

  text: {
    opacity: 0.75,
  },
}
