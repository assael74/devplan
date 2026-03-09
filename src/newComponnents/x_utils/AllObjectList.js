import { listsInit } from './listsInit';
import { initGameStatsData } from './initGameStatsData';

export const allLists = (props) => {
  const {
    clubsShorts,
    teamsShorts,
    playersShorts,
    paymentsShorts,
    meetingsShorts,
    videosShorts,
    videoAnalysisShorts,
    tagsShorts,
    gameStatsShorts,
    gamesShorts,
    rolesShorts,
    scoutingShorts,
  } = props;

  const loaded = clubsShorts && teamsShorts && playersShorts;
  if (!loaded) {
    return {
      clubs: null,
      teams: null,
      players: null,
      payments: null,
      meetings: null,
      videos: null,
      videoAnalysis: null,
      tags: null,
      roles: null,
      games: null,
      gameStats: null,
      scouting: null
    };
  }

  // קריאה יחידה לכל רשימה
  const clubs = listsInit.clubs(props);
  const teamsRaw = listsInit.teams(props);
  const playersRaw = listsInit.players(props);
  const payments = listsInit.payments(props);
  const meetings = listsInit.meetings(props);
  const tags = listsInit.tags(props);
  const roles = listsInit.roles(props);
  const scouting = listsInit.scouting(props);
  const games = listsInit.games(props);
  const gameStats = listsInit.gameStats(props);
  const videos = listsInit.videos(props).map(v => ({ ...v, type: 'videos' }));
  const videoAnalysis = listsInit.videoAnalysis(props).map(v => ({ ...v, type: 'videoAnalyses' }));

  const { playersWithStats, teamsWithStats, gamesWithStats, scoutingsWithStats } = initGameStatsData({
    gameStatsShorts,
    players: playersRaw,
    teams: teamsRaw,
    games,
    scouting
  });

  // חיבור שחקנים/צוותים לקבוצות
  const teams = teamsWithStats.map(team => {
    const teamPlayers = playersWithStats.filter(p => p.teamId === team.id);
    const levels = teamPlayers.map(p => Number(p.level ?? 0));
    const potentials = teamPlayers.map(p => Number(p.levelPotential ?? 0));
    const teamRoles = roles.filter(t => t.teamId === team.id);

    const avg = (arr) => arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;

    return {
      ...team,
      teamClub: clubs.find(c => c.id === team.clubId),
      level: avg(levels),
      levelPotential: avg(potentials),
      roles: teamRoles
    };
  });

  const players = playersWithStats;

  const clubsWithRelations = clubs.map(club => {
    const clubTeams = teams.filter(t => t.clubId === club.id);
    const clubPlayers = players.filter(p => clubTeams.some(t => t.id === p.teamId));
    const clubRoles = roles.filter(t => t.clubId === club.id);

    const levels = clubPlayers.map(p => Number(p.level ?? 0));
    const potentials = clubPlayers.map(p => Number(p.levelPotential ?? 0));
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      ...club,
      teams: clubTeams,
      level: avg(levels),
      levelPotential: avg(potentials),
      roles: clubRoles
    };
  });

  return {
    clubs: clubsWithRelations,
    teams,
    players,
    payments,
    meetings,
    videos,
    videoAnalysis,
    tags,
    roles,
    scouting: scoutingsWithStats,
    games: gamesWithStats,
    gameStats,
  };
};
