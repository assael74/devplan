import {
  AccessTime,
  BarChart,
  CalendarMonth,
  DataArray,
  DataSaverOn,
  DonutSmall,
  DragHandle,
  Hail,
  HealthAndSafety,
  OndemandVideo,
  QueryBuilder,
  QueryStats,
  Recycling,
  SportsSoccer,
  SportsHandball,
  SyncAlt,
  ThumbDown,
  ThumbUp,
  TrendingFlat,
  VolunteerActivism,
  PlaylistAddCircle,
} from '@mui/icons-material';

export const statsIcons = {
  assist: <VolunteerActivism />,
  assists: <VolunteerActivism />,

  ballClearancesSuccess: <Recycling />,
  ballClearancesSuccessRate: <Recycling />,
  ballClearancesTotal: <Recycling />,
  ballLoss: <ThumbDown />,

  crossesSuccess: <TrendingFlat />,
  crossesSuccessRate: <TrendingFlat />,
  crossesTotal: <TrendingFlat />,

  dribblesSuccess: <DragHandle />,
  dribblesSuccessRate: <DragHandle />,
  dribblesTotal: <DragHandle />,

  foulsCommitted: <ThumbDown />,
  foulsDrawn: <ThumbUp />,

  gamesCount: <CalendarMonth />,

  goal: <SportsSoccer />,
  goals: <SportsSoccer />,
  goalkeeping: <SportsHandball />,

  interceptions: <Recycling />,

  keyPasses: <PlaylistAddCircle />,
  keyPassesSuccess: <SyncAlt />,
  keyPassesSuccessRate: <SyncAlt />,
  keyPassesTotal: <SyncAlt />,

  keyTacklesSuccess: <HealthAndSafety />,
  keyTacklesSuccessRate: <HealthAndSafety />,
  keyTacklesTotal: <HealthAndSafety />,

  normalize: <DataSaverOn />,
  notNormalize: <DataArray />,

  passes: <SyncAlt />,
  passesSuccess: <SyncAlt />,
  passesSuccessRate: <SyncAlt />,
  passesTotal: <SyncAlt />,

  performance: <QueryStats />,

  personalPressuresSuccess: <Hail />,
  personalPressuresSuccessRate: <Hail />,
  personalPressuresTotal: <Hail />,

  playTimeRate: <DonutSmall />,
  position: <SportsSoccer />,
  positions: <SportsSoccer />,

  shotsOnTarget: <SportsSoccer />,
  shotsOnTargetSuccessRate: <SportsSoccer />,
  shotsTotal: <SportsSoccer />,

  stats: <BarChart />,
  statsParm: <BarChart />,

  tacklesSuccess: <HealthAndSafety />,
  tacklesSuccessRate: <HealthAndSafety />,
  tacklesTotal: <HealthAndSafety />,

  time: <QueryBuilder />,
  timePlayed: <AccessTime />,
  timeVideoStats: <OndemandVideo />,

  xG: <SportsSoccer />,
};
