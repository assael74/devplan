import { iconUi } from '../b_styleObjects/icons/IconIndex';

export const boxFilterProps = (isMobile) => ({
  sx: {
    display: 'flex',
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 2,
    width: '100%',
    pr: 0.5,
    py: 1,
  }
})

export const boxChipProps = {
  sx: {
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'auto',
    flexGrow: 1,
    direction: 'rtl',
    textAlign: 'right',
    overflowX: 'auto',
    gap: 0.5,
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  }
}

export const drawerConsProps = (open, setOpen) => ({
  size:"sm",
  variant:"plain",
  open: open,
  anchor:'left',
  onClose: (e) => {
    e.stopPropagation()
    setOpen(false)
  },
  slotProps:{
    content: {
      sx: {
        bgcolor: 'transparent',
        boxShadow: 'none',
      },
    },
  }
})

export const sheetDrwerProps = {
  sx: {
    borderRadius: 'md',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    height: '100%',
    overflow: 'auto',
  }
}

export const resetButtonProps = {
  size: "sm",
  variant: "soft",
  color: "success",
  startDecorator: iconUi({ id: 'clear' }),
  sx:{ borderRadius: 'xl' }
}
