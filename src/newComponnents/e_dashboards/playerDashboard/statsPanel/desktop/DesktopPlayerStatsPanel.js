import { useState, useMemo } from 'react';
import { Box, Typography, Sheet, Grid } from '@mui/joy';
import { useTheme } from '@mui/joy/styles';
import { calculateFullPlayerStats, statsMobileGroupViewOptions } from '../../../../x_utils/statsUtils.js'
import { boxHeaderProps, typoHeadProps, sheetHeaderProps, sheetDisplayProps, typoDisplayProps } from './X_Style';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import GameTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/GameTypeSelectField.js';
import GameViewTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewTypeSelectField.js';
import GameViewGroupSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewGroupSelectField.js';
import GameViewMultiGroupSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewMultiGroupSelectField.js';
import StatsMultiParmTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/StatsMultiParmTypeSelectField.js'

export default function DesktopPlayerStatsPanel({ view, player, statsParm = [], formProps }) {
  const [gameTypeFilter, setGameTypeFilter] = useState('league');
  const [gameGroupFilter, setGameGroupFilter] = useState(['timeGroup', 'qualityGroup']);

  const stats = useMemo(() => {
    if (!player?.playerGames) return null;
    return gameTypeFilter === 'all'
      ? calculateFullPlayerStats(player.playerGames, null)
      : calculateFullPlayerStats(player.playerGames, gameTypeFilter);
  }, [player.playerGames, gameTypeFilter]);

  if (!stats) return <Box sx={{ p: 2 }}>אין נתונים להצגה</Box>;

  const excludedFields = ['timePlayed', 'totalGameTime', 'isStarting'];

  const allStats = {};
  Object.entries(stats).forEach(([key, value]) => {
    allStats[key] = {
      value,
      fieldInfo: statsParm.find(p => p.id === key)
    };
  });

  const isAllSelected = gameGroupFilter.includes('all');
  // פילטר שדות לפי קבוצת סטטיסטיקות
  const selectedFields = isAllSelected
    ? Object.keys(stats).filter((id) => statsParm.some(p => p.id === id))
    : statsMobileGroupViewOptions
        .filter(g => gameGroupFilter.includes(g.id))
        .flatMap(g => g.fields);

  const visibleStats = statsParm
  .filter(p => selectedFields.includes(p.id) && !excludedFields.includes(p.id)) // ← כאן הסינון
  .map(p => ({
    key: p.id,
    value: stats[p.id],
    fieldInfo: p,
  })).filter(s => s.value !== undefined);

  const tripletGroups = {};
  const simpleStatsToShow = [];

  visibleStats.forEach(({ key, value, fieldInfo }) => {
    if (fieldInfo?.statsParmFieldType === 'triplet') {
      const group = fieldInfo.tripletGroup;
      if (!tripletGroups[group]) {
        tripletGroups[group] = { total: null, success: null };
      }
      if (key.endsWith('Total')) tripletGroups[group].total = value;
      if (key.endsWith('Success')) tripletGroups[group].success = value;
    } else {
      simpleStatsToShow.push({ key, value, label: fieldInfo?.statsParmShortName || fieldInfo?.statsParmName });
    }
  });

  return (
    <Box sx={{ px: 2, direction: 'rtl' }}>
      {/* כותרת */}
      <Box {...boxHeaderProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography {...typoHeadProps(1)}>סיכום סטטיסטיקה</Typography>
          <Typography sx={{ mt: 0.5 }}> - </Typography>
          <Typography {...typoHeadProps(2)}>משחקי עונת 25/26</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Box sx={{ width: 150 }}>
            <GameTypeSelectField value={gameTypeFilter} onChange={setGameTypeFilter} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 500, maxWidth: 600 }}>
            <GameViewMultiGroupSelectField
              view={view}
              statsParm={statsParm}
              value={gameGroupFilter}
              onChange={setGameGroupFilter}
            />
          </Box>
        </Box>
      </Box>

      {/* תצוגת סטטיסטיקות */}
      <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
        <Grid container spacing={2}>
          {/* זמן משחק */}
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

          {/* סגל והרכב */}
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

          {/* שדות נבחרים */}
          {Object.entries(tripletGroups).map(([group, { total, success }]) => {
            if (!total) return null;
            const rate = total > 0 ? Math.round((success / total) * 100) : 0;
            const label = statsParm.find(p => p.tripletGroup === group && p.id.endsWith('Total'))?.statsParmShortName || group;

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

          {simpleStatsToShow.map(({ key, value, label }) => (
            <Grid xs={6} key={key}>
              <Sheet {...sheetHeaderProps}>
                <Typography {...typoDisplayProps(iconUi({ id: key }))}>{label}</Typography>
                <Typography level="title-lg">
                  {typeof value === 'number' && String(value).includes('.') ? value.toFixed(1) : value}
                </Typography>
              </Sheet>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
