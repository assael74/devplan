import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/joy';
import { getDirtyState } from './helpers/isDirtys';
import { gameTypeOptions } from '../../x_utils/optionLists.js';
import QuickExpandedFormContainer from './A_QuickExpandedFormContainer';
import MobileGameExpand from './panelContent/gameDisplay/mobile/MobileGameExpand.js';
import DesktopGameExpand from './panelContent/gameDisplay/desktop/DesktopGameExpand.js';
import GenericChipSelector from './panelContent/chipDisplay/GenericChipSelector.js';

export default function EditExpanGame({ item = {}, actions, formProps = {}, view }) {
  const [type, setType] = useState(item.type || '');
  const [rivel, setRivel] = useState(item.rivel || '');
  const [result, setResult] = useState(item.result || 'draw');
  const [goalsFor, setGoalsFor] = useState(item.goalsFor || 0);
  const [goalsAgainst, setGoalsAgainst] = useState(item.goalsAgainst || 0);
  const [teamStats, setTeamStats] = useState(item.teamStats || []);

  // gameStats is an object, not an array
  const [playerStats, setPlayerStats] = useState(item.gameStats || {});
  const [initialPlayerStats] = useState(item.gameStats || []);

  const [initialState] = useState({ type, goalsFor, goalsAgainst, rivel, result });
  const [initialTeamStats] = useState(item.teamStats || []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (goalsFor === '' || goalsAgainst === '') return;
    const newResult =
      goalsFor > goalsAgainst ? 'win' : goalsFor < goalsAgainst ? 'loss' : 'draw';
    setResult(newResult);
  }, [goalsFor, goalsAgainst]);

  const { gameDirty, teamStatsDirty } = getDirtyState({
    type,
    goalsFor,
    goalsAgainst,
    rivel,
    result,
    teamStats,
    initialState,
    initialTeamStats,
  });

  const isPlayerView = view === 'profilePlayer';
  const isDirty = isPlayerView
    ? JSON.stringify(playerStats) !== JSON.stringify(initialPlayerStats)
    : gameDirty || teamStatsDirty;

  const handleChange = (field, value) => {
    if (field === 'goalsFor') setGoalsFor(value);
    if (field === 'goalsAgainst') setGoalsAgainst(value);
    if (field === 'result') setResult(value);
    if (field === 'type') setType(value);
    if (field === 'rivel') setRivel(value);
  };

  const handleTeamStatChange = (id, val) => {
    const value = typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;
    setTeamStats((prev) =>
      prev.map((stat) => (stat.id === id ? { ...stat, value } : stat))
    );
  };

  const handlePlayerStatChange = (id, val) => {
    const value = typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;

    setPlayerStats((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleReset = () => {
    setGoalsFor(item.goalsFor);
    setGoalsAgainst(item.goalsAgainst);
    setResult(item.result);
    setType(item.type);
    setRivel(item.rivel);
    setTeamStats(item.teamStats || []);
    setPlayerStats(item.gameStats || {});
  };

  const handleSaveChanges = () => {
    if (isPlayerView) {
      const isPlayerStatsDirty = JSON.stringify(playerStats) !== JSON.stringify(initialPlayerStats);
      if (isPlayerStatsDirty) {
        const gameStatsId = item.gameStats?.id || formProps.gameStats.find(i => i.gameId === item.id)?.id;
        actions.onEditStats?.({
          type: 'gameStats',
          gameId: item.id,
          playerId: item.playerId,
          oldItem: { id: gameStatsId, stats: initialPlayerStats },
          newItem: { id: gameStatsId, stats: playerStats },
        });
        actions.setExpandedId?.(null);
      }
      return;
    }

    const newGameData = { ...item, type, goalsFor, goalsAgainst, rivel, result };
    const gameStatsId = formProps.gameStats.find(i => i.gameId === item.id)?.id;

    if (gameDirty) {
      actions.onEdit?.({
        oldItem: item,
        newItem: newGameData,
        type: 'games',
      });
    }

    if (teamStatsDirty) {
      actions.onEditStats?.({
        type: 'gameStats',
        gameId: item.id,
        teamId: item.teamId,
        oldItem: item,
        newItem: {
          id: gameStatsId,
          teamStats,
        },
      });
    }

    if (gameDirty || teamStatsDirty) {
      actions.setExpandedId?.(null);
    }
  };

  const team = formProps.teams.find(i => i.id === item.teamId);
  const teamName = team?.teamName || '';
  const typeItem = (item) => gameTypeOptions.find((p) => p.id === item.type) || {};
  const gameLabel = item ? `${typeItem(item).labelH}` : '';
  const gameIcon = item ? typeItem(item).idIcon : '';
  
  return (
    <QuickExpandedFormContainer
      title={item.rivel}
      label="יריבה:"
      type="games"
      item={item}
      view={view}
      isDirty={isDirty}
      autoHeight={true}
      onReset={handleReset}
      formProps={formProps}
      onSave={handleSaveChanges}
      height={(isMobile) => (isMobile ? 250 : 400)}
      renderMobileContent={() => (
        <MobileGameExpand
          view={view}
          rivel={rivel}
          result={result}
          actions={actions}
          isMobile={isMobile}
          clubName={teamName}
          goalsFor={goalsFor}
          formProps={formProps}
          goalsAgainst={goalsAgainst}
          handleChange={handleChange}
          handleTeamStatChange={handleTeamStatChange}
          handlePlayerStatChange={handlePlayerStatChange}
          item={{ ...item, teamStats, gameStats: playerStats }}
        />
      )}
      renderDesktopContent={() => (
        <DesktopGameExpand
          view={view}
          rivel={rivel}
          result={result}
          actions={actions}
          isMobile={isMobile}
          clubName={teamName}
          goalsFor={goalsFor}
          formProps={formProps}
          goalsAgainst={goalsAgainst}
          handleChange={handleChange}
          handleTeamStatChange={handleTeamStatChange}
          handlePlayerStatChange={handlePlayerStatChange}
          item={{ ...item, teamStats, gameStats: playerStats }}
        />
      )}
      chip={
        <GenericChipSelector
          view={view}
          value={type}
          color="success"
          label={gameLabel}
          iconId={gameIcon}
          onChange={setType}
          isMobile={isMobile}
          type="selectGameType"
          formProps={formProps}
          options={gameTypeOptions}
        />
      }
    />
  );
}
