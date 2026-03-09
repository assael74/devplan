import { useState, useMemo, useRef } from 'react';
import { Box, Typography, Sheet, Grid, IconButton } from '@mui/joy';
import { useTheme } from '@mui/joy/styles';
import * as XLSX from 'xlsx';
import { useReactToPrint } from 'react-to-print';
import { calculateFullTeamStats, calculateFullPlayerStats } from '../../../../x_utils/statsUtils.js';
import { buildTeamStatsRows } from '../X_utils';
import { pickVisibleFields } from '../PrintableTeamStats.js'
import {
  boxHeaderProps,
  typoHeadProps,
  sheetHeaderProps,
  sheetDisplayProps,
  typoDisplayProps
} from './X_Style';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import GameTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/GameTypeSelectField.js';
import GameViewTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewTypeSelectField.js';
import GameViewMultiGroupSelectField from '../../../../f_forms/allFormInputs/selectUi/GameViewMultiGroupSelectField.js';
import StatsMultiParmTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/StatsMultiParmTypeSelectField.js';
import TeamPlayersStatsPanel from './TeamPlayersStatsPanel';
import PrintableTeamStats from '../PrintableTeamStats';

export default function DesktopTeamStatsPanel({ team, statsParm = [], formProps }) {
  const [viewType, setViewType] = useState('team');
  const [gameTypeFilter, setGameTypeFilter] = useState('league');
  const [gameGroupFilter, setGameGroupFilter] = useState(['timeGroup', 'qualityGroup']);
  const [teamGameGroupFilter, setTeamGameGroupFilter] = useState([]);

  const contentRef = useRef(null);
  const runPrint = useReactToPrint({
    contentRef,
    pageStyle: `
      @page { size: A4 portrait; margin: 16mm; }
      @media print {
        html, body { height: auto !important; }

        .r2p {
          position: static !important;
          left: auto !important; top: auto !important;
          width: auto !important; visibility: visible !important;
          transform: none !important;
        }
        .r2p * { visibility: visible !important; }

        /* טבלה רב-עמודית עם כותרת בכל עמוד */
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
        tr { break-inside: avoid; page-break-inside: avoid; }

        /* הסרת אילוץ שבירה מהסקשן העליון כדי שלא יווצר רווח גדול */
        .summary-section { break-inside: auto !important; }

        /* ודא שאין פתיחת עמוד לפני כותרות/טבלה */
        h3, table { break-before: auto !important; page-break-before: auto !important; }

        /* אם קיימת avoid-break בקוד – הגבול רק לפריטים קטנים, לא לכל הבלוק */
        .avoid-break { break-inside: avoid; }

        #print-root { padding: 0; }
      }
    `
  });
  const handlePrint = () => {
    runPrint();
  };

  const handleExportExcel = () => {
      // בונה את אותם נתונים בדיוק של טבלת השחקנים
    const visibleFields = pickVisibleFields(gameGroupFilter);
    const players = (formProps.players || []).filter(p => p.teamId === team?.id);

    const { headerLabels, rows } = buildTeamStatsRows({
      teamGames: team?.teamGames || [],
      players,
      statsParm,
      gameTypeFilter,
      visibleFields,
      normMode: 'raw', // או ה־state שלך אם יש
      excludeNorm: new Set(['goals','assists','timePlayed','totalGameTime','playTimeRate']),
      calculateFullPlayerStats,
      groupByMap: {},  // אם יש חלוקת עמדות זמנית – העבר אותה כאן
    });

    // בניית גיליון: כותרות + שורות תצוגה כמו במסך
    const aoa = [
      ['שחקן', ...headerLabels],
      ...rows.map(r => [r.player.playerFullName || '-', ...r.cells.map(c => c.display)]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    // רוחבי עמודות קלים
    ws['!cols'] = [{ wch: 22 }, ...headerLabels.map(() => ({ wch: 12 }))];
    XLSX.utils.book_append_sheet(wb, ws, 'Team Stats');
    XLSX.writeFile(wb, `${team?.teamName || 'team'}-stats.xlsx`);
  }

  const stats = useMemo(() => {
    if (!team?.teamGames) return null;
    return gameTypeFilter === 'all'
      ? calculateFullTeamStats(team.teamGames, null)
      : calculateFullTeamStats(team.teamGames, gameTypeFilter);
  }, [team?.teamGames, gameTypeFilter]);

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
    const selectedTypes = Array.isArray(teamGameGroupFilter) ? teamGameGroupFilter : [teamGameGroupFilter];
    const found = statsParm.some(
      (p) => p.tripletGroup === group && selectedTypes.includes(p.statsParmType)
    );
    return found;
  });

  const simpleStatsToShow = simpleStats.filter(({ key }) => {
    if (teamGameGroupFilter === 'all') return true;
    const selectedTypes = Array.isArray(teamGameGroupFilter) ? teamGameGroupFilter : [teamGameGroupFilter];
    const fieldInfo = statsParm.find(p => p.id === key);
    return selectedTypes.includes(fieldInfo?.statsParmType);
  });

  return (
    <Box sx={{ px: 2, direction: 'rtl' }}>
      <Box {...boxHeaderProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography {...typoHeadProps(1)}>סיכום סטטיסטיקה</Typography>
            <Typography sx={{ mt: 0.5 }}> - </Typography>
            <Typography {...typoHeadProps(2)}>משחקי עונת 25/26</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
          <Box>
            <IconButton size="sm" variant="solid" onClick={handleExportExcel}>{iconUi({id: 'newStats'})}</IconButton>
          </Box>
          <Box>
            <IconButton size="sm" variant="solid" onClick={handlePrint}>{iconUi({id: 'print'})}</IconButton>
          </Box>
          <Box sx={{ width: 150 }}>
            <GameViewTypeSelectField value={viewType} onChange={setViewType} />
          </Box>
          <Box sx={{ width: 150 }}>
            <GameTypeSelectField value={gameTypeFilter} onChange={setGameTypeFilter} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 500, maxWidth: 600 }}>
            {viewType === 'team' ? (
              <StatsMultiParmTypeSelectField
                statsParm={statsParm}
                value={teamGameGroupFilter}
                onChange={setTeamGameGroupFilter}
              />
            ) : (
              <GameViewMultiGroupSelectField
                statsParm={statsParm}
                value={gameGroupFilter}
                onChange={setGameGroupFilter}
              />
            )}
          </Box>
        </Box>
      </Box>

      {viewType === 'team' ? (
        <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
          <Grid container spacing={2}>
            <Grid xs={5}>
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

            <Grid xs={3.5}>
              <Sheet {...sheetHeaderProps}>
                <Typography {...typoDisplayProps(iconUi({ id: 'goal', sx: { color: '#4caf50' } }))}>
                  שערים
                </Typography>
                <Typography level="title-md">{stats.goalsFor}</Typography>
              </Sheet>
            </Grid>

            <Grid xs={3.5}>
              <Sheet {...sheetHeaderProps}>
                <Typography {...typoDisplayProps(iconUi({ id: 'goal', sx: { color: '#d32f2f' } }))}>
                  ספיגה
                </Typography>
                <Typography level="title-md">{stats.goalsAgainst}</Typography>
              </Sheet>
            </Grid>

            {tripletStatsToShow.map(([group, { total, success }]) => {
              if (!total) return null;
              const rate = total > 0 ? Math.round((success / total) * 100) : 0;
              const label =
                formProps?.statsParm?.find(p => p.tripletGroup === group)?.statsParmShortName || group;
              return (
                <Grid xs={5} key={group}>
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

            {simpleStatsToShow.map(({ key, label, value }) => (
              <Grid xs={3.5} key={key}>
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
      ) : (
        <TeamPlayersStatsPanel
          team={team}
          formProps={formProps}
          statsParm={statsParm}
          gameTypeFilter={gameTypeFilter}
          gameGroupFilter={gameGroupFilter}
        />
      )}

      {/* רנדר נסתר להדפסה */}
      <div ref={contentRef} className="r2p" style={{ position:'absolute', left:-10000, top:0 }}>
        <PrintableTeamStats
          team={team}
          formProps={formProps}
          statsParm={statsParm}
          gameTypeFilter={gameTypeFilter}
          gameGroupFilter={gameGroupFilter}
          normMode="raw"
        />
      </div>
    </Box>
  );
}
