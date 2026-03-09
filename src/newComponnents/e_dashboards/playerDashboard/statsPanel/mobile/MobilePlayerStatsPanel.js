import { useState, useMemo } from 'react';
import { Box, Typography, Sheet, Grid } from '@mui/joy';
import { useTheme } from '@mui/joy/styles';
import { boxHeaderProps, typoHeadProps, sheetHeaderProps, sheetDisplayProps, typoDisplayProps } from './X_Style'
import { calculateFullPlayerStats, statsMobileGroupViewOptions } from '../../../../x_utils/statsUtils.js'
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import GameTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/GameTypeSelectField.js';
import GameViewTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewTypeSelectField.js';
import GameViewGroupSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewGroupSelectField.js';
import GameViewMultiGroupSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewMultiGroupSelectField.js';
import StatsParmTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/StatsParmTypeSelectField.js'

const typeColors = {
  offensive: '#ffcc80',   // כתום בהיר
  defensive: '#90caf9',   // כחול בהיר
  general: '#e0e0e0',     // אפור בהיר
};

export default function MobilePlayerStatsPanel({ view, player, statsParm = [] }) {
  const [gameTypeFilter, setGameTypeFilter] = useState('league');
  const [gameGroupFilter, setGameGroupFilter] = useState('all');

  const stats = useMemo(() => {
    if (!player?.playerGames) return null;
    return gameTypeFilter === 'all'
      ? calculateFullPlayerStats(player.playerGames, null)
      : calculateFullPlayerStats(player.playerGames, gameTypeFilter);
  }, [player.playerGames, gameTypeFilter]);

  const groupOption = statsMobileGroupViewOptions.find(g => g.id === gameGroupFilter);
  const groupFields = groupOption?.fields || [];

  const excludedFields = ['totalGameTime', 'timePlayed', 'isStarting'];

  const tripletGroups = {};
  const simpleStats = [];

  Object.entries(stats || {}).forEach(([key, value]) => {
    const fieldInfo = statsParm.find(p => p.id === key);
    if (!fieldInfo || excludedFields.includes(key)) return;

    if (fieldInfo.statsParmFieldType === 'triplet') {
      const group = fieldInfo.tripletGroup;
      if (!tripletGroups[group]) {
        tripletGroups[group] = { total: null, success: null };
      }
      if (key.endsWith('Total')) tripletGroups[group].total = value;
      if (key.endsWith('Success')) tripletGroups[group].success = value;
    } else {
      simpleStats.push({ key, label: fieldInfo.statsParmName || key, value });
    }
  });

  const tripletStatsToShow = Object.entries(tripletGroups).filter(([group]) => {
    if (gameGroupFilter === 'all') return true;
    return groupFields.includes(`${group}Total`) || groupFields.includes(`${group}Success`);
  });

  const simpleStatsToShow = simpleStats.filter(({ key }) => {
    if (gameGroupFilter === 'all') return true;
    return groupFields.includes(key);
  });

  return (
    <Box sx={{ direction: 'rtl' }}>
      <Box {...boxHeaderProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography {...typoHeadProps(1)}>סיכום סטטיסטיקה</Typography>
          <Typography sx={{ mt: 0.5 }}> - </Typography>
          <Typography {...typoHeadProps(2)}>משחקי עונת 25/26</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1, flexWrap: 'nowrap', width: 300 }}>
          <Box sx={{ width: 120 }}>
            <GameTypeSelectField value={gameTypeFilter} onChange={setGameTypeFilter} />
          </Box>
          <Box sx={{ width: 140 }}>
            <GameViewGroupSelectField
              view={view}
              statsParm={statsParm}
              value={gameGroupFilter}
              onChange={setGameGroupFilter}
            />
          </Box>
        </Box>
      </Box>

      {!stats ? (
        <Box sx={{ p: 2 }}>אין נתונים להצגה</Box>
      ) : (
        <Grid container spacing={1} width={300}>
          {/* זמן משחק כולל */}
          <Grid xs={6}>
            <Sheet {...sheetHeaderProps}>
              <Typography {...typoDisplayProps(iconUi({ id: 'time', sx: { color: '#4caf50' } }))}>
                זמן משחק
              </Typography>
              <Typography level="title-lg">
                <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  ({Math.round(stats.playTimeRate || 0)}%)
                </Box>{' '}
                {stats.timePlayed || 0} / {stats.totalGameTime || 0}
              </Typography>
            </Sheet>
          </Grid>

          <Grid xs={3}>
            <Sheet {...sheetHeaderProps}>
              <Typography {...typoDisplayProps(iconUi({ id: 'isSquad', sx: { color: '#4caf50' } }))}>
                סגל
              </Typography>
              <Typography level="title-md">{stats.isSelected || 0}</Typography>
            </Sheet>
          </Grid>

          <Grid xs={3}>
            <Sheet {...sheetHeaderProps}>
              <Typography {...typoDisplayProps(iconUi({ id: 'isStart', sx: { color: '#4caf50' } }))}>
                הרכב
              </Typography>
              <Typography level="title-md">{stats.isStarting || 0}</Typography>
            </Sheet>
          </Grid>

          {/* Triplet Stats */}
          {tripletStatsToShow.map(([group, { total, success }]) => {
            if (!total) return null;
            const rate = total > 0 ? Math.round((success / total) * 100) : 0;
            const label = statsParm.find(p => p.tripletGroup === group)?.statsParmShortName || group;

            return (
              <Grid xs={6} key={group}>
                <Sheet {...sheetDisplayProps('info')}>
                  <Typography {...typoDisplayProps(iconUi({ id: group }))}>{label}</Typography>
                  <Typography level="title-lg">
                    <Box component="span" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                      ({rate}%)
                    </Box>{' '}
                    {success || 0} / {total}
                  </Typography>
                </Sheet>
              </Grid>
            );
          })}

          {/* Simple Stats */}
          {simpleStatsToShow.map(({ key, label, value }) => (
            <Grid xs={3} key={key}>
              <Sheet {...sheetHeaderProps}>
                <Typography {...typoDisplayProps(iconUi({ id: key, sx: { mr: -0.5, fontSize: 'xs' } }))}>{label}</Typography>
                <Typography level="title-lg">
                  {typeof value === 'number' && String(value).includes('.') ? value.toFixed(1) : value}
                </Typography>
              </Sheet>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
