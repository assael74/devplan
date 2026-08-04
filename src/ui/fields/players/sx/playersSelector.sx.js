// ui/fields/players/sx/playersSelector.sx.js

export const renderOptionStyle = {
  component: 'li',
  sx: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 1.5,
    px: 1,
    py: 0.5,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      bgcolor: 'background.level2',
    },
  },
};

export const autoSlotProps = {
  listbox: {
    className: 'dpScrollThin',
    sx: {
      maxHeight: 200,
      overflowY: 'auto',
      borderRadius: 'md',
      px: 1,
    },
  },
};
