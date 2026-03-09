// components/SpotifyFilterBar.jsx
import React from 'react';
import { boxFilterProps, boxChipProps } from './X_Style'
import { Box, Chip, IconButton } from '@mui/joy';
import { iconUi } from '../b_styleObjects/icons/IconIndex';

export default function SpotifyFilterBar({
  view,
  type = '',
  filters = {},
  isMobile,
  idNav = 'main',
  size = 'lg',
  filterOptions = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
}) {
  const colorMap = ['#008744', '#0057e7', '#d62d20', '#ffa700', '#673ab7']
  const filteredChips = (filterOptions[type] || []).filter(({ id, value }) => {
    const selectedVal = filters[id];
    if (!selectedVal || selectedVal === 'all') return true;
    return String(selectedVal) === String(value);
  });
  const uniqueIds = [...new Set(filteredChips.map(chip => chip.id))];
  const colorIndexMap = Object.fromEntries(
    uniqueIds.map((id, idx) => [id, colorMap[idx % colorMap.length]])
  );
  const clearSize = size === 'sm' ? 'xs' : 'md'

  return (
    <Box {...boxFilterProps(isMobile)}>
      {/* כפתור איפוס */}
      <Box sx={{ flexShrink: 0, mt: size === 'sm' ? -0.2 : -0.5 }}>
        <IconButton size={clearSize} sx={{ py: size === 'sm' ? 0.5 : 0 }} variant="outlined" onClick={onResetFilters}>
          {iconUi({ id: 'clear', sx:{ fontSize: clearSize } })}
        </IconButton>
      </Box>

      {/* אזור הצ’יפים */}
      <Box {...boxChipProps}>
      {filteredChips.map(({ id, value, labelH, idIcon }) => {
        const isSelected = String(filters[id]) === String(value);
        const baseColor = colorIndexMap[id];

        return (
          <Chip
            variant={isSelected ? "outlined" : 'soft'}
            size={size}
            sx={{
              color: baseColor,
              px: 1,
              transition: 'all 0.2s ease-in-out',
              borderRadius: '12px',
              '&:hover': {
                boxShadow: 'sm',
              },
            }}
            onClick={() => onFilterChange(id, isSelected ? 'all' : value)}
            startDecorator={idIcon ? iconUi({ id: idIcon, sx: { ml: 0.5, color: '#666666', fontSize: clearSize } }) : undefined}
          >
            {labelH}
          </Chip>
        );
      })}
      </Box>
    </Box>
  );
}
