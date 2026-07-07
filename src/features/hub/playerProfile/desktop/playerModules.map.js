// features/hub/teamProfile/desktop/teamModules.map.js

import React from 'react'

const lazyModule = loader => React.lazy(loader)

export const desktopProjectPlayerModulesMap = {
  info: lazyModule(() => import('./modules/info/PlayerInfoModule')),
  abilities: lazyModule(() => import('./modules/abilities/PlayerAbilitiesModule')),
  games: lazyModule(() => import('./modules/games/PlayerGamesModule')),
  performance: lazyModule(() => import('./modules/performance/PlayerPerformanceModule')),
  meetings: lazyModule(() => import('./modules/meetings/PlayerMeetingsModule')),
  payments: lazyModule(() => import('./modules/payments/PlayerPaymentsModule')),
  videoAnalysis: lazyModule(() => import('./modules/videos/PlayerVideosModule.js')),
  trainings: lazyModule(() => import('./modules/trainings/PlayerTrainingsModule')),
}

export const desktopPlayerModulesMap = {
  info: lazyModule(() => import('./modules/info/PlayerInfoModule')),
  abilities: lazyModule(() => import('./modules/abilities/PlayerAbilitiesModule')),
  games: lazyModule(() => import('./modules/games/PlayerGamesModule')),
  performance: lazyModule(() => import('./modules/performance/PlayerPerformanceModule')),
  videoAnalysis: lazyModule(() => import('./modules/videos/PlayerVideosModule.js')),
}
