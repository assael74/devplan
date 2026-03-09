// src/newComponents/a_firestore/actionData/updateRouter/shortsUpdateRouter.js

export const shortsUpdateRouter = {
  clubs: {
    clubName: { category: "clubs", subCategory: "info", field: "clubName" },
    active: { category: "clubs", subCategory: "info", field: "active" },
    photo: { category: "clubs", subCategory: "info", field: "photo" },
    ifaLink: { category: "clubs", subCategory: "info", field: "" },
    color: { category: "clubs", subCategory: "info", field: "" },
  },

  teams: {
    teamName: { category: "teams", subCategory: "info", field: "teamName" },
    active: { category: "teams", subCategory: "info", field: "active" },
    photo: { category: "teams", subCategory: "info", field: "photo" },
    project: { category: "teams", subCategory: "info", field: "project" },
    teamYear: { category: "teams", subCategory: "info", field: "teamYear" },
    ifaLink: { category: "teams", subCategory: "info", field: "" },
    color: { category: "teams", subCategory: "info", field: "" },
    league: { category: "teams", subCategory: "info", field: "" },
    points: { category: "teams", subCategory: "info", field: "" },
    position: { category: "teams", subCategory: "info", field: "" },
    goals: { category: "teams", subCategory: "info", field: "" },
  },

  players: {
    // פרטי זיהוי השם
    playerFirstName: { category: "players", subCategory: "name", field: "" },
    playerLastName: { category: "players", subCategory: "name", field: "" },
    playerShortName: { category: "players", subCategory: "name", field: "" },
    // פרטי מידע
    phone: { category: "players", subCategory: "info", field: "" },
    photo: { category: "players", subCategory: "info", field: "" },
    birth: { category: "players", subCategory: "info", field: "" },
    birthDay: { category: "players", subCategory: "info", field: "" },
    active: { category: "players", subCategory: "info", field: "" },
    type: { category: "players", subCategory: "info", field: "" },
    positions: { category: "players", subCategory: "info", field: "" },
    ifaLink: { category: "players", subCategory: "info", field: "" },
    projectStatus: { category: "players", subCategory: "info", field: "" },
    /// הורה
    parents: { category: "players", subCategory: "parents", field: "" },
    // שיוך לקבוצה
    teamId: { category: "players", subCategory: "team", field: "" },
    clubId: { category: "players", subCategory: "team", field: "" },
    // נתוני נתוחי וידאו
    analysis: { category: "players", subCategory: "analysis", field: "" },
    // נתונים מקצועיים
    proToWatch: { category: "players", subCategory: "proInfo", field: "" },
    favoriteClub: { category: "players", subCategory: "proInfo", field: "" },
    height: { category: "players", subCategory: "proInfo", field: "" },
    weight: { category: "players", subCategory: "proInfo", field: "" },
    bodyFat: { category: "players", subCategory: "proInfo", field: "" },
    // סטטיסטיקה
    totalTime: { category: "players", subCategory: "stats", field: "" },
    timePlay: { category: "players", subCategory: "stats", field: "" },
    goals: { category: "players", subCategory: "stats", field: "" },
    assists: { category: "players", subCategory: "stats", field: "" },
    games: { category: "players", subCategory: "stats", field: "" },
    // נתוני מפגשים
    meetings: { category: "players", subCategory: "meetings", field: "" },
    // תשלומים
    payments: { category: "players", subCategory: "playerPayments", field: "" },
    isOpenPayment: { category: "players", subCategory: "playerPayments", field: "" },
    /// יכולות
    abilities: { category: "players", subCategory: "abilities", field: "" },
    level: { category: "players", subCategory: "abilities", field: "" },
    levelPotential: { category: "players", subCategory: "abilities", field: "" },
  },

  meetings: {
    meetingDate: { category: "meetings", subCategory: "date", field: "" },
    meetingHour: { category: "meetings", subCategory: "date", field: "" },
    meetingFor: { category: "meetings", subCategory: "date", field: "" },

    video: { category: "meetings", subCategory: "video", field: "" },

    playerId: { category: "meetings", subCategory: "player", field: "" },
    playersId: { category: "meetings", subCategory: "player", field: "" },
    type: { category: "meetings", subCategory: "player", field: "" },
    status: { category: "meetings", subCategory: "player", field: "" },

    notes: { category: "meetings", subCategory: "notes", field: "" },
    tags: { category: "meetings", subCategory: "notes", field: "" },
  },

  payments: {
    playerId: { category: "payments", subCategory: "opretive", field: "" },
    status: { category: "payments", subCategory: "opretive", field: "" },

    paymentFor: { category: "payments", subCategory: "profit", field: "" },
    price: { category: "payments", subCategory: "profit", field: "" },
    type: { category: "payments", subCategory: "profit", field: "" },
  },

  games: {
    clubId: { category: "games", subCategory: "info", field: "" },
    teamId: { category: "games", subCategory: "info", field: "" },
    rivel: { category: "games", subCategory: "info", field: "" },
    home: { category: "games", subCategory: "info", field: "" },
    type: { category: "games", subCategory: "info", field: "" },
    difficulty: { category: "games", subCategory: "info", field: "" },

    gameDate: { category: "games", subCategory: "time", field: "" },
    gameHour: { category: "games", subCategory: "time", field: "" },
    gameDuration: { category: "games", subCategory: "time", field: "" },

    goalsFor: { category: "games", subCategory: "result", field: "" },
    goalsAgainst: { category: "games", subCategory: "result", field: "" },
    result: { category: "games", subCategory: "result", field: "" },

    players: { category: "games", subCategory: "players", field: "" },

    scoutPlayers: { category: "games", subCategory: "scoutPlayers", field: "" },
  },

  videos: {
    name: { category: "videos", subCategory: "videoNames", field: "" },
    link: { category: "videos", subCategory: "videoLinks", field: "" },
    comments: { category: "videos", subCategory: "videoComments", field: "" },
    tags: { category: "videos", subCategory: "videoTags", field: "" },
  },

  videoAnalyses: {
    comments: { category: "videoAnalyses", subCategory: "analysisComments", field: "" },

    name: { category: "videoAnalyses", subCategory: "analysisInfo", field: "" },
    link: { category: "videoAnalyses", subCategory: "analysisInfo", field: "" },
    meetingId: { category: "videoAnalyses", subCategory: "analysisInfo", field: "" },
    analysDate: { category: "videoAnalyses", subCategory: "analysisInfo", field: "" },

    players: { category: "videoAnalyses", subCategory: "analysisPlayers", field: "" },
    tags: { category: "videoAnalyses", subCategory: "analysisTags", field: "" },
  },

  tags: {
    tagName: { category: "tags", subCategory: "tagInfo", field: "" },
    tagType: { category: "tags", subCategory: "tagInfo", field: "" },
  },

  roles: {
    fullName: { category: "roles", subCategory: "info", field: "fullName" },
    type: { category: "roles", subCategory: "info", field: "type" },
    clubId: { category: "roles", subCategory: "info", field: "clubId" },
    teamId: { category: "roles", subCategory: "info", field: "teamId" },
    photo: { category: "roles", subCategory: "info", field: "photo" },

    phone: { category: "roles", subCategory: "contact", field: "" },
    email: { category: "roles", subCategory: "contact", field: "" },
  },

  scouting: {
    playerName: { category: "scouting", subCategory: "info", field: "" },
    teamName: { category: "scouting", subCategory: "info", field: "" },
    clubName: { category: "scouting", subCategory: "info", field: "" },
    birth: { category: "scouting", subCategory: "info", field: "" },
    positions: { category: "scouting", subCategory: "info", field: "" },
    ifaLink: { category: "scouting", subCategory: "info", field: "" },
    league: { category: "scouting", subCategory: "info", field: "" },
    photo: { category: "scouting", subCategory: "info", field: "" },
    active: { category: "scouting", subCategory: "info", field: "" },
    notes: { category: "scouting", subCategory: "info", field: "" },

    games: { category: "scouting", subCategory: "games", field: "" },
    lastCheck: { category: "scouting", subCategory: "games", field: "" },
  }

  // תוכל להוסיף כאן קטגוריות חדשות בעתיד
};
