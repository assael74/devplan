import React, { useState } from 'react';
import { isGameComplete } from '../../h_componnetsUtils/SnackBar/useObjectAddStatus.js';
import { getDefaultActions } from '../../f_forms/X_Actions';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { deleteGame } from '../../a_firestore/actionData/deleteData/deleteGame';
import NewGameForm from '../../f_forms/I_NewGame.js';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';

const bottomTabs = [
  { id: 'played', label: 'משחקים ששוחקו', idIcon: 'games', value: 0, item: null },
  { id: 'upcoming', label: 'משחקים קרובים', idIcon: 'upcoming', value: 1, item: null },
];

export default function GamesLayout(props) {
  const { clubs, teams, players, videoAnalysis, tags, games, statsParm, allShorts, gameStats } = props;
  const [idDisplay, setIdDisplay] = useState('tableList');
  const [tab, setTab] = useState(0);

  const { showSnackbar } = useSnackbar();

  const addActions = getDefaultActions({ type: 'games' });
  const editActions = getDefaultQuickActions({ type: 'games' });
  const addGameStatsActions = getDefaultActions({ type: 'gameStats' });
  const editGameStatsActions = getDefaultQuickActions({ type: 'gameStats' });

  const allGames = games.filter(isGameComplete);

  const toLocalDateTime = (dateStr, timeStr = '00:00') => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = (timeStr || '00:00').split(':').map(Number);
    return new Date(y, (m - 1), d, hh || 0, mm || 0, 0, 0);
  };

  const splitGamesByDateTime = (allGames = []) => {
    const now = new Date();
    const upcoming = [];
    const played = [];

    for (const g of allGames) {
      if (!g?.gameDate) { played.push(g); continue; }
      const dt = toLocalDateTime(g.gameDate, g.gameHour);
      (dt >= now ? upcoming : played).push(g);
    }

    upcoming.sort((a, b) => toLocalDateTime(a.gameDate, a.gameHour) - toLocalDateTime(b.gameDate, b.gameHour));
    played.sort((a, b) => toLocalDateTime(b.gameDate, b.gameHour) - toLocalDateTime(a.gameDate, a.gameHour));
    return { upcoming, played };
  };

  const { upcoming, played } = splitGamesByDateTime(allGames);
  const rowData = tab === 0 ? played : upcoming;

  const actions = {
    ...addActions,
    ...editActions,
    onAdd: async (data, internalActions) => {
      await addActions.onAdd(data, internalActions);
    },
    onDelete: async (game) => {
      await deleteGame(game, showSnackbar, allShorts);
    },
    onAddStats: async (data, internalActions) => {
      await addGameStatsActions.onAdd(data, internalActions);
      showSnackbar('נוספה סטטיסטיקה חדשה');
    },
    onEditStats: async (data, internalActions) => {
      await editGameStatsActions.onEdit(data, internalActions);
      showSnackbar('סטטיסטיקה עודכנה');
    },
    setTab: setTab,
    tab: tab,
    setIdDisplay: setIdDisplay
  };

  const formProps = {
    teams,
    clubs,
    games,
    players,
    statsParm,
    gameStats,
    videoAnalysis,
  }

  return (
    <GenericObjectLayout
      view='profileAnalyst'
      id="gamesLayout"
      type='games'
      icon={tab === 0 ? 'games' : 'upcoming'}
      title={tab === 1 ? 'משחקים קרובים' : 'משחקים ששוחקו'}
      tab={tab}
      actions={actions}
      form={NewGameForm}
      rowData={{ games: rowData }}
      formProps={formProps}
      idDisplay={idDisplay}
      bottomTabs={bottomTabs}
      columns={{ xs: 2, sm: 3, md: 4 }}
      getInitialState={(game) => ({
        id: game?.id || '',
        clubId: game?.clubId || '',
        teamId: game?.teamId || '',
        rivel: game?.rivel || '',
        home: game?.home || true,
        type: game?.type || '',
        difficulty: game?.difficulty || '',
        gameDate: game?.gameDate || '',
        gameHour: game?.gameHour || '',
        gameDuration: game?.gameDuration || 90,
        goalsFor: game?.goalsFor || 0,
        goalsAgainst: game?.goalsAgainst || 0,
        result: game?.result || 'draw',
      })}
      getChips={() => []}
    />
  );
}
