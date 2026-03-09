import React, { useState, useEffect } from 'react';
import playerImage from '../b_styleObjects/images/playerImage.jpg';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/joy/styles';
import { iconUi } from '../b_styleObjects/icons/IconIndex';
import { addButtProps, clearButtProps } from './X_Style';
import { generateTeamStats } from './helpers/calcultor';
import { getGameStatsFieldLists, getAutoExtraFields } from './helpers/gameStatsFields';
import { normalizePlayerStats } from './helpers/useSmartStatChange';
import { Box, Stack, Button, IconButton, Typography, Tooltip, Avatar } from '@mui/joy';
import StatsPlayerFormContent from './KC_StatsPlayerFormContent';
import MotionDrawer from '../h_componnetsUtils/motions/MotionDrawer';

export default function NewGamePlayerStats({
  onSave,
  formProps,
  game,
  view,
  initialStats = [],
  isMobile,
}) {
  const { playerId } = useParams();
  const [open, setOpen] = useState(false);

  const player = formProps.players.find((p) => p.id === playerId);
  const existingStats = formProps.gameStats
    .find((gs) => gs.gameId === game.id)
    ?.playerStats.find((ps) => ps.playerId === playerId);

  const [extraFields, setExtraFields] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showExtraStats, setShowExtraStats] = useState(false);
  const [playerStats, setPlayerStats] = useState(existingStats);
  const [initialPlayerStats, setInitialPlayerStats] = useState(existingStats);
  const theme = useTheme();
  const butSize = isMobile ? 'sm' : 'md'
  const gameId = game.id
  const gameStats = formProps.gameStats.find(i=>i.gameId === gameId);
  //console.log(onSave)
  const isDirty = JSON.stringify(playerStats) !== JSON.stringify(initialPlayerStats);

  useEffect(() => {
    if (!existingStats || !formProps.statsParm?.length) return;

    const { defaultList } = getGameStatsFieldLists({
      statsParm: formProps.statsParm,
      extraFields: [],
    });

    const autoExtra = getAutoExtraFields([existingStats], formProps.statsParm, defaultList);
    setExtraFields(autoExtra);
  }, [existingStats, formProps.statsParm]);

  const { defaultList, extraList } = getGameStatsFieldLists({
    statsParm: formProps.statsParm,
    extraFields,
  });

  const handleStatChange = (field, value) => {
    setPlayerStats((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleSelect = (checked) => {
    setPlayerStats((prev) => ({ ...prev, isSelected: checked }));
  };

  const smartChange = (fieldId, type = 'number') => (val) => {
    let parsedVal = val;
    if (type === 'number') {
      parsedVal = Number(val);
      if (isNaN(parsedVal)) parsedVal = null;
    }

    setPlayerStats((prev) => ({ ...prev, [fieldId]: parsedVal }));
  };

  const handleCreateStats = () => {
    if (!playerStats) return;

    const existingGameStats = formProps.gameStats.find((g) => g.gameId === game.id);
    const isFirstPlayer = !existingGameStats;
    const gameStatsId = existingGameStats?.id || `${game.id}_${game.rivel}`;

    const { isSelected, ...cleanedPlayerStats } = playerStats;

    const statsList = isFirstPlayer
      ? [{
          gameId: game.id,
          teamId: game.teamId,
          ...cleanedPlayerStats,
        }]
      : [
          ...existingGameStats.playerStats.filter(p => p.playerId !== playerStats.playerId),
          {
            gameId: game.id,
            teamId: game.teamId,
            ...cleanedPlayerStats,
          }
        ];

    const finalData = {
      id: gameStatsId,
      gameId: game.id,
      teamId: game.teamId,
      playerStats: statsList,
      teamStats: generateTeamStats(statsList, game),
    };

    onSave?.({
      type: 'gameStats',
      newItem: finalData,
      oldItem: existingGameStats || null,
    });

    setOpen(false);
  };

  const handleUpdateStats = () => {
    if (!playerStats) return;
    const cleanedPlayerStats = normalizePlayerStats(playerStats, formProps.statsParm);

    const updatedStatsList = gameStats.playerStats.map((p) =>
      p.playerId === playerStats.playerId ? cleanedPlayerStats : p
    );

    const rawTeamStats = generateTeamStats(updatedStatsList, game);
    const filteredTeamStats = rawTeamStats.filter(
      (stat) => !stat.id.toLowerCase().includes('rate')
    );

    const newItem = {
      id: gameStats.id,
      playerStats: updatedStatsList,
      teamStats: filteredTeamStats,
    };

    onSave?.({
      oldItem: gameStats,
      newItem,
      type: 'gameStats',
    });

    setOpen(false);
  };

  const clearAll = () => {
    setPlayerStats(existingStats);
    setShowExtraStats(false);
  };

  return (
    <>
      <Button {...addButtProps('newGameStats')} onClick={() => setOpen(true)}>
        {existingStats ?
          <Typography sx={{ ml: 0.2, fontSize: '10px' }}>ערוך סטטיסטיקה</Typography>
          :
          <Typography sx={{ ml: 0.2, fontSize: '10px' }}>הוסף סטטיסטיקה</Typography>
        }
      </Button>

      <MotionDrawer
        open={open}
        setOpen={(val) => {
          if (!val) clearAll();
          setOpen(val);
        }}
        isMobile={isMobile}
        title={
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={player?.photo || playerImage} alt={player?.playerFullName} sx={{ width: 40, height: 40 }} />

            <Stack spacing={0.2}>
              <Typography level="title-md" fontWeight="xl">
                סטטיסטיקה לשחקן
              </Typography>
              <Typography level="body-sm" fontWeight="lg" sx={{ color: 'text.primary' }}>
                {player?.playerFullName}
              </Typography>
            </Stack>
          </Stack>
        }
        footer={
          <Stack direction="row" spacing={1} sx={{ mt: 1, px: 4 }}>
            <Tooltip title="נקה">
              <IconButton {...clearButtProps} onClick={clearAll}>
                {iconUi({ id: 'clear' })}
              </IconButton>
            </Tooltip>
            <Button
              fullWidth
              color="success"
              variant="solid"
              onClick={existingStats ? handleUpdateStats : handleCreateStats}
              disabled={!isDirty}
            >
              {existingStats ? 'עדכן סטטיסטיקה' : 'שמור סטטיסטיקה'}
            </Button>
          </Stack>
        }
      >
        {!playerStats ? (
          <Typography sx={{ p: 2, textAlign: 'center' }}>
            טוען נתונים...
          </Typography>
        ) : (
          <Box>
            <StatsPlayerFormContent
              playerStats={playerStats}
              player={player}
              game={game}
              smartChange={smartChange}
              onToggle={handleToggleSelect}
              view={view}
              handleStatChange={(_, field, val) => handleStatChange(field, val)}
              isMobile={isMobile}
              formProps={formProps}
              extraFields={extraFields}
              setExtraFields={setExtraFields}
              settingsOpen={settingsOpen}
              setSettingsOpen={setSettingsOpen}
              showExtraStats={showExtraStats}
              setShowExtraStats={setShowExtraStats}
            />
          </Box>
        )}
      </MotionDrawer>
    </>
  );
}
