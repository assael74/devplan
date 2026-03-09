// j_sortings/sortOptions.js

export const sortOptions = [
  {
    id: 'byClub',
    label: 'לפי מועדון',
    applicableTo: {
      objects: ['meetings', 'players', 'teams'],
      view: ['profileAnalyst']
    }
  },
  {
    id: 'byTeam',
    label: 'לפי קבוצה',
    applicableTo: {
      objects: ['meetings', 'players', 'games'],
      view: ['profileAnalyst']
    }
  },
  {
    id: 'byAlfa',
    label: 'לפי האלפבית',
    applicableTo: {
      objects: ['teams', 'players','meetings', 'payments'],
      view: ['profileAnalyst', 'profileTeam']
    }
  },
  {
    id: 'byLevel',
    label: 'לפי יכולת',
    applicableTo: {
      objects: ['players'],
      view: ['profileAnalyst', 'profileTeam']
    }
  },
  {
    id: 'byLevelPotential',
    label: 'לפי פוטנציאל',
    applicableTo: {
      objects: ['players'],
      view: ['profileAnalyst', 'profileTeam']
    }
  },
  {
    id: 'byStatus',
    label: 'לפי סטטוס',
    applicableTo: {
      objects: ['payments'],
      view: ['profileAnalyst', 'profileTeam', 'profilePlayer']
    }
  },
  {
    id: 'byMeetDate',
    label: 'לפי תאריך פגישה',
    applicableTo: {
      objects: ['meetings'],
      view: ['profileAnalyst', 'profilePlayer']
    }
  },
  {
    id: 'byDateFor',
    label: 'לפי תאריך',
    applicableTo: {
      objects: ['meetings'],
      view: ['profileAnalyst', 'profilePlayer']
    }
  },
  {
  id: 'byBirth',
  label: 'לפי שנת לידה',
  applicableTo: {
    objects: ['players'],
    view: ['profileAnalyst']
  }
},
  {
    id: 'byPayFor',
    label: 'לפי חודש',
    applicableTo: {
      objects: ['payments'],
      view: ['profileAnalyst', 'profilePlayer']
    }
  },
  {
    id: 'byGameDate',
    label: 'לפי תאריך',
    applicableTo: {
      objects: ['games'],
      view: ['profileAnalyst', 'profilePlayer', 'profileTeam']
    }
  },
  {
    id: 'byPastGame',
    label: 'לפי התקיים',
    applicableTo: {
      objects: ['games'],
      view: ['profileAnalyst', 'profilePlayer', 'profileTeam']
    }
  },
  {
    id: 'byGoals',
    label: 'לפי כמות שערים',
    applicableTo: {
      objects: ['players'],
      view: ['profileAnalyst', 'profileTeam']
    }
  },
  {
    id: 'byAssists',
    label: 'לפי כמות בישולים',
    applicableTo: {
      objects: ['players'],
      view: ['profileAnalyst', 'profileTeam']
    }
  },
  {
    id: 'byPlayTimeRate',
    label: 'לפי אחוזי זמן משחק',
    applicableTo: {
      objects: ['players'],
      view: ['profileAnalyst', 'profileTeam']
    }
  },
];
