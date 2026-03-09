// PrintableTeamStats.js — גרסת הדפסה לקבוצתיות + פירוט כל השחקנים
// דומה לסגנון PrintablePlayerAbilities.js: HTML נקי, RTL, מותאם למדפסת

import React, { forwardRef, useMemo } from 'react';
import { calculateFullTeamStats, calculateFullPlayerStats, statsMobileGroupViewOptions } from '../../../x_utils/statsUtils.js';
import { buildTeamStatsRows } from './X_utils';

const th = { border: '1px solid #ddd', padding: 8, textAlign: 'center', background: '#f7f7f7', fontWeight: 600 };
const td = { border: '1px solid #ddd', padding: 8, textAlign: 'center' };
const tdRight = { ...td, textAlign: 'right' };

export function pickVisibleFields(gameGroupFilter = []) {
  const selected = (gameGroupFilter || [])
    .map((id) => statsMobileGroupViewOptions.find((opt) => opt.id === id)?.fields || [])
    .flat();
  if (selected.length < 6) return [...selected, ...Array(6 - selected.length).fill('placeholder')];
  return selected.slice(0, 6);
}

export default forwardRef(function PrintableTeamStats({
  team,
  formProps = {},
  statsParm = [],
  gameTypeFilter = 'all',
  gameGroupFilter = ['timeGroup','qualityGroup'],
  normMode = 'raw',
}, ref) {
  const players = useMemo(() => (Array.isArray(formProps.players) ? formProps.players : []).filter(p => p.teamId === team?.id), [formProps.players, team?.id]);

  // ===== סיכום קבוצה =====
  const teamStats = useMemo(() => {
    const games = Array.isArray(team?.teamGames) ? team.teamGames : [];
    if (!games.length) return null;
    return gameTypeFilter === 'all' ? calculateFullTeamStats(games, null) : calculateFullTeamStats(games, gameTypeFilter);
  }, [team?.teamGames, gameTypeFilter]);

  // ===== טבלת שחקנים =====
  const visibleFields = useMemo(() => pickVisibleFields(gameGroupFilter), [gameGroupFilter]);

  const { FULL_TIME, headerLabels, rows } = useMemo(() => buildTeamStatsRows({
    teamGames: Array.isArray(team?.teamGames) ? team.teamGames : [],
    players,
    statsParm,
    gameTypeFilter,
    visibleFields,
    normMode,
    excludeNorm: new Set(['goals','assists','timePlayed','totalGameTime','playTimeRate']),
    calculateFullPlayerStats,
    groupByMap: {},
  }), [team?.teamGames, players, statsParm, gameTypeFilter, visibleFields, normMode]);

  return (
    <div ref={ref} id="print-root" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: 24 }}>
      {/* ===== כותרת ===== */}
      <div className="summary-section" style={{ marginBottom: 8 }}>
        <div className="avoid-break" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>דוח סטטיסטיקת קבוצה</h2>
          <div><b>שם קבוצה:</b> {team?.teamName || '-'}{team?.teamYear ? ` | שנתון ${team.teamYear}` : ''}</div>
          {teamStats ? (
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px,1fr))', gap: 8 }}>
              <div style={{ ...tdRight, background: '#fafafa' }}><b>משחקים:</b> {teamStats.gamesPlayed}</div>
              <div style={{ ...tdRight, background: '#fafafa' }}><b>נקודות:</b> {teamStats.points} / {teamStats.gamesPlayed * 3}</div>
              <div style={{ ...tdRight, background: '#fafafa' }}><b>אחוז הצלחה:</b> {Math.round(teamStats.successRate || 0)}%</div>
              <div style={{ ...tdRight, background: '#fafafa' }}><b>שערים:</b> {teamStats.goalsFor} / {teamStats.goalsAgainst}</div>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}><i>אין נתונים להצגה</i></div>
          )}
        </div>
      </div>

      {/* ===== טבלת כל השחקנים ===== */}
      <div className="avoid-break" style={{ marginTop: 8 }}>
        <h3 style={{ margin: '0 0 8px' }}>
        פירוט סטטיסטיקה — כל השחקנים{normMode === 'per90' ? ` (נרמול לפי זמן מלא קבוצה ${FULL_TIME} דק׳)` : ''}
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'right', width: 180 }}>שחקן</th>
              {headerLabels.map((label, i) => (
                <th key={`h-${i}`} style={th}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ player, cells }) => (
              <tr key={player.id}>
                <td style={{ ...tdRight, fontWeight: 500 }}>{player.playerFullName || '-'}</td>
                {cells.map((cell, i) => (
                  <td key={`c-${player.id}-${i}`} style={td}>{cell.display}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* הערת הדפסה */}
      <style>{`
        @media print {
          #print-root { padding: 0; }
          .page-break { page-break-after: always; }
          .avoid-break { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
});
