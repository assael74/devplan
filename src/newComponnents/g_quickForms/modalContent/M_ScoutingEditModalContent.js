import React from 'react';
import { Box, IconButton, Button, Grid } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import PlayerShortNameField from '../../f_forms/allFormInputs/inputUi/PlayerShortNameField.js'
import MonthYearPicker from '../../f_forms/allFormInputs/dateUi/MonthYearPicker.js'
import ClubNameField from '../../f_forms/allFormInputs/inputUi/ClubNameField.js';
import TeamNameField from '../../f_forms/allFormInputs/inputUi/TeamNameField.js';
import GenericInputField from '../../f_forms/allFormInputs/inputUi/GenericInputField.js'
import OnSquadSelector from '../../f_forms/allFormInputs/checkUi/OnSquadSelector.js'
import OnSquadStart from '../../f_forms/allFormInputs/checkUi/OnSquadStart.js'
import PlayerActiveSelector from '../../f_forms/allFormInputs/checkUi/PlayerActiveSelector.js'
import PlayerPositionsSelect from '../../f_forms/allFormInputs/selectUi/PlayerPositionsSelect.js'
import PlayerIfaLinkField from '../../f_forms/allFormInputs/inputUi/PlayerIfaLinkField.js'

export default function ScoutingEditModalContent({
  coach,
  update,
  isDirty,
  isUpdate,
  isMobile,
  onChange,
  actionItem,
  handleReset,
  handleClose,
  handleSubmit,
}) {
  const isPlayerInfo = actionItem === 'playerInfo';
  const isPlayerPro = actionItem === 'playerPro';
  const isPlayerPosition = actionItem === 'playerPosition';

  // עבודה עם מערך משחקים
  const games = Array.isArray(update.games) ? update.games : [];
  const lastIndex = games.length - 1;
  const lastGame = isPlayerPro && lastIndex >= 0 ? games[lastIndex] : null;

  const updateLastGameField = (field, value) => {
    if (!isPlayerPro || lastIndex < 0) return;
    onChange(prev => {
      const prevGames = Array.isArray(prev.games) ? prev.games : [];
      const idx = prevGames.length - 1;
      if (idx < 0) return prev;

      const updatedGames = [...prevGames];
      updatedGames[idx] = {
        ...updatedGames[idx],
        [field]: value,
      };

      return {
        ...prev,
        games: updatedGames,
      };
    });
  };

  return (
    <Grid container spacing={1} onClick={(e) => e.stopPropagation()}>
      {isPlayerInfo && (
        <>
          <Grid xs={6} md={4}>
            <PlayerShortNameField
              required
              size={isMobile ? 'sm' : 'md'}
              value={update.playerName}
              onChange={(val) => onChange((prev) => ({ ...prev, playerName: val }))}
            />
          </Grid>
          <Grid xs={6} md={4}>
            <ClubNameField
              required
              size={isMobile ? 'sm' : 'md'}
              value={update.clubName}
              onChange={(val) => onChange((prev) => ({ ...prev, clubName: val }))}
            />
          </Grid>
          <Grid xs={6} md={4}>
            <TeamNameField
              required
              size={isMobile ? 'sm' : 'md'}
              value={update.teamName}
              onChange={(val) => onChange((prev) => ({ ...prev, teamName: val }))}
            />
          </Grid>
          <Grid xs={6} md={8}>
            <GenericInputField
              required
              size='sm'
              label='ליגה'
              value={update.league}
              onChange={(val) => onChange((prev) => ({ ...prev, league: val }))}
            />
          </Grid>
          <Grid xs={12} md={8}>
            <MonthYearPicker
              required
              size={isMobile ? 'sm' : 'md'}
              key={update.birth}
              context="birth"
              label="שנתון"
              value={update.birth}
              onChange={(val) => onChange((prev) => ({ ...prev, birth: val }))}
            />
          </Grid>
          <Grid xs={6} md={4} sx={{ mt: 2.5 }}>
            <PlayerActiveSelector
              size={isMobile ? 'sm' : 'md'}
              value={update.active}
              onChange={(val) => onChange((prev) => ({ ...prev, active: val }))}
            />
          </Grid>
          <Grid xs={6} md={8}>
            <PlayerIfaLinkField
              size={isMobile ? 'sm' : 'md'}
              value={update.ifaLink}
              onChange={(val) => onChange((prev) => ({ ...prev, ifaLink: val }))}
            />
          </Grid>
        </>
      )}

      {isPlayerPro && lastGame && (
        <>
          {/* מועדון (קריאה בלבד) */}
          <Grid xs={12} md={4}>
            <ClubNameField
              readOnly
              size="sm"
              value={update.clubName}
            />
          </Grid>

          {/* קבוצה (השחקן) – קריאה בלבד */}
          <Grid xs={12} md={2}>
            <TeamNameField
              readOnly
              size="sm"
              value={update.teamName}
            />
          </Grid>

          {/* קבוצה יריבה */}
          <Grid xs={12} md={4}>
            <GenericInputField
              id="rivel"
              size="sm"
              value={lastGame.rivel || ''}
              label="קבוצה יריבה"
              onChange={(val) => updateLastGameField('rivel', val)}
            />
          </Grid>

          {/*מחזור*/}
          <Grid xs={12} md={2}>
            <GenericInputField
              type="number"
              size="sm"
              label="מחזור"
              placeholder="0"
              value={lastGame.gameNum ?? ''}
              onChange={(val) => {
                const next = val === '' ? '' : Number(val);
                updateLastGameField('gameNum', next);
              }}
            />
          </Grid>

          {/*שערים*/}
          <Grid xs={12} md={3}>
            <GenericInputField
              type="number"
              size="sm"
              label="כבש"
              placeholder="0"
              value={lastGame.scored ?? ''}
              onChange={(val) => {
                const next = val === '' ? '' : Number(val);
                updateLastGameField('scored', next);
              }}
            />
          </Grid>

          {/* משך משחק (סה"כ דקות) */}
          <Grid xs={12} md={3}>
            <GenericInputField
              type="number"
              size="sm"
              label="משך משחק"
              placeholder="0"
              value={lastGame.gameDuration ?? ''}
              onChange={(val) => {
                const next = val === '' ? '' : Number(val);
                updateLastGameField('gameDuration', next);
              }}
            />
          </Grid>

          {/* דקות ששיחק */}
          <Grid xs={6} md={3}>
            <GenericInputField
              type="number"
              size="sm"
              label="דקות ששיחק"
              placeholder="0"
              value={lastGame.timePlayed ?? ''}
              onChange={(val) => {
                const next = val === '' ? '' : Number(val);
                updateLastGameField('timePlayed', next);
              }}
            />
          </Grid>

          <Grid xs={6} md={12}>
            <Grid container spacing={1}>
              {/* פתח בהרכב */}
              <Grid xs={12} md={2}>
                <OnSquadSelector
                  size="sm"
                  value={Boolean(lastGame.isSelected)}
                  onChange={(event, checked) => {
                    const next =
                      typeof checked === 'boolean'
                        ? checked
                        : Boolean(event?.target?.checked);
                    updateLastGameField('isSelected', next);
                  }}
                />
              </Grid>

              {/* בסגל */}
              <Grid xs={12} md={2}>
                <OnSquadStart
                  size="sm"
                  value={Boolean(lastGame.isStarting)}
                  onChange={(event, checked) => {
                    const next =
                      typeof checked === 'boolean'
                        ? checked
                        : Boolean(event?.target?.checked);
                    updateLastGameField('isStarting', next);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </>
      )}

      {isPlayerPosition && (
        <Grid xs={12} md={10}>
          <PlayerPositionsSelect
            value={update.positions}
            onChange={(val) => onChange((prev) => ({ ...prev, positions: val }))}
          />
        </Grid>
      )}

      <Grid xs={12}>
        <Box
          sx={{
            mt: actionItem === 'playerPosition' ? 0 : 2,
            pt: actionItem === 'playerPosition' ? 0 : 2,
            display: 'flex',
            gap: 1,
            flexDirection: 'row-reverse',
          }}
        >
          <Button
            {...updateButtProps('scouting', isMobile)}
            disabled={!isDirty || isUpdate}
            onClick={handleSubmit}
            loading={isUpdate}
          >
            {actionItem === 'playerPro' ? 'הוסף משחק' : 'עדכן שחקן'}
          </Button>
          <IconButton
            {...clearButtProps(isMobile)}
            onClick={() => {
              if (actionItem === 'playerPro') {
                // ניקוי נתוני המשחק האחרון בלבד
                onChange(prev => {
                  const games = Array.isArray(prev.games) ? prev.games : [];
                  if (!games.length) return prev;

                  const lastIndex = games.length - 1;
                  const updatedGames = [...games];

                  updatedGames[lastIndex] = {
                    ...updatedGames[lastIndex],
                    rivel: '',
                    scored: '',
                    gameDuration: '',
                    timePlayed: '',
                    gameNum: '',
                    isSelected: false,
                    isStarting: false,
                  };

                  return {
                    ...prev,
                    games: updatedGames,
                  };
                });
              } else {
                handleReset();
              }
            }}
          >
            {iconUi({ id: 'clear' })}
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
}
