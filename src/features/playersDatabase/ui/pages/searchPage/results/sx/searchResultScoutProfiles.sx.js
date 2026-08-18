// features/playersDatabase/ui/pages/searchPage/results/sx/searchResultScoutProfiles.sx.js

export const searchResultScoutProfilesSx = {
  root: {
    minWidth: 0,
    px: 0.7,
    pt: 0.4,
    pb: 0.35,
    border: '1px solid #dbe5f4',
    borderRadius: 7,
    bgcolor: '#fff',
  },

  list: {
    minWidth: 0,
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.55,
  },

  profileItem: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.45,
    p: 0.3,
    border: '1px solid #e3ebf5',
    borderRadius: 999,
    bgcolor: '#f7faff',
  },

  strengthChip: {
    minHeight: 23,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },

  removeButton: {
    width: 24,
    minWidth: 24,
    minHeight: 24,
    borderRadius: 999,
  },
}
