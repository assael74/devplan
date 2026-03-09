import { iconUi } from '../b_styleObjects/icons/IconIndex';

export const butSortProps = (size, fontSize, direction) => ({
  variant:"plain",
  size: size,
  startDecorator: iconUi({ id: direction === 'asc' ? 'sortUp' : 'sortDown', size: size, sx: { mr: 1 } }),
  endDecorator: iconUi({ id: 'sort', fontSize: size }),
  sx: {
    fontWeight: '500',
    color: '#1a1a1a',
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    textTransform: 'none',
    justifyContent: 'space-between',
    p: 1
  }
})

export const drawerProps = (open) => ({
  slotProps: {
    content: {
      sx: {
        height: 'auto',
        maxHeight: '80vh',
        overflowY: 'auto',
      }
    }
  },
  sx: [
    open
      ? {
          '--Drawer-transitionDuration': '0.4s',
          '--Drawer-transitionFunction': 'cubic-bezier(0.79,0.14,0.15,0.86)',
        }
      : {
          '--Drawer-transitionDuration': '0.2s',
          '--Drawer-transitionFunction': 'cubic-bezier(0.77,0,0.18,1)',
        },
  ]
})

export const sheetDrwerProps = {
  sx: {
    p: 2,
    boxShadow: 'lg',
    borderTopLeftRadius: 'lg',
    borderTopRightRadius: 'lg',
    direction: 'rtl',
  }
}
