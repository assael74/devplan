// TeamPlayersStatsPanel.js
import { useState, useMemo } from 'react';
import { calculateFullPlayerStats, statsMobileGroupViewOptions } from '../../../../x_utils/statsUtils.js'
import { Box, Table,  Select, Option, Avatar } from '@mui/joy';
import { useTheme } from '@mui/joy/styles';
import { tableProps } from './X_Style'
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';

export default function TeamPlayersStatsPanel({ team, formProps, statsParm, gameTypeFilter, gameGroupFilter }) {
  const [sortConfig, setSortConfig] = useState({ field: null, direction: 'asc' });

  const teamPlayers = formProps.players.filter(p=>p.teamId === team.id)
  const teamPlayersWithStats = useMemo(() => {
    return teamPlayers.map((player) => {
      const playerGames = player.playerGames || [];

      const stats = gameTypeFilter === 'all'
        ? calculateFullPlayerStats(playerGames, null)
        : calculateFullPlayerStats(playerGames, gameTypeFilter);

      const getStat = (key) => {
        const val = stats?.[key];
        if (val === undefined || val === null) return '-';
        return typeof val === 'number' && String(val).includes('.') ? val.toFixed(1) : val;
      };

      return {
        player,
        stats: {
          ...stats,
          getStat,
        },
      };
    });
  }, [teamPlayers, gameTypeFilter]);

  const visibleFields = statsMobileGroupViewOptions.find(p => p.id === gameGroupFilter)?.fields || [];

  const customHebrewLabels = {
    totalGameTime: 'זמן כולל',
    playTimeRate: 'אחוז דקות',
    successRate: 'אחוז הצלחה',
    points: 'סה״כ נקודות',
  };

  const headerFieldLabels = visibleFields.map(fieldId => {
    const fieldInfo = statsParm.find(p => p.id === fieldId);
    if (fieldInfo?.statsParmShortName) return fieldInfo.statsParmShortName;

    // תרגום ידני לשדות שלא קיימים ב־statsParm
    return customHebrewLabels[fieldId] || fieldId;
  });

  return (
    <Box sx={{ width: 310 }}>

      <Table {...tableProps}>
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th style={{ textAlign: 'center', width: 90 }}>שחקן</th>
            {headerFieldLabels.map((field) => {
              return (
                <th key={field} style={{ textAlign: 'center', width: 60 }}>{field}</th>
              )
            })}
          </tr>
        </thead>
        <tbody>
        {teamPlayersWithStats.map(({ player, stats }) => (
          <tr key={player.id}>
            <td style={{ width: 40 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar size="sm" src={player.photo || playerImage} sx={{ width: 20, height: 20 }} />
              </Box>
            </td>
            <td style={{ width: 60 }}>{player.playerFullName}</td>
            {visibleFields.map((field) => {
              const value = stats.getStat(field);
              const isPercent = field.toLowerCase().includes('rate');
              return (
                <td key={field}>
                  {value !== '-' ? `${isPercent ? Math.round(Number(value)) : value}${isPercent ? '%' : ''}` : '-'}
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
