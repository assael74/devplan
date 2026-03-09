import { calculateFullPlayerStats, calculateFullTeamStats, calculateFullScoutStats } from './statsUtils.js'

export const initGameStatsData = ({ gameStatsShorts = [], players = [], teams = [], games = [], scouting = [] }) => {
  // קישור סטטיסטיקות לכל שחקן
  const playersWithStats = players.map(player => {
    const playerGames = gameStatsShorts
      .filter(stat => stat.playerStats?.some(p => p.playerId === player.id))
      .map(stat => {
        const gameMeta = games.find(g => g.id === stat.gameId) || {};
        const playerStat = stat.playerStats.find(p => p.playerId === player.id);

        return {
          gameId: stat.gameId,
          teamId: stat.teamId,
          ...gameMeta,
          gameStats: playerStat,
        };
      });
    const playerFullStats = calculateFullPlayerStats(playerGames, 'all')

    return {
      ...player,
      playerGames,
      playerFullStats
    };
  });

  // קישור סטטיסטיקות לכל קבוצה
  const teamsWithStats = teams.map(team => {
    const teamGames = gameStatsShorts
      .filter(stat => stat.teamId === team.id)
      .map(stat => {
        const gameMeta = games.find(g => g.id === stat.gameId) || {};

        return {
          gameId: stat.gameId,
          ...gameMeta,
          teamStats: stat.teamStats,
          rivelStats: stat.rivelStats,
          playerStats: stat.playerStats,
        };
      });
    const teamFullStats = calculateFullTeamStats(teamGames)
    return {
      ...team,
      teamGames,
      teamFullStats
    };
  });

  // קישור סטטיסטיקות ישירות למשחקים עצמם (למקרה של תצוגה פר משחק)
  const gamesWithStats = games.map(game => {
    const gameStat = gameStatsShorts.find(stat => stat.gameId === game.id);
    return {
      ...game,
      hasStats: !!gameStat,
      playerStats: gameStat?.playerStats || [],
      teamStats: gameStat?.teamStats || [],
      rivelStats: gameStat?.rivelStats || [],
    };
  });

  const scoutingsWithStats = scouting.map(scout => {
    const scoutStats = calculateFullScoutStats(scout, 'all');
    
    return {
      ...scout,
      scoutStats,
    };
  });

  return {
    playersWithStats,
    teamsWithStats,
    gamesWithStats,
    scoutingsWithStats
  };
};
