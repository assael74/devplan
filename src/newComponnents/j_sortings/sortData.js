import { isGameInPast } from '../x_utils/dateUtiles.js'

export function sortData(data, sortType, formProps, direction = 'asc') {
  if (!Array.isArray(data)) return [];

  const sortWithDirection = (arr, compareFn) =>
    direction === 'asc' ? [...arr].sort(compareFn) : [...arr].sort(compareFn).reverse();

  switch (sortType) {
    case 'byAlfa':
      return sortWithDirection(data, (a, b) =>
        (a.playerFullName || '').localeCompare(b.playerFullName || '', 'he', { sensitivity: 'base' })
      );

    case 'byTeam':
      return sortWithDirection(data, (a, b) => {
        const getTeamName = (player) => {
          const team = formProps?.teams?.find(t => t.teamId === player.teamId);
          return team?.teamName || '';
        };
        return getTeamName(a).localeCompare(getTeamName(b), 'he', { sensitivity: 'base' });
      });

    case 'byClub':
      return sortWithDirection(data, (a, b) => {
        const getClubName = (player) => {
          // קודם ננסה ישירות מהשחקן
          let clubId = player.clubId;

          // אם אין clubId בשחקן, ניגש דרך הקבוצה שלו
          if (!clubId && player.teamId) {
            const team = formProps?.teams?.find(t => t.id === player.teamId || t.teamId === player.teamId);
            clubId = team?.clubId;
          }

          const club = formProps?.clubs?.find(c => c.id === clubId || c.clubId === clubId);
          return club?.clubName || '';
        };

        return getClubName(a).localeCompare(getClubName(b), 'he', { sensitivity: 'base' });
      });

    case 'byMeetDate':
      return sortWithDirection(data, (a, b) => new Date(a.meetingDate) - new Date(b.meetingDate));

    case 'byDateFor':
      return sortWithDirection(data, (a, b) => new Date(a.meetingFor) - new Date(b.meetingFor));

    case 'byGameDate':
      return sortWithDirection(data, (a, b) => new Date(a.gameDate) - new Date(b.gameDate));

    case 'byPastGame':
      return sortWithDirection(data, (a, b) =>
        Number(isGameInPast(a.gameDate, a.gameHour)) - Number(isGameInPast(b.gameDate, b.gameHour))
      )

    case 'byBirth':
      return sortWithDirection(data, (a, b) => (a.birth || 0) - (b.birth || 0));

    case 'byStatus':
      return sortWithDirection(data, (a, b) =>
        (a.status?.id || '').localeCompare(b.status?.id || '', 'he', { sensitivity: 'base' })
      );

    case 'byPayFor':
      return sortWithDirection(data, (a, b) => new Date(a.paymentFor) - new Date(b.paymentFor));

    case 'byGoals':
      return sortWithDirection(data, (a, b) => a.playerFullStats.goals - b.playerFullStats.goals)

    case 'byAssists':
      return sortWithDirection(data, (a, b) => a.playerFullStats.assists - b.playerFullStats.assists)

    case 'byPlayTimeRate':
      return sortWithDirection(data, (a, b) => a.playerFullStats.playTimeRate - b.playerFullStats.playTimeRate)

    case 'byLevel':
      return sortWithDirection(data, (a, b) => a.level - b.level)

    case 'byLevelPotential':
      return sortWithDirection(data, (a, b) => a.levelPotential - b.levelPotential)

    default:
      return data;
  }
}
