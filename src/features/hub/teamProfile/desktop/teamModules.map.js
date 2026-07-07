import React from 'react'

const lazyModule = loader => React.lazy(loader)

export const desktopTeamModulesMap = {
  management: lazyModule(() => import('./modules/management/TeamManagementModule.js')),
  trainings: lazyModule(() => import('./modules/trainings/TeamTrainingsModule.js')),
  players: lazyModule(() => import('./modules/players/TeamPlayersModule.js')),
  games: lazyModule(() => import('./modules/games/TeamGamesModule.js')),
  performance: lazyModule(() => import('./modules/performance/TeamPerformanceModule.js')),
  abilities: lazyModule(() => import('./modules/abilities/TeamAbilitiesModule.js')),
  videos: lazyModule(() => import('./modules/videos/TeamVideosModule.js')),
}
