// features/insightsHub/videos/catalogs/view.js

export const TEAM_VIDEOS_VIEW_CONTEXTS = [
  {
    id: 'current',
    idIcon: 'current',
    idColor: 'success',
    label: 'מה תועד עד עכשיו',
    groups: [
      {
        id: 'volume',
        label: 'כמות וידאו',
        factGroups: ['volume'],
        metricGroups: ['pace'],
      },
      {
        id: 'analysisType',
        label: 'סוג ניתוח',
        factGroups: ['analysisType'],
        metricGroups: ['analysisMix'],
      },
      {
        id: 'monthlyActivity',
        label: 'פעילות חודשית',
        factGroups: ['monthlyActivity'],
        metricGroups: ['consistency'],
      },
      {
        id: 'tagging',
        label: 'תיוגים ונושאים',
        factGroups: ['tagging'],
        metricGroups: ['tagging'],
      },
    ],
  },
  {
    id: 'quality',
    idIcon: 'insights',
    idColor: 'primary',
    label: 'איכות מבנה הניתוח',
    groups: [
      {
        id: 'coverage',
        label: 'כיסוי ועומק',
        factGroups: ['tagging'],
        metricGroups: ['tagging'],
      },
      {
        id: 'consistency',
        label: 'עקביות עבודה',
        factGroups: ['monthlyActivity'],
        metricGroups: ['consistency', 'pace'],
      },
    ],
  },
  {
    id: 'projection',
    idIcon: 'projection',
    idColor: 'warning',
    label: 'מה צריך לבצע',
    groups: [
      {
        id: 'routineBenchmark',
        label: 'שגרת וידאו קבוצתית',
        factGroups: [],
        metricGroups: ['pace', 'consistency'],
        benchmarkIds: [],
      },
      {
        id: 'taggingBenchmark',
        label: 'סטנדרט תיוג קבוצתי',
        factGroups: [],
        metricGroups: ['tagging'],
        benchmarkIds: [],
      },
    ],
  },
]

export const PLAYER_VIDEOS_VIEW_CONTEXTS = [
  {
    id: 'current',
    idIcon: 'current',
    idColor: 'success',
    label: 'מה תועד עד עכשיו',
    groups: [
      {
        id: 'volume',
        label: 'כמות וידאו',
        factGroups: ['volume'],
        metricGroups: ['pace'],
      },
      {
        id: 'analysisType',
        label: 'סוג ניתוח',
        factGroups: ['analysisType'],
        metricGroups: ['analysisMix'],
      },
      {
        id: 'monthlyActivity',
        label: 'פעילות חודשית',
        factGroups: ['monthlyActivity'],
        metricGroups: ['consistency'],
      },
      {
        id: 'tagging',
        label: 'תיוגים ונושאים',
        factGroups: ['tagging'],
        metricGroups: ['tagging'],
      },
    ],
  },
  {
    id: 'quality',
    idIcon: 'insights',
    idColor: 'primary',
    label: 'איכות מבנה הניתוח',
    groups: [
      {
        id: 'coverage',
        label: 'כיסוי ועומק',
        factGroups: ['tagging'],
        metricGroups: ['tagging'],
      },
      {
        id: 'consistency',
        label: 'עקביות ליווי',
        factGroups: ['monthlyActivity'],
        metricGroups: ['consistency', 'pace'],
      },
    ],
  },
  {
    id: 'projection',
    idIcon: 'projection',
    idColor: 'warning',
    label: 'מה צריך לבצע',
    groups: [
      {
        id: 'routineBenchmark',
        label: 'שגרת וידאו אישית',
        factGroups: [],
        metricGroups: ['pace', 'consistency'],
        benchmarkIds: [],
      },
      {
        id: 'taggingBenchmark',
        label: 'סטנדרט תיוג אישי',
        factGroups: [],
        metricGroups: ['tagging'],
        benchmarkIds: [],
      },
    ],
  },
]
