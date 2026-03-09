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
import NewGameForm from '../../../../f_forms/I_NewGame.js';
import ObjectMainTableContainer from '../../../../d_analystComp/a_containers/DA_ObjectMainTableContainer.js';
import DefaultEmpty from '../../../../d_analystComp/a_containers/I_DefaultEmpty.js';

function HeaderTable({
  actions,
  filters,
  sorting,
  direction,
  setSorting,
  setDirection,
  formProps,
  team,
  view,
  handleFilterChange,
  handleResetFilters,
}) {
  return (
    <Box sx={{ mb: 0.5 }}>
      {/* פילטרים */}
      <Box>
        <SpotifyFilterBar
          type="games"
          view={view}
          filters={filters}
          isMobile={false}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          filterOptions={getFilterOptions(formProps, view)}
        />
      </Box>

      {/* מיון */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 0.5, py: 0.5, pb: 1 }}>
        <Box sx={{ flexGrow: 1, pl: 1 }}>
          <NewGameForm
            idForm='teamDashboard'
            {...formProps}
            formProps={formProps}
            onSave={actions.onAddGame}
            onSaveStats={actions.onAddStats}
            isModal={true}
            initialData={{
              teamId: team.id,
              clubId: team.teamClub.id
            }}
          />
        </Box>
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

export default function DeskTopGamesList({ teamGames = [], formProps, allShorts, team, actions, statsParm, view }) {
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
    let list = [...teamGames];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        list = list.filter((p) => String(p[key]) === String(value));
      }
    });
    return sortData(list, sorting, formProps, direction);
  }, [teamGames, filters, sorting, direction])

  const getInitialState = (game) => ({
    id: game.id,
  });

  return (
    <Box sx={{ overflowX: 'auto', width: '100%', px: 4 }}>
      <HeaderTable
        actions={actions}
        filters={filters}
        sorting={sorting}
        direction={direction}
        setSorting={setSorting}
        formProps={formProps}
        team={team}
        view={view}
        setDirection={setDirection}
        handleFilterChange={handleFilterChange}
        handleResetFilters={handleResetFilters}
      />
      {teamGames.length === 0 ?
        <DefaultEmpty
          type='games'
          icon='games'
          formProps={formProps}
          onAdd={actions.onAddGame}
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
            tab={1}
            view={view}
            title='משחקי הקבוצה'
            icon='games'
            type='games'
            idDisplay='tableList'
            isMobile={false}
            actions={actions}
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
