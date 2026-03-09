import React, { useEffect } from 'react';
import { Box, IconButton, Button, Grid, Divider, Typography, Sheet, Stack, Chip } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import ClubSelectField from '../../f_forms/allFormInputs/selectUi/ClubSelectField.js';
import TeamSelectField from '../../f_forms/allFormInputs/selectUi/TeamSelectField.js';
import DateInputField from '../../f_forms/allFormInputs/dateUi/DateInputField.js';
import GameHomeSelector from '../../f_forms/allFormInputs/checkUi/GameHomeSelector.js'
import GameTypeSelectField from '../../f_forms/allFormInputs/selectUi/GameTypeSelectField.js'
import GameDifficultySelectField from '../../f_forms/allFormInputs/selectUi/GameDifficultySelectField.js'
import GameDurationSelectField from '../../f_forms/allFormInputs/selectUi/GameDurationSelectField.js'
import GenericInputField from '../../f_forms/allFormInputs/inputUi/GenericInputField.js'
import StatsPlayerFormContent from '../../f_forms/KC_StatsPlayerFormContent.js'
import GameStatsEditModalContent from './IB_GameStatsEditModalContent'

const computeResult = (gf, ga) => {
  const a = Number(gf);
  const b = Number(ga);
  if (Number.isNaN(a) || Number.isNaN(b)) return null; // אין שתי תוצאות עדיין
  if (a > b)  return 'win';
  if (a === b) return 'draw';
  return 'lose';
};

