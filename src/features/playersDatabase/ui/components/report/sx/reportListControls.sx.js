// features/playersDatabase/ui/components/report/sx/reportListControls.sx.js

export const reportListControlsSx = {
  controls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 0.75,
      px: {
        xs: 0.25,
        sm: 0.5,
      },
      py: 0.75,
      position: 'relative',
      zIndex: 3,
    },

  sortControl: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      order: 0,
    },

  viewControl: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      minWidth: 0,
      order: 1,
    },
}
