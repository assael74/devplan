// src/features/squadSimulator/ui/components/sx/toolbar.sx.js

export const toolbarSx = {
  panel: {
    p: 1.5,
  },

  toolbar: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr 1fr',
      md: 'minmax(210px, 1fr) minmax(210px, 1fr) minmax(180px, .8fr) minmax(82px, .35fr) minmax(86px, .35fr) minmax(130px, .55fr) minmax(150px, .65fr)',
    },
    gap: 1,
    alignItems: 'end',
  },

  targetModeButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: 1.25,
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  compactNumberField: {
    minWidth: 0,
    '& input': {
      px: 0.5,
    },
  },

  compactSelectField: {
    minWidth: 0,
  },

  profileStatus: {
    minHeight: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 8,
    px: 1.25,
    bgcolor: '#eef6ff',
  },

  iconChip: {
    justifyContent: 'center',
    '& .MuiChip-startDecorator': {
      ml: 0.5,
      mr: 0,
    },
  },
}
