//// / teamDashboard/playersList/deskTop/B_DeskTopPlayersList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deletePlayer } from '../../../../a_firestore/actionData/deleteData/deletePlayer.js';
import { useSnackbar } from '../../../../h_componnetsUtils/SnackBar/SnackbarProvider.js';
import { getDefaultActions } from '../../../../f_forms/X_Actions.js';
import { getDefaultQuickActions } from '../../../../g_quickForms/X_Actions.js'
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { tablProps, boxPlaProps } from './X_Style'
import { getFilterOptions } from '../../../../i_filters/filterOptions';
import { sortData } from '../../../../j_sortings/sortData.js'
import { useObjectFilters } from '../../../../i_filters/hooks/useObjectFilters';
import { useObjectSorting } from '../../../../j_sortings/useObjectSorting';
import { playerMenuConfig } from '../../../../d_analystComp/a_layouts/X_menuConfig.js'
import { Table, Typography, Box, Avatar, Button } from '@mui/joy';
import SpotifyFilterBar from '../../../../i_filters/SpotifyFilterBar.js';
import SortButtonWithDrawer from '../../../../j_sortings/SortButtonWithDrawer.js';
import NewPlayerForm from '../../../../f_forms/D_NewPlayer.js'
import JoyStarRating from '../../../../h_componnetsUtils/rating/JoyStarRating.js';
import GenericEditMenu from '../../../../d_analystComp/a_containers/F_GenericEditMenu.js'

function HeaderTable({
  actions,
  isAdding,
  isLoadingNewPlayer,
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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
      {/* כפתור הוספה */}

      <NewPlayerForm
        idForm='teamDashboard'
        {...formProps}
        onSave={actions.onAddPlayer}
        isModal={true}
        initialData={{
          teamId: team.id,
          clubId: team.teamClub.id
        }}
      />

      {/* סינון ומיון */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box>
          <SpotifyFilterBar
            type="players"
            view={view}
            isMobile={false}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            filterOptions={getFilterOptions(formProps, view)}
          />
        </Box>
        <Box>
          <SortButtonWithDrawer
            type="players"
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
            view="profileTeam"
          />
        </Box>

      </Box>
    </Box>
  )
}

export default function DeskTopPlayersList({ view, teamPlayers = [], formProps, allShorts, team, actions }) {
  const [updates, setUpdates] = React.useState({});
  const [actionItem, setActionItem] = React.useState(null);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewPlayer, setIsLoadingNewPlayer] = useState(false);
  const [filters, setFilters] = useState({});
  const [sorting, setSorting] = useState('byAlfa');
  const [direction, setDirection] = useState('asc');
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const goToPlayer = (id) => navigate(`/Player/${id}`);

  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetFilters = () => setFilters({});

  const filteredPlayers = React.useMemo(() => {
    let list = [...teamPlayers];
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        list = list.filter((p) => String(p[key]) === String(value));
      }
    });
    return sortData(list, sorting, formProps, direction);
  }, [teamPlayers, filters, sorting, direction])

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

  return (
    <Box sx={{ overflowX: 'auto', width: '100%', px: 4 }}>
      <HeaderTable
        actions={actions}
        isAdding={isAdding}
        isLoadingNewPlayer={isLoadingNewPlayer}
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
      <Table {...tablProps}>
        <thead>
          <tr>
            <th style={{ width: '5%'}}></th>
            <th>שם מלא</th>
            <th>טלפון</th>
            <th>שנת לידה</th>
            <th>עמדות</th>
            <th>שערים</th>
            <th>בישולים</th>
            <th>דקות משחק</th>
            <th>יכולת</th>
            <th>פוטנציאל</th>
            <th>סוג שחקן</th>
            <th style={{ width: '5%'}}></th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map((player) => {
            const update = updates[player.id] || getInitialState?.(player);
            const setUpdate = (val) => setUpdates(prev => ({ ...prev, [player.id]: val }));
            const menuList = playerMenuConfig(player);
            return (
              <Box key={player.id} {...boxPlaProps(goToPlayer, player)} onClick={() => goToPlayer(player.id)}>
                <td style={{ width: '5%'}}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Avatar src={player.photo !== '' ? player.photo : playerImage} alt={player.playerFullName} />
                  </Box>
                </td>
                <td>{player.playerFullName}</td>
                <td>{player.phone || '-'}</td>
                <td>{player.birth || '-'}</td>
                <td>{(player.positions && player.positions.length > 0) ? player.positions.join(', ') : '-'}</td>
                <td>{player.goals}</td>
                <td>{player.assists}</td>
                <td>{player.timePlay}/{player.totalTime}</td>
                <td><JoyStarRating value={player.level} size="sm" /></td>
                <td><JoyStarRating value={player.levelPotential} size="sm" /></td>
                <td>{player.type === 'project' ? 'שחקן פרויקט' : 'שחקן קבוצה'}</td>
                <td style={{ width: '5%', textAlign: 'center'}}>
                <GenericEditMenu
                  type='players'
                  item={player}
                  view={view}
                  update={update}
                  isMobile={false}
                  actions={actions}
                  idDisplay='tableList'
                  setUpdate={setUpdate}
                  formProps={formProps}
                />
                </td>
              </Box>
            )
          })}
        </tbody>
      </Table>
    </Box>
  );
}
