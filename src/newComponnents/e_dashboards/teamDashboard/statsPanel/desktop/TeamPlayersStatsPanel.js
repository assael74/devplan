// TeamPlayersStatsPanel.js
import { useMemo, useState } from 'react';
import { Box, Table, Select, Option, Switch, Typography, Avatar, Chip } from '@mui/joy';
import { useTheme } from '@mui/joy/styles';
import { tableProps, boxWarperProps } from './X_Style'
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { buildTeamStatsRows, isPercentColumn } from '../X_utils';
import { calculateFullPlayerStats, statsMobileGroupViewOptions } from '../../../../x_utils/statsUtils.js';

export default function TeamPlayersStatsFlexiblePanel({
  team,
  formProps = {},
  statsParm = [],
  gameTypeFilter = 'all',
  gameGroupFilter = [],
  initialNorm = 'raw',
  enableColorDefault = true,
}) {
  const theme = useTheme();
  const [useGroupByPos, setUseGroupByPos] = useState(false);
  const [tempPos, setTempPos] = useState({});
  const [normMode, setNormMode] = useState(initialNorm); // 'raw' | 'per90' | 'percentile' | 'minmax'
  //const [useColorScale, setUseColorScale] = useState(enableColorDefault);
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'desc' });

  const positionOptions = formProps.positionOptions || [
    { id: 'GK', label: 'שוער' },
    { id: 'DC', label: 'בלם' },
    { id: 'FB', label: 'מגן' },
    { id: 'MC', label: 'קשר' },
    { id: 'W', label: 'כנף' },
    { id: 'FC', label: 'חלוץ' },
  ];
  const POS_ORDER = useMemo(
    () => (positionOptions || []).map(o => o.id.toUpperCase()), // ['GK','DC','FB','MC','W','FC']
    [positionOptions]
  );
  const getPosCode = (player) => {
    const tmp = String((tempPos[player.id] ?? '')).toUpperCase().trim();
    if (tmp) return tmp;
    // נפילה לעמדה הבסיסית אם קיימת (הוחזר מה־rows דרך util)
    return String(player.basePos || '').toUpperCase();
  };
  const posRank = (code) => {
    const idx = POS_ORDER.indexOf(String(code || '').toUpperCase());
    return idx === -1 ? POS_ORDER.length : idx;
  };

  // 1) שדות מוצגים
  const visibleFields = useMemo(() => {
    const selected = (gameGroupFilter || [])
      .map((groupId) => statsMobileGroupViewOptions.find((opt) => opt.id === groupId)?.fields || [])
      .flat();
    if (selected.length < 6) return [...selected, ...Array(6 - selected.length).fill('placeholder')];
    return selected.slice(0, 6);
  }, [gameGroupFilter]);

  // 2) בניית שורות וחישובים מחוץ לקומפוננטה (X_utils)
  const exclude = useMemo(
    () => new Set(['goals', 'assists', 'timePlayed', 'totalGameTime', 'playTimeRate']),
    []
  );

  const { FULL_TIME, headerLabels, rows } = useMemo(() => buildTeamStatsRows({
    teamGames: team?.teamGames || [],
    players: (formProps.players || []).filter(p => p.teamId === team?.id),
    statsParm,
    gameTypeFilter,
    visibleFields,
    normMode,
    excludeNorm: new Set(['goals','assists','timePlayed','totalGameTime','playTimeRate']),
    calculateFullPlayerStats,
    groupByMap:  tempPos,
  }), [team?.id, team?.teamGames, formProps.players, statsParm, gameTypeFilter, visibleFields, normMode, useGroupByPos, tempPos]);

  // 3) מיון לפי עמודה נבחרת
  const sortedRows = useMemo(() => {
    const dir = sortConfig.direction === 'asc' ? 1 : -1;

    const numForSort = (cell, fieldId) => {
      if (!cell) return -Infinity;

      // 1) value → raw → display
      let v = cell.value;
      if (v == null || !Number.isFinite(Number(v))) v = cell.raw;

      if (v == null || !Number.isFinite(Number(v))) {
        if (typeof cell.display === 'string') {
          // "85%" או "—"
          const t = cell.display.replace(/[^\d.\-]/g, '');
          v = t ? parseFloat(t) : NaN;
        }
      } else {
        v = Number(v);
      }

      // 2) איחוד סקלות לאחוזים: 0..1 → 0..100
      const isRate = String(fieldId).toLowerCase().includes('rate') || fieldId === 'playTimeRate';
      if (isRate && Number.isFinite(v) && v <= 1) v = v * 100;

      return Number.isFinite(v) ? v : -Infinity;
    };

    return [...rows].sort((a, b) => {
      // מיון לפי עמדה
      if (sortConfig.field === '__pos') {
        const ar = posRank(getPosCode(a.player));
        const br = posRank(getPosCode(b.player));
        if (ar !== br) return (ar - br) * dir;
        return String(a.player.playerFullName || '')
          .localeCompare(String(b.player.playerFullName || ''), 'he');
      }

      // מיון לפי עמודה
      if (!sortConfig.field) return 0;
      const idx = visibleFields.indexOf(sortConfig.field);
      if (idx < 0) return 0;

      const fieldId = visibleFields[idx];
      const an = numForSort(a.cells[idx], fieldId);
      const bn = numForSort(b.cells[idx], fieldId);
      return (an - bn) * dir;
    });
  }, [rows, sortConfig, visibleFields]);

  const headerClick = (field) => {
    if (field === 'placeholder') return;
    setSortConfig((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'desc' }
    );
  };

  const headerClickPos = () =>
    setSortConfig(prev =>
      prev.field === '__pos'
        ? { field: '__pos', direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field: '__pos', direction: 'asc' }
    );

  const sortLabel = sortConfig.field === '__pos' ? 'לפי עמדה' : (headerLabels[visibleFields.indexOf(sortConfig.field)] ?? sortConfig.field);

  return (
    <Box {...boxWarperProps}>
      {/* Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Typography level="title-sm">נרמול:</Typography>
        <Select size="sm" value={normMode} onChange={(_, v) => v && setNormMode(v)} sx={{ minWidth: 240 }}>
          <Option value="raw">Raw (מקורי)</Option>
          <Option value="per90">לפי זמן מלא קבוצה ({FULL_TIME} דק׳, ביצועים בדקות וידאו)</Option>
          <Option value="percentile">אחוזון בקבוצה</Option>
          <Option value="minmax">Min–Max (0–1)</Option>
        </Select>
        {sortConfig.field ? (
          <Chip size="sm" variant="soft">
            מיון: {sortLabel} {sortConfig.direction === 'asc' ? '↑' : '↓'}
          </Chip>
        ) : (
          <Chip size="sm" variant="soft">
            תצוגה לא ממוינת
          </Chip>
        )}
      </Box>
      {/* Table */}
      <Table {...tableProps}>
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th style={{ textAlign: 'center', width: 120 }}>שחקן</th>
            <th style={{ textAlign: 'center', width: 120 }} onClick={headerClickPos}>עמדה זמנית</th>
            {headerLabels.map((label, i) => (
              <th
                key={`header-${i}-${visibleFields[i]}`}
                style={{ textAlign: 'center', cursor: visibleFields[i] !== 'placeholder' ? 'pointer' : 'default' }}
                onClick={() => headerClick(visibleFields[i])}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map(({ player, cells }) => (
            <tr key={player.id}>
              <td style={{ width: 40 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Avatar size="sm" src={player.photo || playerImage} sx={{ width: 30, height: 30 }} />
                </Box>
              </td>
              <td style={{ width: 120 }}>{player.playerFullName}</td>
              <td style={{ width: 120 }}>
                <Select
                  size="sm"
                  value={tempPos[player.id] ?? ''}
                  onChange={(_, v) => setTempPos(prev => ({ ...prev, [player.id]: v || '' }))}
                  sx={{ minWidth: 110 }}
                >
                  <Option value="">—</Option>
                  {positionOptions.map(op => <Option key={op.id} value={op.id}>{op.label}</Option>)}
                </Select>
              </td>
              {cells.map((cell, i) => {
                const isPlaceholder = cell.field === 'placeholder';
                const groupIndex = Math.floor(i / 3);
                return (
                  <td
                    key={`cell-${player.id}-${i}-${cell.field}`}
                    style={{
                      textAlign:'center',
                      color: cell.textColor,
                      backgroundColor: isPercentColumn(cell.field, normMode) ? 'rgba(0,0,0,0.04)' : 'transparent',
                    }}
                  >
                    {cell.display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}