export default function GameEditModalContent({
  view,
  clubs,
  teams,
  update,
  isDirty,
  actions,
  isUpdate,
  isMobile,
  onChange,
  formProps,
  actionItem,
  handleReset,
  handleClose,
  handleSubmit,
  setActionItem,
  ...props
}) {
  const isGameInfo = actionItem === 'gameInfo';
  const isGameTime = actionItem === 'gameTime';
  const isGameResult = actionItem === 'gameResult';
  const isGameStats = actionItem === 'gameStats';
  const player = view === 'profilePlayer' ? formProps.players.find(i => i.id === update.gameStats.playerId) : null;

  useEffect(() => {
    const r = computeResult(update.goalsFor, update.goalsAgainst);
    onChange(prev => ({ ...prev, result: r }));   // ישמר במצב החיצוני
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [update.goalsFor, update.goalsAgainst]);

  const resultNow = computeResult(update.goalsFor, update.goalsAgainst);
  const teamName = update.teamId
    ? teams.find((t) => t.id === update.teamId)?.teamName || ''
    : '';

  const ResultChip = () => (
    <Chip
      variant="soft"
      color={resultNow === 'win' ? 'success' : resultNow === 'draw' ? 'warning' : 'danger'}
      startDecorator={resultNow ? iconUi({ id: resultNow }) : null}
      sx={{ fontWeight: 'bold' }}
    >
      {resultNow === 'win' ? 'ניצחון' : resultNow === 'draw' ? 'תיקו' : 'הפסד'}
    </Chip>
  );

  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isGameInfo && (
        <>
          {/*club*/}
          <Grid xs={12} md={8}>
            <ClubSelectField
              options={clubs}
              size={isMobile ? 'sm' : 'md'}
              value={update.clubId}
              readOnly={true}
            />
          </Grid>
          {/*team*/}
          <Grid xs={12} md={6}>
            <TeamSelectField
              options={teams}
              clubId={update.clubId}
              value={update.teamId}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, teamId: val }))}
            />
          </Grid>
          {/*rivel*/}
          <Grid xs={6} md={6}>
            <GenericInputField
              error={update.rivel === ''}
              value={update.rivel}
              size={isMobile ? 'sm' : 'md'}
              label='קבוצה יריבה'
              onChange={(val) => onChange((prev) => ({ ...prev, rivel: val }))}
            />
          </Grid>
          {/*difficulty*/}
          <Grid xs={6} md={4}>
            <GameDifficultySelectField
              error={update.difficulty === ''}
              value={update.difficulty}
              size={isMobile ? 'sm' : 'md'}
              label='רמת קושי'
              onChange={(val) => onChange((prev) => ({ ...prev, difficulty: val }))}
            />
          </Grid>
          {/*type*/}
          <Grid xs={6} md={4}>
            <GameTypeSelectField
              value={update.type}
              size={isMobile ? 'sm' : 'md'}
              label='סוג משחק'
              onChange={(val) => onChange((prev) => ({ ...prev, type: val }))}
            />
          </Grid>
          {/*home*/}
          <Grid xs={6} md={4}>
            <GameHomeSelector
              value={update.home}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, home: val }))}
            />
          </Grid>
        </>
      )}

      {isGameResult && (
        <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography level="title-md">תוצאת משחק</Typography>
            <ResultChip />
          </Stack>
          <Grid container spacing={1.5} alignItems="center">
            <Grid xs={12} md={5}>
              <Typography level="title-sm" sx={{ fontWeight: 'lg' }}>{teamName || 'בחר קבוצה'}</Typography>
              <GenericInputField
                type="number"
                size={isMobile ? 'sm' : 'md'}
                label="שערי זכות"
                onChange={(val) => onChange(prev => ({
                  ...prev,
                  goalsFor: val === '' ? null : Number(val)
                }))}
                value={update.goalsFor ?? ''}
              />
            </Grid>
            <Grid xs={12} md={2}>
              <Typography level="h3" sx={{ textAlign: 'center', pt: { xs: 1, md: 3 } }}>:</Typography>
            </Grid>
            <Grid xs={12} md={5}>
              <Typography level="title-sm" sx={{ fontWeight: 'lg' }}>{update.rivel || 'יריבה'}</Typography>
              <GenericInputField
                type="number"
                size={isMobile ? 'sm' : 'md'}
                label="שערי חובה"
                onChange={(val) => onChange(prev => ({
                  ...prev,
                  goalsAgainst: val === '' ? null : Number(val)
                }))}
                value={update.goalsAgainst ?? ''}
              />
            </Grid>
          </Grid>
        </Sheet>
      )}

      {isGameTime && (
        <>
          <Grid xs={12} sx={{ my: 1 }}>
            <Divider sx={{ '--Divider-childPosition': `${50}%` }}>
              <Typography level="title-md" gutterBottom> זמני המשחק</Typography>
            </Divider>
          </Grid>

          {/*date + hour*/}
          <Grid xs={12} md={8}>
            <DateInputField
              required
              context="game"
              label="תאריך משחק"
              labelTime="שעת המשחק"
              value={update.gameDate}
              timeValue={update.gameHour}
              size={isMobile ? 'sm' : 'md'}
              error={update.gameDate === ''}
              onChange={(val) => onChange((prev) => ({ ...prev, gameDate: val }))}
              onTimeChange={(val) => onChange((prev) => ({ ...prev, gameHour: val }))}
            />
          </Grid>

          {/*Duration*/}
          <Grid xs={6} md={4}>
            <GameDurationSelectField
              value={update.gameDuration}
              size={isMobile ? 'sm' : 'md'}
              placeholder="משך משחק בדקות"
              onChange={(val) => onChange((prev) => ({ ...prev, gameDuration: val }))}
            />
          </Grid>
        </>
      )}

      {isGameStats && (
        <GameStatsEditModalContent
          game={update}
          player={player}
          actions={actions}
          isMobile={isMobile}
          formProps={formProps}
          onClose={() => setActionItem('')}
        />
      )}

      {!isGameStats && (
        <Grid xs={12}>
          <Box sx={{ mt: 2, pt: 2, display: 'flex', gap: 1, flexDirection: 'row-reverse' }}>
            <Button
              {...updateButtProps('games', isMobile)}
              disabled={!isDirty || isUpdate}
              onClick={handleSubmit}
              loading={isUpdate}
            >
              עדכן משחק
            </Button>
            <IconButton {...clearButtProps(isMobile)} onClick={handleReset}>
              {iconUi({ id: 'clear' })}
            </IconButton>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
