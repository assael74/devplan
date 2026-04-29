// src/services/firestore/shorts/shortsUpdateRouter.js

export const shortsUpdateRouterMap = {
  players: {
    playerFirstName: { shortKey: 'players.playersNames', path: 'playerFirstName', mode: 'merge' },
    playerLastName: { shortKey: 'players.playersNames', path: 'playerLastName', mode: 'merge' },
    playerShortName: { shortKey: 'players.playersNames', path: 'playerShortName', mode: 'merge' },

    active: { shortKey: 'players.playersInfo', path: 'active', mode: 'merge' },
    birth: { shortKey: 'players.playersInfo', path: 'birth', mode: 'merge' },
    birthDay: { shortKey: 'players.playersInfo', path: 'birthDay', mode: 'merge' },
    phone: { shortKey: 'players.playersInfo', path: 'phone', mode: 'merge' },
    ifaLink: { shortKey: 'players.playersInfo', path: 'ifaLink', mode: 'merge' },
    type: { shortKey: 'players.playersInfo', path: 'type', mode: 'merge' },
    squadRole: { shortKey: 'players.playersInfo', path: 'squadRole', mode: 'merge' },
    photo: { shortKey: 'players.playersInfo', path: 'photo', mode: 'merge' },
    projectStatus: { shortKey: 'players.playersInfo', path: 'projectStatus', mode: 'merge' },

    positions: { shortKey: 'players.playersInfo', path: 'positions', mode: 'replace' },

    bodyFat: { shortKey: 'players.playersProInfo', path: 'bodyFat', mode: 'replace' },
    favoriteClub: { shortKey: 'players.playersProInfo', path: 'favoriteClub', mode: 'merge' },
    height: { shortKey: 'players.playersProInfo', path: 'height', mode: 'replace' },
    weight: { shortKey: 'players.playersProInfo', path: 'weight', mode: 'replace' },

    payments: { shortKey: 'players.playersPaymentsId', path: 'playerPayments', mode: 'replace' },
    parents: { shortKey: 'players.playersParents', path: 'parents', mode: 'replace' },

    abilities: { shortKey: 'players.playersAbilities', path: 'abilities', mode: 'merge' },
    formIds: { shortKey: 'players.playersAbilities', path: 'formIds', mode: 'merge' },
    level: { shortKey: 'players.playersAbilities', path: 'level', mode: 'merge' },
    levelPotential: { shortKey: 'players.playersAbilities', path: 'levelPotential', mode: 'merge' },
  },

  teams: {
    active: { shortKey: 'teams.teamsInfo', path: 'active', mode: 'merge' },
    color: { shortKey: 'teams.teamsInfo', path: 'color', mode: 'merge' },
    goals: { shortKey: 'teams.teamsInfo', path: 'goals', mode: 'merge' },
    ifaLink: { shortKey: 'teams.teamsInfo', path: 'ifaLink', mode: 'merge' },
    photo: { shortKey: 'teams.teamsInfo', path: 'photo', mode: 'merge' },
    points: { shortKey: 'teams.teamsInfo', path: 'points', mode: 'merge' },
    project: { shortKey: 'teams.teamsInfo', path: 'project', mode: 'merge' },
    teamName: { shortKey: 'teams.teamsInfo', path: 'teamName', mode: 'merge' },
    teamYear: { shortKey: 'teams.teamsInfo', path: 'teamYear', mode: 'merge' },
    league: { shortKey: 'teams.teamsInfo', path: 'league', mode: 'merge' },
    leagueLevel: { shortKey: 'teams.teamsInfo', path: 'leagueLevel', mode: 'merge' },
    leaguePosition: { shortKey: 'teams.teamsInfo', path: 'leaguePosition', mode: 'merge' },
    leagueGoalsFor: { shortKey: 'teams.teamsInfo', path: 'leagueGoalsFor', mode: 'merge' },
    leagueRound: { shortKey: 'teams.teamsInfo', path: 'leagueRound', mode: 'merge' },
    leagueGoalsAgainst: { shortKey: 'teams.teamsInfo', path: 'leagueGoalsAgainst', mode: 'merge' },

    targetsStatus: { shortKey: 'teams.teamsTargets', path: 'status', mode: 'merge' },
    targetsAssignedAt: { shortKey: 'teams.teamsTargets', path: 'assignedAt', mode: 'merge' },
    targetsAssignedBy: { shortKey: 'teams.teamsTargets', path: 'assignedBy', mode: 'merge' },
    targetsBenchmarkLevelId: { shortKey: 'teams.teamsTargets', path: 'benchmarkLevelId', mode: 'merge' },

    targetPosition: { shortKey: 'teams.teamsTargets', path: 'targetPosition', mode: 'merge' },
    targetGoalsFor: { shortKey: 'teams.teamsTargets', path: 'targetGoalsFor', mode: 'merge' },
    targetGoalsAgainst: { shortKey: 'teams.teamsTargets', path: 'targetGoalsAgainst', mode: 'merge' },
    targetPoints: { shortKey: 'teams.teamsTargets', path: 'targetPoints', mode: 'merge' },
    targetSuccessRate: { shortKey: 'teams.teamsTargets', path: 'targetSuccessRate', mode: 'merge' },

    trainingWeeks: { shortKey: 'teams.teamsTraining', path: 'trainingWeeks', mode: 'merge' },
  },

  clubs: {
    active: { shortKey: 'clubs.clubsInfo', path: 'active', mode: 'merge' },
    color: { shortKey: 'clubs.clubsInfo', path: 'color', mode: 'merge' },
    ifaLink: { shortKey: 'clubs.clubsInfo', path: 'ifaLink', mode: 'merge' },
    photo: { shortKey: 'clubs.clubsInfo', path: 'photo', mode: 'merge' },
    clubName: { shortKey: 'clubs.clubsInfo', path: 'clubName', mode: 'merge' },
  },

  roles: {
    email: { shortKey: 'roles.rolesContact', path: 'email', mode: 'merge' },
    phone: { shortKey: 'roles.rolesContact', path: 'phone', mode: 'merge' },

    clubsId: { shortKey: 'roles.rolesInfo', path: 'clubsId', mode: 'merge' },
    teamsId: { shortKey: 'roles.rolesInfo', path: 'teamsId', mode: 'merge' },
    active: { shortKey: 'roles.rolesInfo', path: 'active', mode: 'merge' },
    fullName: { shortKey: 'roles.rolesInfo', path: 'fullName', mode: 'merge' },
    photo: { shortKey: 'roles.rolesInfo', path: 'photo', mode: 'merge' },
    type: { shortKey: 'roles.rolesInfo', path: 'type', mode: 'merge' },
  },

  scouting: {
    active: { shortKey: 'scouting.playersInfo', path: 'active', mode: 'merge' },
    birth: { shortKey: 'scouting.playersInfo', path: 'birth', mode: 'merge' },
    clubName: { shortKey: 'scouting.playersInfo', path: 'clubName', mode: 'merge' },
    teamName: { shortKey: 'scouting.playersInfo', path: 'teamName', mode: 'merge' },
    ifaLink: { shortKey: 'scouting.playersInfo', path: 'ifaLink', mode: 'merge' },
    league: { shortKey: 'scouting.playersInfo', path: 'league', mode: 'merge' },
    notes: { shortKey: 'scouting.playersInfo', path: 'notes', mode: 'merge' },
    photo: { shortKey: 'scouting.playersInfo', path: 'photo', mode: 'merge' },
    playerName: { shortKey: 'scouting.playersInfo', path: 'playerName', mode: 'merge' },
    positions: { shortKey: 'scouting.playersInfo', path: 'positions', mode: 'merge' },

    games: { shortKey: 'scouting.playersGames', path: 'games', mode: 'replace' },
    lastCheck: { shortKey: 'scouting.playersGames', path: 'lastCheck', mode: 'merge' },
  },

  privates: {
    playerFirstName: { shortKey: 'privates.privatePlayersInfo', path: 'playerFirstName', mode: 'merge' },
    playerLastName: { shortKey: 'privates.privatePlayersInfo', path: 'playerLastName', mode: 'merge' },
    playerShortName: { shortKey: 'privates.privatePlayersInfo', path: 'playerShortName', mode: 'merge' },
    active: { shortKey: 'privates.privatePlayersInfo', path: 'active', mode: 'merge' },
    birth: { shortKey: 'privates.privatePlayersInfo', path: 'birth', mode: 'merge' },
    birthDay: { shortKey: 'privates.privatePlayersInfo', path: 'birthDay', mode: 'merge' },
    phone: { shortKey: 'privates.privatePlayersInfo', path: 'phone', mode: 'merge' },
    ifaLink: { shortKey: 'privates.privatePlayersInfo', path: 'ifaLink', mode: 'merge' },
    squadRole: { shortKey: 'privates.privatePlayersInfo', path: 'squadRole', mode: 'merge' },
    photo: { shortKey: 'privates.privatePlayersInfo', path: 'photo', mode: 'merge' },
    positions: { shortKey: 'privates.privatePlayersInfo', path: 'positions', mode: 'replace' },
    bodyFat: { shortKey: 'privates.privatePlayersInfo', path: 'bodyFat', mode: 'replace' },
    favoriteClub: { shortKey: 'privates.privatePlayersInfo', path: 'favoriteClub', mode: 'merge' },
    height: { shortKey: 'privates.privatePlayersInfo', path: 'height', mode: 'replace' },
    weight: { shortKey: 'privates.privatePlayersInfo', path: 'weight', mode: 'replace' },
    payments: { shortKey: 'privates.privatePlayersInfo', path: 'playerPayments', mode: 'replace' },
    parents: { shortKey: 'privates.privatePlayersInfo', path: 'parents', mode: 'replace' },

    abilities: { shortKey: 'privates.privatePlayersAbilities', path: 'abilities', mode: 'merge' },
    formIds: { shortKey: 'privates.privatePlayersAbilities', path: 'formIds', mode: 'merge' },
    level: { shortKey: 'privates.privatePlayersAbilities', path: 'level', mode: 'merge' },
    levelPotential: { shortKey: 'privates.privatePlayersAbilities', path: 'levelPotential', mode: 'merge' },
  },

  meetings: {
    eventId: { shortKey: 'meetings.meetingInfo', path: 'eventId', mode: 'merge' },
    meetingDate: { shortKey: 'meetings.meetingInfo', path: 'meetingDate', mode: 'merge' },
    meetingFor: { shortKey: 'meetings.meetingInfo', path: 'meetingFor', mode: 'merge' },
    meetingHour: { shortKey: 'meetings.meetingInfo', path: 'meetingHour', mode: 'merge' },
    teamId: { shortKey: 'meetings.meetingInfo', path: 'teamId', mode: 'merge' },
    playerId: { shortKey: 'meetings.meetingInfo', path: 'playerId', mode: 'merge' },
    playersId: { shortKey: 'meetings.meetingInfo', path: 'playersId', mode: 'merge' },
    type: { shortKey: 'meetings.meetingInfo', path: 'type', mode: 'merge' },
    status: { shortKey: 'meetings.meetingInfo', path: 'status', mode: 'merge' },
    createdById: { shortKey: 'meetings.meetingInfo', path: 'createdById', mode: 'merge' },
    createdByName: { shortKey: 'meetings.meetingInfo', path: 'createdByName', mode: 'merge' },

    notes: { shortKey: 'meetings.meetingNotes', path: 'notes', mode: 'merge' },
  },

  payments: {
    status: { shortKey: 'payments.paymentOperative', path: 'status', mode: 'merge' },

    paymentFor: { shortKey: 'payments.paymentProfit', path: 'paymentFor', mode: 'merge' },
    price: { shortKey: 'payments.paymentProfit', path: 'price', mode: 'merge' },
    type: { shortKey: 'payments.paymentProfit', path: 'type', mode: 'merge' },
  },

  games: {
    difficulty: { shortKey: 'games.gameInfo', path: 'difficulty', mode: 'merge' },
    home: { shortKey: 'games.gameInfo', path: 'home', mode: 'merge' },
    rivel: { shortKey: 'games.gameInfo', path: 'rivel', mode: 'merge' },
    type: { shortKey: 'games.gameInfo', path: 'type', mode: 'merge' },
    vLink: { shortKey: 'games.gameInfo', path: 'vLink', mode: 'merge' },

    gameDate: { shortKey: 'games.gameTime', path: 'gameDate', mode: 'merge' },
    gameDuration: { shortKey: 'games.gameTime', path: 'gameDuration', mode: 'merge' },
    gameHour: { shortKey: 'games.gameTime', path: 'gameHour', mode: 'merge' },

    goalsAgainst: { shortKey: 'games.gameResult', path: 'goalsAgainst', mode: 'merge' },
    goalsFor: { shortKey: 'games.gameResult', path: 'goalsFor', mode: 'merge' },
    result: { shortKey: 'games.gameResult', path: 'result', mode: 'merge' },

    gamePlayers: { shortKey: 'games.gamePlayers', path: 'gamePlayers', mode: 'merge' },
  },

  externalGames: {
    difficulty: { shortKey: 'externalGames.gameInfo', path: 'difficulty', mode: 'merge' },
    home: { shortKey: 'externalGames.gameInfo', path: 'home', mode: 'merge' },
    rivel: { shortKey: 'externalGames.gameInfo', path: 'rivel', mode: 'merge' },
    type: { shortKey: 'externalGames.gameInfo', path: 'type', mode: 'merge' },
    vLink: { shortKey: 'externalGames.gameInfo', path: 'vLink', mode: 'merge' },
    gameDate: { shortKey: 'externalGames.gameInfo', path: 'gameDate', mode: 'merge' },
    gameDuration: { shortKey: 'externalGames.gameInfo', path: 'gameDuration', mode: 'merge' },
    gameHour: { shortKey: 'externalGames.gameInfo', path: 'gameHour', mode: 'merge' },
    goalsAgainst: { shortKey: 'externalGames.gameInfo', path: 'goalsAgainst', mode: 'merge' },
    goalsFor: { shortKey: 'externalGames.gameInfo', path: 'goalsFor', mode: 'merge' },
    result: { shortKey: 'externalGames.gameInfo', path: 'result', mode: 'merge' },

    gamePlayers: { shortKey: 'externalGames.gamePlayers', path: 'gamePlayers', mode: 'merge' },
  },

  videoAnalysis: {
    notes: { shortKey: 'videoAnalysis.analysisNotes', path: 'notes', mode: 'merge' },

    tagIds: { shortKey: 'videoAnalysis.analysisTags', path: 'tagIds', mode: 'merge' },

    contextType: { shortKey: 'videoAnalysis.analysisInfo', path: 'contextType', mode: 'merge' },
    objectType: { shortKey: 'videoAnalysis.analysisInfo', path: 'objectType', mode: 'merge' },
    name: { shortKey: 'videoAnalysis.analysisInfo', path: 'name', mode: 'merge' },
    link: { shortKey: 'videoAnalysis.analysisInfo', path: 'link', mode: 'merge' },
    year: { shortKey: 'videoAnalysis.analysisInfo', path: 'year', mode: 'merge' },
    month: { shortKey: 'videoAnalysis.analysisInfo', path: 'month', mode: 'merge' },
    clubId: { shortKey: 'videoAnalysis.analysisInfo', path: 'clubId', mode: 'merge' },
    teamId: { shortKey: 'videoAnalysis.analysisInfo', path: 'teamId', mode: 'merge' },
    playerId: { shortKey: 'videoAnalysis.analysisInfo', path: 'playerId', mode: 'merge' },
    meetingId: { shortKey: 'videoAnalysis.analysisInfo', path: 'meetingId', mode: 'merge' },
  },

  videos: {
    notes: { shortKey: 'videos.videoNotes', path: 'notes', mode: 'merge' },

    tagIds: { shortKey: 'videos.videoTags', path: 'tagIds', mode: 'merge' },

    name: { shortKey: 'videos.videoInfo', path: 'name', mode: 'merge' },
    link: { shortKey: 'videos.videoInfo', path: 'link', mode: 'merge' },
    source: { shortKey: 'videos.videoInfo', path: 'source', mode: 'merge' },
    publishedAt: { shortKey: 'videos.videoInfo', path: 'publishedAt', mode: 'merge' },
    duration: { shortKey: 'videos.videoInfo', path: 'duration', mode: 'merge' },
    shares: { shortKey: 'videos.videoInfo', path: 'shares', mode: 'merge' },
    thumbnail: { shortKey: 'videos.videoInfo', path: 'thumbnail', mode: 'merge' },
  },

  tags: {
    color: { shortKey: 'tags.tagInfo', path: 'color', mode: 'merge' },
    iconId: { shortKey: 'tags.tagInfo', path: 'iconId', mode: 'merge' },
    isActive: { shortKey: 'tags.tagInfo', path: 'isActive', mode: 'merge' },
    notes: { shortKey: 'tags.tagInfo', path: 'notes', mode: 'merge' },
    slug: { shortKey: 'tags.tagInfo', path: 'slug', mode: 'merge' },
    tagName: { shortKey: 'tags.tagInfo', path: 'tagName', mode: 'merge' },
    tagType: { shortKey: 'tags.tagInfo', path: 'tagType', mode: 'merge' },
    parentId: { shortKey: 'tags.tagInfo', path: 'parentId', mode: 'merge' },
    order: { shortKey: 'tags.tagInfo', path: 'order', mode: 'merge' },
  },

  abilities: {
    formsAbilities: { shortKey: '', path: 'formsAbilities', mode: 'replace' },
  },

  tasks: {
    workspace: { shortKey: 'tasks.tasksInfo', path: 'workspace', mode: 'merge' },
    title: { shortKey: 'tasks.tasksInfo', path: 'title', mode: 'merge' },
    url: { shortKey: 'tasks.tasksInfo', path: 'url', mode: 'merge' },
    description: { shortKey: 'tasks.tasksInfo', path: 'description', mode: 'merge' },
    status: { shortKey: 'tasks.tasksInfo', path: 'status', mode: 'merge' },
    priority: { shortKey: 'tasks.tasksInfo', path: 'priority', mode: 'merge' },
    complexity: { shortKey: 'tasks.tasksInfo', path: 'complexity', mode: 'merge' },
    taskType: { shortKey: 'tasks.tasksInfo', path: 'taskType', mode: 'merge' },
    parentTaskId: { shortKey: 'tasks.tasksInfo', path: 'parentTaskId', mode: 'merge' },
    sortOrder: { shortKey: 'tasks.tasksInfo', path: 'sortOrder', mode: 'merge' },
    dueDate: { shortKey: 'tasks.tasksInfo', path: 'dueDate', mode: 'merge' },
    doneAt: { shortKey: 'tasks.tasksInfo', path: 'doneAt', mode: 'merge' },
  },
}

/**
 * פונקציית Router (כדי לתמוך ב-call sites שקוראים shortsUpdateRouter(...))
 */
export function shortsUpdateRouter(entityType, fieldKey) {
  return shortsUpdateRouterMap?.[entityType]?.[fieldKey] || null
}
