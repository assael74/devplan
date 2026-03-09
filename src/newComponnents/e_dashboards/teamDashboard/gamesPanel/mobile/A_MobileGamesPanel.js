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
import NewGameForm from '../../../../f_forms/I_NewGame.js';
import ObjectMainTableContainer from '../../../../d_analystComp/a_containers/DA_ObjectMainTableContainer.js';
import DefaultEmpty from '../../../../d_analystComp/a_containers/I_DefaultEmpty.js';

export default function MobileTeamGamesPanel(props) {
  const {
    actions,
    teamGames = [],
    view,
    isMobile,
    formProps,
    team,
    game,
    allShorts,
    games,
    gameStats
  } = props;
  const [filters, setFilters] = React.useState({});
  const [sorting, setSorting] = React.useState('byAlfa');
  const [direction, setDirection] = React.useState('asc');
  const [lastAddedId, setLastAddedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingNewPlayer, setIsLoadingNewPlayer] = useState(false);
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
    let list = [...teamGames];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        list = list.filter((p) => String(p[key]) === String(value));
      }
    });

    return sortData(list, sorting, formProps, direction);
  }, [teamGames, filters, sorting, direction]);

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
          <Box sx={{ flexGrow: 1, pl: 1 }}>
            <NewGameForm
              idForm='teamDashboard'
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

      {teamGames.length === 0 ?
        <DefaultEmpty
          type='games'
          icon='games'
          formProps={formProps}
          onAdd={actions.onAddGame}
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
            title='משחקי הקבוצה'
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
