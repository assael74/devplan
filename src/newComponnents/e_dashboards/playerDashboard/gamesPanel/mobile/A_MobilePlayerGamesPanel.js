////teamDashboard/playersPanel/mobile/A_MobilePlayersPanel.js
import React, { useState } from 'react';
import { Box, Typography, Stack, IconButton } from '@mui/joy';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { motion } from 'framer-motion';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { getFilterOptions } from '../../../../i_filters/filterOptions';
import { sortData } from '../../../../j_sortings/sortData.js'
import { useObjectFilters } from '../../../../i_filters/hooks/useObjectFilters';
import { useObjectSorting } from '../../../../j_sortings/useObjectSorting';
import SpotifyFilterBar from '../../../../i_filters/SpotifyFilterBar.js';
import SortButtonWithDrawer from '../../../../j_sortings/SortButtonWithDrawer.js';
import ObjectMainTableContainer from '../../../../d_analystComp/a_containers/DA_ObjectMainTableContainer.js';
import DefaultEmpty from '../../../../d_analystComp/a_containers/I_DefaultEmpty.js';

export default function MobilePlayerGamesPanel(props) {
  const {
    view,
    player,
    actions,
    isMobile,
    formProps,
    allShorts,
    playerGames = [],
  } = props;
  const [filters, setFilters] = React.useState({});
  const [sorting, setSorting] = React.useState('byAlfa');
  const [direction, setDirection] = React.useState('asc');
  const { showSnackbar } = useSnackbar();

  const getInitialState = (game) => ({
    id: game.id,
  });

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => setFilters({});
  // סינון + מיון
  const filteredList = React.useMemo(() => {
    let list = [...playerGames];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        list = list.filter((p) => String(p[key]) === String(value));
      }
    });

    return sortData(list, sorting, formProps, direction);
  }, [playerGames, filters, sorting, direction]);

  return (
    <Box>
      {/* אזור סינון ומיון */}
      <Box sx={{ mb: 0.5 }}>
        {/* פילטרים */}
        <Box>
          <SpotifyFilterBar
            type="games"
            view={view}
            filters={filters}
            isMobile={isMobile}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            filterOptions={getFilterOptions(formProps, view)}
          />
        </Box>

        {/* מיון */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 0.5, py: 0.5, pb: 1 }}>
          <Box sx={{ pr: 1 }}>
            <SortButtonWithDrawer
              type="games"
              sorting={sorting}
              onChange={(val) => {
                if (val === sorting) {
                  setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                } else {
                  setSorting(val);
                  setDirection('asc');
                }
              }}
              direction={direction}
              view={view}
            />
          </Box>
        </Box>
      </Box>

      {playerGames.length === 0 ?
        <DefaultEmpty
          type='games'
          icon='games'
          onAdd={null}
        />
        :
        <Box>
        {filteredList.length === 0 ?
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography level="h5">אין תוצאות התואמות לסינון הנוכחי</Typography>
            <Typography level="body-sm" color="neutral">
              נסה לשנות את הפילטרים
            </Typography>
          </Box>
          :
          <ObjectMainTableContainer
            gap={2}
            tab={0}
            view={view}
            title='משחקי השחקן'
            icon='games'
            type='games'
            idDisplay='tableList'
            isMobile={true}
            actions={actions}
            allShorts={allShorts}
            menuConfig={() => []}
            data={filteredList}
            formProps={{ ...formProps, onSave: null }}
          />
        }
        </Box>
      }
    </Box>
  );
}
