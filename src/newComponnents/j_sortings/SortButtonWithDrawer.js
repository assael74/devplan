import React from 'react';
import { Button, Sheet, List, ListItem, ListItemButton, Typography, Box, Tooltip, Drawer } from '@mui/joy';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { sortOptions } from '../j_sortings/sortOptions';
import { iconUi } from '../b_styleObjects/icons/IconIndex';
import { butSortProps, sheetDrwerProps, drawerProps } from './X_Style'

export default function SortButtonWithDrawer({
  type,
  sorting,
  onChange,
  direction = 'asc',
  view = null,
  disabled,
  size = 'sm',
  open: openProp,
  setOpen: setOpenProp
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setInternalOpen;

  function isOptionApplicable(opt, type, view) {
    return (
      opt.applicableTo.objects.includes(type) &&
      (!opt.applicableTo.view || opt.applicableTo.view.includes(view))
    );
  }
  const options = sortOptions.filter(opt => isOptionApplicable(opt, type, view));
  const selectedLabel = options.find(opt => opt.id === sorting)?.label || 'בחר מיון';
  const handleOpen = () => setOpen(!open);
  const butSize = size === 'sm' ? 'xs' : 'lg'
  const butTextSize = size === 'sm' ? '0.8rem' : '1rem'

  return (
    <>
      <Button onClick={handleOpen} {...butSortProps(butSize, butTextSize, direction)} disabled={disabled}>
       {selectedLabel}
      </Button>

      <Drawer open={open} onClose={() => setOpen(false)} anchor='bottom' {...drawerProps(open)}>
        <Box role="presentation" {...sheetDrwerProps}>
          <Typography level="title-md" sx={{ mb: 1, textAlign: 'right' }}>בחר מיון</Typography>
          <List>
            {options.map((opt) => {
              const isSelected = sorting === opt.id;
              const tooltipLabel = direction === 'asc' ? 'מיון עולה' : 'מיון יורד';

              return (
                <ListItem key={opt.id}>
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      onChange(opt.id);
                      setOpen(false);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box>{opt.label}</Box>
                      {isSelected && (
                        <Tooltip title={tooltipLabel} placement="top">
                          <Box sx={{ fontSize: '1.2rem' }}>
                            {iconUi({ id: direction === 'asc' ? 'sortUp' : 'sortDown' })}
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
