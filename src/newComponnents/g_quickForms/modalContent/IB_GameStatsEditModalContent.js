import React from 'react';
import { Box, Grid, Button, Divider } from '@mui/joy';
import GenericInputField from '../../f_forms/allFormInputs/inputUi/GenericInputField';
import OnSquadSelector from '../../f_forms/allFormInputs/checkUi/OnSquadSelector';
import OnSquadStart from '../../f_forms/allFormInputs/checkUi/OnSquadStart';
import PlayerPositionsSimpleSelect from '../../f_forms/allFormInputs/selectUi/PlayerPositionsSimpleSelect';
import { getGameStatsFieldLists } from '../../f_forms/helpers/gameStatsFields';
import { normalizePlayerStatsList } from '../../f_forms/helpers/useSmartStatChange';
import { generateTeamStats } from '../../f_forms/helpers/calcultor';

const emptyRow = (playerId) => ({
  playerId,
  isSelected: true,
  isStarting: false,
  position: '',
});

const normalizeNumber = (v) => (v === '' || v == null ? '' : String(v));
const normalizeString = (v) => (v == null ? '' : String(v));

export default function GameStatsPlayerEditor({
  game,
  player,
  formProps,
  isMobile = false,
  onClose,
  actions,
}) {
  const { statsParm } = formProps || {};
  const { defaultList } = React.useMemo(
    () => getGameStatsFieldLists({ statsParm, extraFields: [] }),
    [statsParm]
  );
  const gameStats = formProps.gameStats.find(i=> i.gameId === game.id)

  const initialRow = React.useMemo(() => {
    const saved = (gameStats.playerStats || []).find((s) => s.playerId === player.id);
    return {
      ...emptyRow(player.id),
      ...(saved || {}),
      position: saved?.position ?? '',
    };
  }, [gameStats, player.id]);

  const [row, setRow] = React.useState(initialRow);

  React.useEffect(() => {
    setRow(initialRow);
  }, [initialRow]);

  const isSameAsInitial = React.useMemo(
    () => JSON.stringify(row) === JSON.stringify(initialRow),
    [row, initialRow]
  );

  const disableSave = isSameAsInitial;

  const smartChange = (fieldId, type) => (val) => {
    setRow((prev) => {
      let nextVal = val;
      if (type === 'number')   nextVal = normalizeNumber(val);
      else if (type === 'boolean') nextVal = Boolean(val);
      else if (type === 'string')  nextVal = normalizeString(val);

      if (prev[fieldId] === nextVal) return prev;
      return { ...prev, [fieldId]: nextVal };
    });
  };

  const handleReset = () => setRow(initialRow);

  const handleSave = async () => {
    const cleanedRow = normalizePlayerStatsList([{ ...row }], statsParm)[0];

    const baseList = Array.isArray(gameStats.playerStats) ? [...gameStats.playerStats] : [];
    const idx = baseList.findIndex((s) => s.playerId === player.id);
    if (idx >= 0) baseList[idx] = cleanedRow;
    else baseList.push(cleanedRow);

    const newItem = {
      id: gameStats.id,
      gameId: game.id,
      teamId: game.teamId,
      playerStats: baseList,
    };

    await actions.onEditStats({ newItem, type: 'gameStats' } || {});
    onClose();
  };

  return (
    <Box>
      {/* שורת בקרות על שחקן */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <OnSquadSelector
          value={!!row.isSelected}
          size={isMobile ? 'sm' : 'md'}
          onChange={(e) => smartChange('isSelected', 'boolean')(e.target.checked)}
        />
        <OnSquadStart
          value={!!row.isStarting}
          size={isMobile ? 'sm' : 'md'}
          onChange={(e) => smartChange('isStarting', 'boolean')(e.target.checked)}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ width: isMobile ? '45%' : 220 }}>
          <PlayerPositionsSimpleSelect
            value={row.position ?? ''}
            size={isMobile ? 'sm' : 'md'}
            onChange={(val) => {
              if (val == null) return;
              smartChange('position', 'string')(val);
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* שדות ברירת מחדל */}
      <Grid container spacing={1.5}>
        {defaultList.map(({ id, label, type }, index) => (
          <Grid key={id} xs={4} md={type === 'triplet' ? 4 : 3}>
            <GenericInputField
              id={`input-${id}-${player.id}-${index}`}
              type={type}
              value={row[id] ?? ''}
              label={label}
              size={isMobile ? 'sm' : 'md'}
              onChange={smartChange(id, type)}
            />
          </Grid>
        ))}
      </Grid>

      {/* כפתורי פעולה */}
      <Box sx={{ display: 'flex', gap: 1.2, mt: 2, justifyContent: 'flex-end' }}>
        <Button variant="soft" color="neutral" onClick={handleReset}>
          איפוס
        </Button>
        <Button variant="soft" color="neutral" onClick={onClose}>
          בטל
        </Button>
        <Button variant="solid" color="success" onClick={handleSave} disabled={disableSave}>
          שמור
        </Button>
      </Box>
    </Box>
  );
}
