// x_utils/objectSections.js
export const objectSections = {
  teams: {
    teamDetails: ['teamName', 'project', 'active', 'teamYear'],
    leagueInfo: ['league', 'position', 'points', 'goals'],
    staffInfo: ['roles'],
  },
  players: {
    playerDetails: [
      'active',
      'type',
      'phone',
    ],
    playerNameDetails: [
      'playerFirstName',
      'playerLastName',
      'playerShortName'
    ],
    playerAgeDetails: [
      'birth',
      'birthDay',
      'clubId',
      'teamId',
    ],
    parents: ['parents'],
    payments: ['playerPayments', 'isOpenPayment'],
    physical: ['bodyFat', 'height', 'weight' ]
  },
  // וכו'...
};
