import React, { useState, useEffect } from 'react';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { validateBeforeSave } from './X_Actions';
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { boxContentWraperProps } from './X_Style';
import { useTheme } from '@mui/joy/styles';
import { generateGameId } from './helpers/generateId.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import useGenericActions from './X_UseGenericActions';
import { useSmartNumberChange } from './helpers/useSmartStatChange.js'
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, ModalClose, Divider, Grid, Chip } from '@mui/joy';
import GenericInputField from './allFormInputs/inputUi/GenericInputField.js'
import ClubSelectField from './allFormInputs/selectUi/ClubSelectField.js';
import TeamSelectField from './allFormInputs/selectUi/TeamSelectField.js';
import DateInputField from './allFormInputs/dateUi/DateInputField.js';
import GameHomeSelector from './allFormInputs/checkUi/GameHomeSelector.js'
import GameDifficultySelectField from './allFormInputs/selectUi/GameDifficultySelectField.js'
import GameDurationSelectField from './allFormInputs/selectUi/GameDurationSelectField.js'
import GameTypeSelectField from './allFormInputs/selectUi/GameTypeSelectField.js'

export default function NewGameForm({
  type,
  idNav,
  games,
  teams,
  clubs,
  onSave,
  idForm,
  disabled,
  formProps,
  initialData,
  ...props
 }) {
  const initialState = {
    clubId: initialData?.clubId || '',
    teamId: initialData?.teamId || '',
    rivel: '',
    home: true,
    type: '',
    difficulty: 'equal',
    gameDate: '',
    gameHour: '',
    gameDuration: 90,
    goalsFor: 0,
    goalsAgainst: 0,
    result: 'draw'
  };
  const { showSnackbar } = useSnackbar();

  const validationRules = {
    clubId: (val) => !val || val.trim() === '',
    teamId: (val) => !val || val.trim() === '',
    rivel: (val) => !val || val.trim() === '',
    type: (val) => !val || val.trim() === '',
    gameDate: (val) => !val || val.trim() === '',
    gameHour: (val) => !val || val.trim() === '',
  };

  const [isAdding, setIsAdding] = useState(false);

  const {
    data,
    errors,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleClose,
    resetForm
  } = useGenericActions({
    initialState,
    validationRules,
    onSubmit: async (formData) => {
      const validationResult = validateBeforeSave(formData, { games }, 'game');

      if (validationResult !== true) {
        alert(validationResult); // מציג הודעת שגיאה אם יש
        return;
      }

      setIsAdding(true);

      try {
        const finalData = {
          ...formData,
          id: generateGameId(`${formData.teamId}${formData.rivel}`),
        };

        await onSave?.(finalData); // אם onSave היא async
        showSnackbar('משחק נוסף בהצלחה', 'success', 'games');
        setOpen(false);
      } catch (err) {
        console.error('שגיאה בהוספה:', err);
        showSnackbar('שגיאה בהוספת משחק', 'error', 'error');
      } finally {
        setIsAdding(false); // ✅ סיום לואדינג
      }
    },
  });

  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';
  const butSize = isMobile ? 'sm' : 'md'

  useEffect(() => {
    if (data.goalsFor !== '' && data.goalsAgainst !== '') {
      const result =
        data.goalsFor > data.goalsAgainst
          ? 'win'
          : data.goalsFor < data.goalsAgainst
          ? 'loss'
          : 'draw';
      handleChange('result', result);
    }
  }, [data.goalsFor, data.goalsAgainst]);

  const teamsList = Array.isArray(teams) ? teams : formProps?.teams || [];
  const teamName = data.teamId
    ? teamsList.find((t) => t.id === data.teamId)?.teamName || ''
    : '';

  const smartNumberChange = useSmartNumberChange(handleChange);

  const ResultChip = () => (
    <Chip
      variant="soft"
      color={data.result === 'win' ? 'success' : data.result === 'draw' ? 'warning' : 'danger'}
      startDecorator={iconUi({ id: data.result })}
      sx={{ fontWeight: 'bold' }}
    >
      {data.result === 'win' ? 'ניצחון' : data.result === 'draw' ? 'תיקו' : 'הפסד'}
    </Chip>
  );
  //console.log(teams, formProps.teams)
  return (
    <>
      {isTrulyMobile ? (
        <IconButton {...addIconButtProps('newGame', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newGame', sx: { fontSize: 25 } })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newGame', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף משחק
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס משחק חדש</Typography>
            </Box>
            <IconButton
              size={isMobile ? 'sm' : 'md'}
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
             >
               {iconUi({id: 'close' })}
              </IconButton>
          </Box>
          <Divider sx={{ mt: 'auto' }} />

          <Box {...boxContentWraperProps('games', isMobile)}>
            <Box className="content-inner">
            {/* Section: פרטי הקבוצות */}
            <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography level="title-md">פרטי הקבוצות</Typography>
              </Stack>
              <Grid container spacing={1.5}>
                <Grid xs={12} md={4}>
                  <ClubSelectField
                    error={errors.clubId}
                    options={clubs || formProps.clubs}
                    value={data.clubId}
                    formProps={formProps}
                    size={isMobile ? 'sm' : 'md'}
                    readOnly={idForm === 'teamDashboard'}
                    onChange={(val) => handleChange('clubId', val)}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <TeamSelectField
                    error={errors.teamId}
                    value={data.teamId}
                    size={isMobile ? 'sm' : 'md'}
                    readOnly={idForm === 'teamDashboard'}
                    onChange={(val) => handleChange('teamId', val)}
                    options={teamsList}
                    formProps={formProps}
                    clubId={data.clubId}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <GenericInputField
                    id="rivel"
                    size={isMobile ? 'sm' : 'md'}
                    error={errors.rivel}
                    value={data.rivel}
                    label="קבוצה יריבה"
                    onChange={(val) => handleChange('rivel', val)}
                  />
                </Grid>
              </Grid>
            </Sheet>
            {/* Section: מאפייני משחק */}
            <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography level="title-md">מאפייני המשחק</Typography>
                <GameHomeSelector
                  id="game_Home_Selector"
                  value={data.home}
                  size={isMobile ? 'sm' : 'md'}
                  onChange={(val) => handleChange('home', val)}
                />
              </Stack>
              <Grid container spacing={1.5}>
                <Grid xs={12} md={4}>
                  <GameTypeSelectField
                    id="gameType"
                    size={isMobile ? 'sm' : 'md'}
                    error={errors.type}
                    value={data.type}
                    label="סוג משחק"
                    onChange={(val) => handleChange('type', val)}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <GameDifficultySelectField
                    value={data.difficulty}
                    size={isMobile ? 'sm' : 'md'}
                    onChange={(val) => handleChange('difficulty', val)}
                  />
                </Grid>
                <Grid xs={12} md={4}>
                  <GameDurationSelectField
                    value={data.gameDuration}
                    size={isMobile ? 'sm' : 'md'}
                    placeholder="משך משחק בדקות"
                    onChange={useSmartNumberChange(handleChange)('gameDuration')}
                  />
                </Grid>
              </Grid>
            </Sheet>
            {/* Section: זמני משחק */}
            <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
              <Typography level="title-md" sx={{ mb: 1 }}>זמני המשחק</Typography>
              <Grid container spacing={1.5}>
                <Grid xs={12} md={8}>
                  <DateInputField
                    value={data.gameDate}
                    timeValue={data.gameHour}
                    onChange={(val) => handleChange('gameDate', val)}
                    onTimeChange={(val) => handleChange('gameHour', val)}
                    context="game"
                    required
                    size={isMobile ? 'sm' : 'md'}
                    label="תאריך משחק"
                    labelTime="שעת המשחק"
                    error={errors.gameDate}
                  />
                </Grid>
              </Grid>
            </Sheet>
            {/* Section: תוצאה */}
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
                    placeholder="0"
                    onChange={smartNumberChange('goalsFor')}
                    value={data.goalsFor === null ? '' : String(data.goalsFor)}
                  />
                </Grid>
                <Grid xs={12} md={2}>
                  <Typography level="h3" sx={{ textAlign: 'center', pt: { xs: 1, md: 3 } }}>:</Typography>
                </Grid>
                <Grid xs={12} md={5}>
                  <Typography level="title-sm" sx={{ fontWeight: 'lg' }}>{data.rivel || 'יריבה'}</Typography>
                  <GenericInputField
                    type="number"
                    size={isMobile ? 'sm' : 'md'}
                    label="שערי חובה"
                    placeholder="0"
                    onChange={smartNumberChange('goalsAgainst')}
                    value={data.goalsAgainst === null ? '' : String(data.goalsAgainst)}
                  />
                </Grid>
              </Grid>
            </Sheet>

            </Box>
          </Box>
          <Box {...footerBoxProps}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={1.2}
            >
              {/* פעולות משניות */}
              <Stack direction="row" spacing={0.8}>
                <Button
                  variant="soft"
                  color="neutral"
                  size={isMobile ? 'sm' : 'md'}
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  startDecorator={iconUi({ id: 'close', size: isMobile ? 'sm' : 'md' })}
                >
                  בטל
                </Button>
                <Tooltip title="נקה שדות">
                  <IconButton
                    variant="plain"
                    size={isMobile ? 'sm' : 'md'}
                    color="neutral"
                    onClick={() => resetForm()}
                    sx={{ borderRadius: 'xl' }}
                  >
                    {iconUi({ id: 'clear', size: isMobile ? 'sm' : 'md' })}
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* פעולה ראשית */}
              <Button
                color="success"
                variant="solid"
                size={isMobile ? 'sm' : 'md'}
                onClick={handleSubmit}
                startDecorator={iconUi({ id: 'check', size: isMobile ? 'sm' : 'md' })}
                sx={{ minWidth: { xs: '100%', sm: 160 }, borderRadius: 'lg' }}
              >
                הוסף משחק
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>
    </>
  );
}
