//// / teamDashboard/playersList/deskTop/B_DeskTopPlayersList.js
import React, { useState } from 'react';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { tablProps } from './X_Style'
import { getFilterOptions } from '../../../../i_filters/filterOptions';
import { sortData } from '../../../../j_sortings/sortData.js'
import { useObjectFilters } from '../../../../i_filters/hooks/useObjectFilters';
import { useObjectSorting } from '../../../../j_sortings/useObjectSorting';
import { Table, Typography, Box, Avatar, Button } from '@mui/joy';
import SpotifyFilterBar from '../../../../i_filters/SpotifyFilterBar.js';
import SortButtonWithDrawer from '../../../../j_sortings/SortButtonWithDrawer.js';
import ObjectMainTableContainer from '../../../../d_analystComp/a_containers/DA_ObjectMainTableContainer.js';
import DefaultEmpty from '../../../../d_analystComp/a_containers/I_DefaultEmpty.js';

function HeaderTable({
  team,
  view,
  player,
  actions,
  filters,
  sorting,
  formProps,
  direction,
  setSorting,
  setDirection,
  handleFilterChange,
  handleResetFilters,
}) {
  return (
    <Box sx={{ mb: 0.5 }}>
      {/* פילטרים */}
      <Box>
        <SpotifyFilterBar
          type="games"
          filters={filters}
          isMobile={false}
          view={view}
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
  )
}

export default function DeskTopGamesList({
  playerGames = [],
  formProps,
  allShorts,
  player,
  actions,
  statsParm,
  view
}) {
  const [updates, setUpdates] = React.useState({});
  const [actionItem, setActionItem] = React.useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewPlayer, setIsLoadingNewPlayer] = useState(false);
  const [filters, setFilters] = useState({});
  const [sorting, setSorting] = useState('byAlfa');
  const [direction, setDirection] = useState('asc');
  const { showSnackbar } = useSnackbar();

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => setFilters({});

  const filteredGames = React.useMemo(() => {
    let list = [...playerGames];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        list = list.filter((p) => String(p[key]) === String(value));
      }
    });
    return sortData(list, sorting, formProps, direction);
  }, [playerGames, filters, sorting, direction])

  const getInitialState = (game) => ({
    id: game.id,
  });

  return (
    <Box sx={{ overflowX: 'auto', width: '100%', px: 4 }}>
      <HeaderTable
        view={view}
        player={player}
        actions={actions}
        filters={filters}
        sorting={sorting}
        formProps={formProps}
        direction={direction}
        setSorting={setSorting}
        setDirection={setDirection}
        handleFilterChange={handleFilterChange}
        handleResetFilters={handleResetFilters}
      />
      {playerGames.length === 0 ?
        <DefaultEmpty
          type='games'
          icon='games'
          onAdd={null}
        />
        :
        <Box>
        {filteredGames.length === 0 ?
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
            icon='games'
            type='games'
            player={player}
            isMobile={false}
            actions={actions}
            title='משחקי השחקן'
            idDisplay='tableList'
            allShorts={allShorts}
            menuConfig={() => []}
            data={filteredGames}
            formProps={{ ...formProps, onSave: null }}
          />
        }
        </Box>
      }
    </Box>
  );
}
