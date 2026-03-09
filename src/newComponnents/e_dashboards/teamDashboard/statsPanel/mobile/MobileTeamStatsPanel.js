import { useState, useMemo } from 'react';
import { Box, Typography, Sheet, Grid } from '@mui/joy';
import { useTheme } from '@mui/joy/styles';
import { calculateFullTeamStats, statsMobileGroupViewOptions } from '../../../../x_utils/statsUtils.js'
import { boxHeaderProps, typoHeadProps, sheetHeaderProps, sheetDisplayProps, typoDisplayProps } from './X_Style';
import { selectorBoxProps } from './X_Style';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import GameTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/GameTypeSelectField.js';
import GameViewGroupSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewGroupSelectField.js';
import StatsParmTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/StatsParmTypeSelectField.js'
import GameViewTypeSelector from '../../../../f_forms/allFormInputs/checkUi/GameViewTypeSelector.js'
import TeamPlayersStatsPanel from './TeamPlayersStatsPanel';

export default function MobileTeamStatsPanel({ team, statsParm = [], formProps }) {
  const [viewType, setViewType] = useState('teams');
  const [gameTypeFilter, setGameTypeFilter] = useState('league');
  const [gameGroupFilter, setGameGroupFilter] = useState('timeGroup');
  const [teamGameGroupFilter, setTeamGameGroupFilter] = useState('all');

  const stats = useMemo(() => {
    if (!team?.teamGames) return null;
    return gameTypeFilter === 'all'
      ? calculateFullTeamStats(team.teamGames, null)
      : calculateFullTeamStats(team.teamGames, gameTypeFilter);
  }, [team.teamGames, gameTypeFilter]);

  if (!stats) return <Box sx={{ p: 2 }}>אין נתונים להצגה</Box>;

  const excludedFields = [
    'gamesPlayed', 'wins', 'draws', 'losses', 'points', 'successRate',
    'goalsFor', 'goalsAgainst', 'timePlayed', 'totalGameTime', 'totalPlayers', 'goals'
  ];

  const tripletGroups = {};
  const simpleStats = [];

  Object.entries(stats).forEach(([key, value]) => {
    const fieldInfo = formProps?.statsParm?.find(p => p.id === key);
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
    if (teamGameGroupFilter === 'all') return true;
    return statsParm.some(
      p => p.tripletGroup === group && p.statsParmType === teamGameGroupFilter
    );
  });

  const simpleStatsToShow = simpleStats.filter(({ key }) => {
    if (teamGameGroupFilter === 'all') return true;
    const fieldInfo = statsParm.find(p => p.id === key);
    return fieldInfo?.statsParmType === teamGameGroupFilter;
  });

  return (
    <Box sx={{ direction: 'rtl' }}>
      <Box {...boxHeaderProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography {...typoHeadProps(1)}>סיכום סטטיסטיקה</Typography>
          <Typography sx={{ mt: 0.5 }}> - </Typography>
          <Typography {...typoHeadProps(2)}>משחקי עונת 25/26</Typography>
        </Box>

        <Box {...selectorBoxProps}>
          <Box sx={{ width: 75, mt: 1 }}>
            <GameViewTypeSelector size='xs' value={viewType} onChange={setViewType} />
          </Box>
          <Box sx={{ width: 110 }}>
            <GameTypeSelectField value={gameTypeFilter} onChange={setGameTypeFilter} />
          </Box>
          <Box sx={{ width: 125 }}>
            {viewType === 'teams' ? (
              <StatsParmTypeSelectField value={teamGameGroupFilter} onChange={setTeamGameGroupFilter} />
            ) : (
              <GameViewGroupSelectField value={gameGroupFilter} onChange={setGameGroupFilter} />
            )}
          </Box>
        </Box>
      </Box>

      {viewType === 'teams' ? (
        <Grid container spacing={1} width={310}>
          <Grid xs={6}>
            <Sheet {...sheetHeaderProps}>
              <Typography level="body-xs" sx={{ color: 'text.secondary', mb: 1 }}>
                יחס צבירת נק'
              </Typography>
              <Typography level="title-lg">
                <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  ({Math.round(stats.successRate || 0)}%)
                </Box>{' '}
                {stats.points || 0} / {stats.gamesPlayed * 3}
              </Typography>
            </Sheet>
          </Grid>

          <Grid xs={3}>
            <Sheet {...sheetHeaderProps}>
              <Typography {...typoDisplayProps(iconUi({ id: 'goal', sx: { color: '#4caf50', fontSize: 'xs', mr: -0.5 } }))}>
                שערים
              </Typography>
              <Typography level="title-md">{stats.goalsFor}</Typography>
            </Sheet>
          </Grid>

          <Grid xs={3}>
            <Sheet {...sheetHeaderProps}>
              <Typography {...typoDisplayProps(iconUi({ id: 'goal', sx: { color: '#d32f2f', fontSize: 'xs', mr: -0.5 } }))}>
                ספיגה
              </Typography>
              <Typography level="title-md">{stats.goalsAgainst}</Typography>
            </Sheet>
          </Grid>

          {tripletStatsToShow.map(([group, { total, success }]) => {
            if (!total) return null;
            const rate = total > 0 ? Math.round((success / total) * 100) : 0;
            const label = formProps?.statsParm?.find(p => p.tripletGroup === group)?.statsParmShortName || group;

            return (
              <Grid xs={6} key={group}>
                <Sheet {...sheetDisplayProps('info')}>
                  <Typography {...typoDisplayProps(iconUi({ id: group, sx: { fontSize: 'xs', mr: -0.5 } }))}>
                  {label}
                  </Typography>
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

          {simpleStatsToShow.map(({ key, label, value }) => {
            return (
              <Grid xs={3} key={key}>
                <Sheet {...sheetHeaderProps}>
                  <Typography {...typoDisplayProps(iconUi({ id: key, sx:{ fontSize: 'xs', mr: -0.5 } }))}>{label}</Typography>
                  <Typography level="title-lg">
                    {typeof value === 'number' && String(value).includes('.') ? value.toFixed(1) : value}
                  </Typography>
                </Sheet>
              </Grid>
            )
          })}
        </Grid>
      ) : (
        <TeamPlayersStatsPanel
          team={team}
          formProps={formProps}
          statsParm={statsParm}
          gameTypeFilter={gameTypeFilter}
          gameGroupFilter={gameGroupFilter}
          setGameTypeFilter={setGameTypeFilter}
        />
      )}
    </Box>
  );
}
