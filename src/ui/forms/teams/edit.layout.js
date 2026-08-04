// ui/forms/teams/edit.layout.js

export const teamEditLayout = {
  full: {
    identity: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 1,
      minWidth: 0,
    },
    leagueMain: {
      display: 'grid',
      gridTemplateColumns: '.9fr .6fr .6fr',
      gap: 1,
      minWidth: 0,
    },
    leagueStats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 1,
      minWidth: 0,
    },
    targetsMain: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 1,
      minWidth: 0,
    },
    targetsGoals: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 1,
      minWidth: 0,
    },
    source: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: 1,
      minWidth: 0,
    },
    status: {
      display: 'flex',
      gap: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      pt: 3,
    },
  },
  profile: {
    desktop: {
      identity: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 0.85,
        alignItems: 'start',
        minWidth: 0,
      },
      league: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: 0.85,
        alignItems: 'start',
        minWidth: 0,
      },
      status: {
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        minWidth: 0,
        pt: 2.45,
      },
    },
    mobile: {
      identity: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 0.85,
        alignItems: 'start',
        minWidth: 0,
      },
      league: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 0.85,
        alignItems: 'start',
        minWidth: 0,
      },
      status: {
        display: 'flex',
        gap: 0.75,
        flexWrap: 'wrap',
        alignItems: 'center',
        minWidth: 0,
      },
    },
  },
}
