import * as React from 'react';
import {
  FormControl,
  FormLabel,
  Select,
  Option,
  Stack,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Typography
} from '@mui/joy';
import {
  boxWraperFilterProps,
  selectFilterProps,
} from './X_Style'
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';
import { getFullDateIl } from '../../../x_utils/dateUtiles.js';
import { gameTypeOptions } from '../../../x_utils/optionLists.js';
import { statusStats } from '../../../x_utils/statsUtils.js'

export default function GameSelectField({
  value,
  label = 'בחר משחק',
  onChange,
  required,
  formProps,
  size = 'sm',
  options = [],
  error = false,
  disabled = false,
  filters,
  onFiltersChange,
  filterable = true,
  getStatsStatus, // (game) => 'none' | 'partial' | 'full'
}) {
  if (!filters || typeof onFiltersChange !== 'function') {
    console.error('GameSelectField: filters + onFiltersChange הם חובה במוד החיצוני.');
  }

  const { played = 'all', teamId = '', typeId = '', stats = 'all' } = filters || {};

  const clubs = Array.isArray(formProps?.clubs) ? formProps.clubs : [];
  const teams = Array.isArray(formProps?.teams) ? formProps.teams : [];

  const club = (clubId) => clubs.find((i) => i?.id === clubId) || {};
  const team = (teamId) => teams.find((i) => i?.id === teamId) || {};
  const typeLabel = (type) => gameTypeOptions.find((i) => i.id === type);

  const fontSize = size === 'sm' ? '0.775rem' : '0.975rem';

  // ממפה את המשחקים למבנה עשיר לתצוגה וסינון
  const richOptions = React.useMemo(() => {
    const now = new Date();
    return options
      .map((t) => {
        const tTeam = team(t.teamId);
        const tClub = club(t.clubId);
        const typeObj = typeLabel(t.type);

        // ← שימוש בפונקציה שלך (או alternative מה-prop אם סופק)
        const computed =
          typeof getStatsStatus === 'function'
            ? getStatsStatus(t) // אם אתה מעביר פונקציה חיצונית – תחזיר 'none' | 'partial' | 'full'
            : statusStats(t, formProps?.statsParm || []);

        // תמיכה בשתי תצורות החזרה: מחרוזת או אובייקט
        const st = typeof computed === 'string' ? computed : computed?.status || 'empty';
        const statsStatus = st === 'empty' ? 'none' : st; // מיפוי 'empty' -> 'none'

        // אם החזרת האובייקט שלך – אפשר לשמור גם את הספירות לתצוגה עתידית/tooltip
        const counts =
          typeof computed === 'string'
            ? null
            : {
                countIsStarting: computed?.countIsStarting,
                countIsSelect: computed?.countIsSelect,
              };

        return {
          id: t.id,
          value: t.id,
          rivel: t.rivel,
          type: t.type,
          typeLabelH: typeObj?.labelH || '',
          clubName: tClub?.clubName || '',
          teamId: t.teamId || '',
          teamYear: tTeam?.teamYear ?? '',
          teamName: tTeam?.teamName || '',
          gameDate: t.gameDate,
          isPast: t.gameDate ? new Date(t.gameDate) < now : false,
          statsStatus,      // 'none' | 'partial' | 'full'
          hasStats: statsStatus !== 'none',
          statsCounts: counts, // אופציונלי: לצ’יפ/Tooltip בהמשך
        };
      })
      .sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
  }, [options, teams, clubs, getStatsStatus, formProps?.statsParm]);

  // רשימת קבוצות למסנן
  const teamOptions = React.useMemo(() => {
    const map = new Map();
    richOptions.forEach((g) => {
      if (!map.has(g.teamId) && g.teamId) {
        map.set(g.teamId, {
          id: g.teamId,
          label: `${g.teamName} (${g.teamYear || '—'})`,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label, 'he', { sensitivity: 'base' })
    );
  }, [richOptions]);

  // סינון בפועל (לפי filters החיצוני)
  const filtered = React.useMemo(() => {
    return richOptions.filter((g) => {
      if (played === 'past' && !g.isPast) return false;
      if (played === 'future' && g.isPast) return false;
      if (teamId && g.teamId !== teamId) return false;
      if (typeId && g.type !== typeId) return false;
      if (
        stats !== 'all' &&
        ((stats === 'none' && g.statsStatus !== 'none') ||
          (stats === 'partial' && g.statsStatus !== 'partial') ||
          (stats === 'full' && g.statsStatus !== 'full'))
      ) return false;

      return true;
    });
  }, [richOptions, played, teamId, typeId, stats]);

  // עוזר לעדכון חלקי של המסננים
  const patchFilters = (patch) => {
    if (onFiltersChange) onFiltersChange(patch);
  };

  const resetFilters = () => {
    patchFilters({ played: 'all', teamId: '', typeId: '', stats: 'all' });
  };

  const StatsChip = ({ status, counts }) => {
    const chip =
      status === 'full' ? (
        <Chip size="sm" variant="soft" color="success">סטט’ מלאה</Chip>
      ) : status === 'partial' ? (
        <Chip size="sm" variant="soft" color="warning">סטט’ חלקית</Chip>
      ) : (
        <Chip size="sm" variant="soft" color="neutral">ללא סטט’</Chip>
      );

    if (!counts) return chip;

    const tip = `בהרכב: ${counts.countIsStarting?.trueCount || 0} | מסומנים: ${counts.countIsSelect?.trueCount || 0}`;
    return <Tooltip title={tip}>{chip}</Tooltip>;
  };

  const selectedOpt = React.useMemo(
    () => richOptions.find(o => o.value === value) || null,
    [richOptions, value]
  );

  return (
    <Stack gap={0.75} sx={{ width: '100%' }} direction="column" dir="rtl">
     {filterable && (
       <Box {...boxWraperFilterProps}>
         {/* Played */}
         <FormControl>
           <Select {...selectFilterProps} value={played} onChange={(_, v) => patchFilters({ played: v })}>
             <Option value="all">כל המשחקים</Option>
             <Option value="past">שכבר שוחקו</Option>
             <Option value="future">עתידיים</Option>
           </Select>
         </FormControl>
         {/* Team */}
         <FormControl>
           <Select {...selectFilterProps} value={teamId} onChange={(_, v) => patchFilters({ teamId: v ?? '' })}>
             <Option value="">כל הקבוצות</Option>
             {teamOptions.map((t) => (
               <Option key={t.id} value={t.id}>
                 {t.label}
               </Option>
             ))}
           </Select>
         </FormControl>
         {/* stats */}
         <FormControl>
           <Select {...selectFilterProps} value={stats} onChange={(_, v) => patchFilters({ stats: v })}>
             <Option value="all">כל הסטטיסטיקות</Option>
             <Option value="none">ללא סטטיסטיקה</Option>
             <Option value="partial">סטט’ חלקית</Option>
             <Option value="full">סטט’ מלאה</Option>
           </Select>
         </FormControl>
         {/* type */}
         <FormControl>
           <Select {...selectFilterProps} value={typeId} onChange={(_, v) => patchFilters({ typeId: v ?? '' })}>
             <Option value="">כל הסוגים</Option>
             {gameTypeOptions.map((gt) => (
               <Option key={gt.id} value={gt.id}>
                 {gt.labelH}
               </Option>
             ))}
           </Select>
         </FormControl>

         <Box flex={1} />

         <Tooltip title="איפוס מסננים">
           <IconButton
             variant="plain"
             size="sm"
             onClick={resetFilters}
             sx={{ mr: 0.5  }}
           >
             {iconUi({ id: 'clear', size: 'sm' })}
           </IconButton>
         </Tooltip>
       </Box>
     )}
      <FormControl error={error} required={required} sx={{ width: '100%' }}>
        <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
        <Select
          value={value}
          size={size}
          onChange={(_, val) => onChange(val)}
          placeholder="בחר משחק"
          indicator="▼"
          disabled={disabled}
          renderValue={() =>
            selectedOpt ? (
              <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                {/* נקודת מצב סטטיסטיקה */}
                <Box
                  sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    bgcolor:
                      selectedOpt.statsStatus === 'full'
                        ? 'success.solidBg'
                        : selectedOpt.statsStatus === 'partial'
                        ? 'warning.solidBg'
                        : 'neutral.outlinedBorder',
                    flex: '0 0 auto'
                  }}
                />
                {/* טקסט קומפקטי עם אליפסיס */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 0,
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#333',
                  }}
                >
                  <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedOpt.rivel} — {selectedOpt.clubName}
                  </Box>
                  <Box sx={{ opacity: 0.6 }}>•</Box>
                  <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ({selectedOpt.teamYear}) {selectedOpt.teamName}
                  </Box>
                  <Box sx={{ opacity: 0.6 }}>•</Box>
                  <Box sx={{ whiteSpace: 'nowrap' }}>{selectedOpt.typeLabelH}</Box>
                  <Box sx={{ opacity: 0.6 }}>•</Box>
                  <Box sx={{ whiteSpace: 'nowrap' }}>{getFullDateIl(selectedOpt.gameDate)}</Box>
                </Box>
              </Box>
            ) : null
          }
          slotProps={{
            listbox: {
              sx: { maxHeight: 320, width: '100%', direction: 'rtl' },
            },
            button: {
              sx: {
                fontSize,
                fontWeight: 500,
                color: '#333',
                textAlign: 'right',
                justifyContent: 'space-between',
                gap: 1,
              },
            },
          }}
        >
          {filtered.length === 0 && (
            <Option disabled value="__empty">אין תוצאות לסינון הנוכחי</Option>
          )}

          {filtered.map((opt) => (
            <Option key={opt.id} value={opt.value}>
              <Stack direction="column" gap={0.5} sx={{ width: '100%' }}>
                <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                  {iconUi({
                    id: 'games',
                    size,
                    sx: { color: opt.statsStatus === 'full' ? '#2e7d32' : opt.statsStatus === 'partial' ? '#ed6c02' : '#9e9e9e' },
                  })}
                  <Box sx={{ fontSize: '12px', fontWeight: 600 }}>
                    {opt.rivel} — {opt.clubName}
                  </Box>
                  <Divider orientation="vertical" />
                  <Box sx={{ fontSize: '10px' }}>({opt.teamYear}) {opt.teamName}</Box>
                  <Divider orientation="vertical" />
                  <Box sx={{ fontSize: '10px' }}>{opt.typeLabelH}</Box>
                  <Divider orientation="vertical" />
                  <Box sx={{ fontSize: '10px' }}>{getFullDateIl(opt.gameDate)}</Box>
                </Box>

                <Stack direction="row" gap={0.5} alignItems="center" flexWrap="wrap">
                  <StatsChip status={opt.statsStatus} counts={opt.statsCounts} />
                  {opt.isPast ? (
                    <Chip size="sm" variant="soft" color="neutral">שוחק</Chip>
                  ) : (
                    <Chip size="sm" variant="soft" color="primary">עתידי</Chip>
                  )}
                </Stack>
              </Stack>
            </Option>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
