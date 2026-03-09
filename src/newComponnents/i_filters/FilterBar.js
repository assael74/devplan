import React from 'react';
import { iconUi } from '../b_styleObjects/icons/IconIndex';
import { drawerConsProps, sheetDrwerProps, boxChipProps, resetButtonProps } from './X_Style'
import { Box, Sheet, Divider, IconButton, Drawer, Typography, Chip, Stack, Button } from '@mui/joy';
import { DialogContent, DialogTitle, ModalClose } from '@mui/joy';

export default function FilterBar({
  type = '',
  filters = {},
  isMobile,
  idNav = 'main',
  size = 'lg',
  filterOptions = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
}) {
  const [open, setOpen] = React.useState(false);
  const colorMap = ['#008744', '#0057e7', '#d62d20', '#ffa700', '#673ab7']
  const filteredChips = filterOptions[type] || [];
  const uniqueIds = [...new Set(filteredChips.map(chip => chip.id))];
  const colorIndexMap = Object.fromEntries(
    uniqueIds.map((id, idx) => [id, colorMap[idx % colorMap.length]])
  );
  const clearSize = size === 'sm' ? 'xs' : 'md'

  return (
    <>
      <IconButton onClick={() => setOpen(true)} size='sm' variant='outlined'>
       {iconUi({id: 'filter'})}
      </IconButton>

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetDrwerProps}>
          <DialogTitle>פילטרים</DialogTitle>
          <ModalClose />
          <Divider sx={{ mt: 'auto' }} />
          <DialogContent sx={{ gap: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {uniqueIds.map((groupId) => {
              const labelIdH = filterOptions[type].filter(p => p.id === groupId).map(i => i.labelIdH)[0] || groupId;
              return(
                <Box key={groupId} sx={{ mb: 2 }}>
                  <Typography level="body-md" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {labelIdH}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {filteredChips
                      .filter((chip) => chip.id === groupId)
                      .map(({ id, value, labelH, idIcon }) => {
                        const isSelected = String(filters[groupId]) === String(value);
                        const baseColor = colorIndexMap[id];
                        return (
                          <Chip
                            key={`${groupId}_${value}`}
                            variant={isSelected ? "soft" : 'outlined'}
                            size={size}
                            color={isSelected ? 'success' : 'neutral'}
                            sx={{
                              transition: 'all 0.2s ease-in-out',
                              borderRadius: '12px',
                              '&:hover': {
                                boxShadow: 'sm',
                              },
                            }}
                            onClick={() => onFilterChange(groupId, value)}
                            startDecorator={idIcon ? iconUi({ id: idIcon, sx: { fontSize: clearSize } }) : undefined}
                          >
                            {labelH}
                          </Chip>
                        );
                      })}
                  </Box>
                </Box>
              )
            })}
            </Box>
            <Divider sx={{ my: 2 }} />
          </DialogContent>
          <Stack direction="row" useFlexGap spacing={1} sx={{ justifyContent: 'flex-end' }} >
            <Button onClick={onResetFilters} {...resetButtonProps}>
              איפוס
            </Button>
          </Stack>
        </Sheet>
      </Drawer>
    </>
  );
}
