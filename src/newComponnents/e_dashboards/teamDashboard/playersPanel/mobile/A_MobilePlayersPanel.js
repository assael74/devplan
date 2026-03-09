////teamDashboard/playersPanel/mobile/A_MobilePlayersPanel.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePlayer } from '../../../../a_firestore/actionData/deleteData/deletePlayer.js';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { getDefaultActions } from '../../../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../../../g_quickForms/X_Actions.js'
import { motion } from 'framer-motion';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { getFilterOptions } from '../../../../i_filters/filterOptions';
import { sortData } from '../../../../j_sortings/sortData.js'
import { useObjectFilters } from '../../../../i_filters/hooks/useObjectFilters';
import { useObjectSorting } from '../../../../j_sortings/useObjectSorting';
import { Box, Typography, Stack, IconButton } from '@mui/joy';
import FilterBar from '../../../../i_filters/FilterBar.js';
import SortButtonWithDrawer from '../../../../j_sortings/SortButtonWithDrawer.js';
import MobilePlayersList from './B_MobilePlayersList.js';
import NewPlayerForm from '../../../../f_forms/D_NewPlayer.js'

export default function MobilePlayersPanel(props) {
  const {
    tabValue,
    teamPlayers = [],
    view,
    isMobile,
    formProps,
    actions,
    team,
    allShorts
  } = props;

  const [filters, setFilters] = React.useState({});
  const [sorting, setSorting] = React.useState('byAlfa');
  const [direction, setDirection] = React.useState('asc');
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewPlayer, setIsLoadingNewPlayer] = useState(false);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const getInitialState = (player) => ({
    id: player.id,
    playerShortName: player.playerShortName,
    playerFirstName: player.playerFirstName,
    playerLastName: player.playerLastName,
    photo: player.photo,
    phone: player.phone,
    birth: player.birth,
    type: player.type,
    positions: player.positions,
    goals: player.goals,
    assists: player.assists,
    timePlay: player.timePlay,
    totalTime: player.totalTime,
  });

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => setFilters({});

  const filteredList = React.useMemo(() => {
    let list = [...teamPlayers];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        list = list.filter((p) => String(p[key]) === String(value));
      }
    });

    return sortData(list, sorting, formProps, direction);
  }, [teamPlayers, filters, sorting, direction]);

  return (
    <Box>
      {/* אזור סינון ומיון */}
      <Box sx={{ mb: 0.5 }}>

        {/* מיון */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 0.5, py: 0.5, pb: 1 , gap: 2 }}>
          <Box sx={{ flexGrow: 1, pl: 1 }}>
            <NewPlayerForm
              idForm='teamDashboard'
              {...formProps}
              size='sm'
              onSave={actions.onAddPlayer}
              isModal={true}
              initialData={{
                teamId: team.id,
                clubId: team.teamClub.id
              }}
            />
          </Box>
          <Box>
            <SortButtonWithDrawer
              type="players"
              size='sm'
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
          <Box sx={{ pr: 1 }}>
            <FilterBar
              type="players"
              size='sm'
              view={view}
              filters={filters}
              isMobile={isMobile}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              filterOptions={getFilterOptions(formProps, view)}
            />
          </Box>
        </Box>
      </Box>

      {/* רשימת שחקנים */}
      {filteredList.length === 0 ? (
        <Typography textAlign="center" level="body-sm" mt={2}>
          אין שחקנים להצגה
        </Typography>
      ) : (
        <Stack spacing={1}>
          {filteredList.map((player) => (
            <MobilePlayersList
              view={view}
              key={player.id}
              player={player}
              actions={actions}
              formProps={formProps}
              allShorts={allShorts}
              getInitialState={getInitialState}
              onClick={(e, p) => {
                e.stopPropagation();
                navigate(`/Player/${p.id}`);
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
