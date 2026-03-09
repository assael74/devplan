import { abilitiesList as abilityDefs } from './abilitiesList'

const getEmptyAbilities = () =>
  abilityDefs.reduce((acc, ability) => {
    acc[ability.id] = 0;
    return acc;
  }, {});

const buildMergedList = (
  shorts,
  mainDoc,
  mergeDocs,
  idField,
  extra = () => ({})
) => {
  if (!Array.isArray(shorts) || shorts.length === 0) return [];

  const docMap = Object.fromEntries(
    shorts.map(doc => [doc.docName, doc.list])
  );

  const mainList = docMap[mainDoc] || [];
  if (mainList.length === 0) return [];

  const mergedList = mainList.map(item => {
    const base = Array.isArray(mergeDocs)
      ? mergeDocs.reduce((acc, docName) => {
          const found = (docMap[docName] || []).find(i => i[idField] === item[idField]);
          return { ...acc, ...(found || {}) };
        }, {})
      : {};

    const mergedCore = { ...item, ...base };
    const extraObj   = extra(mergedCore, { docMap })

    return { ...mergedCore, ...extraObj };
  });

  return mergedList;
};

export const listsInit = {
  clubs: (props) =>
    buildMergedList(
      props.clubsShorts,
      'clubsInfo',
      ['staff', 'clubTeams', 'clubPlayers'],
      'id'
    ),

  teams: (props) =>
    buildMergedList(
      props.teamsShorts,
      'teamsInfo',
      ['staff', 'teamsPlayers'],
      'id'
    ),

  players: (props) => {
    const teams = listsInit.teams(props) || [];
    const clubs = listsInit.clubs(props) || [];
    const teamById = new Map(teams.map(t => [t.id, t]));
    const clubById = new Map(clubs.map(c => [c.id, c]));
    const collator = new Intl.Collator('he', { numeric: true, sensitivity: 'base' });

    const base = buildMergedList(
      props.playersShorts,
      'playersNames',
      [
        'playersInfo',
        'playersPaymentsId',
        'playersAnalysis',
        'playersTeam',
        'playersParents',
        'playersProInfo',
        'playersMeettings',
        'playersStats',
        'playersAbilities'
      ],
      'id',
      (item) => {
        // יכולות + level כבר היו לך
        const abilitiesList = props.playersShorts.find(x => x.docName === 'playersAbilities')?.list;
        const abilitiesEntry = abilitiesList?.find(i => i.id === item.id) ?? {};
        const rawAbilities = abilitiesEntry?.abilities;
        const isEmpty = !rawAbilities || Object.keys(rawAbilities).length === 0;
        const finalAbilities = isEmpty ? getEmptyAbilities() : rawAbilities;

        // שמות מועדון/קבוצה נגזרים למיון נוח
        const t = teamById.get(item.teamId);
        const c = t ? clubById.get(t.clubId) : undefined;

        return {
          playerFullName: `${item.playerFirstName} ${item.playerLastName}`,
          level: abilitiesEntry?.level ?? 0,
          abilities: finalAbilities,
          projectStatus: item.projectStatus ?? '',
          teamName: t?.name || '',
          clubName: c?.name || '',
        };
      }
    );

    const playersSorted = [...base].sort((a, b) => {
      // השוואה לפי clubId
      if (a.clubId !== b.clubId) {
        return String(a.clubId).localeCompare(String(b.clubId));
      }

      // השוואה לפי teamId
      if (a.teamId !== b.teamId) {
        return String(a.teamId).localeCompare(String(b.teamId));
      }

      // השוואה לפי level (יורד)
      const levelCmp = Number(b.level ?? 0) - Number(a.level ?? 0);
      if (levelCmp !== 0) return levelCmp;

      // שובר שוויון לפי שם
      const nameA = a.playerFullName || a.displayName || a.name || '';
      const nameB = b.playerFullName || b.displayName || b.name || '';
      return collator.compare(nameA, nameB);
    });

    //console.log(playersSorted.map(i=>i.clubId))
    return playersSorted;
  },

  roles: (props) =>
    buildMergedList(
      props.rolesShorts,
      'rolesInfo',
      ['rolesContact'],
      'id'
    ),

  scouting: (props) =>
    buildMergedList(
      props.scoutingShorts,
      'playersInfo',
      ['playersGames'],
      'id'
    ),

  payments: (props) =>
    buildMergedList(
      props.paymentsShorts,
      'paymentProfit',
      ['paymentOperative'],
      'id'
    ),

  videos: (props) =>
    buildMergedList(
      props.videosShorts,
      'videoNames',
      ['videoLinks', 'videoComments', 'videoTags'],
      'id'
    ),

  videoAnalysis: (props) =>
    buildMergedList(
      props.videoAnalysisShorts,
      'analysisComments',
      ['analysisInfo', 'analysisPlayers', 'analysisTags'],
      'id'
    ),

  tags: (props) =>
    buildMergedList(
      props.tagsShorts,
      'tagInfo',
      [],
      'id'
    ),

  games: (props) =>
    buildMergedList(
      props.gamesShorts,
      'gameInfo',
      ['gamePlayers', 'gameScoutPlayers', 'gameTime', 'gameResult'],
      'id'
    ),

  gameStats: (props) =>
    buildMergedList(
      props.gameStatsShorts,
      'gameStatsInfo',
      ['gameStatsTeam', 'gameStatsRivel', 'gameStatsPlayers'],
      'id'
    ),

  meetings: (props) => {
    const baseList = buildMergedList(
      props.meetingsShorts,
      'meetingDate',
      ['meetingVideo', 'meetingPlayer', 'meetingNotes'],
      'id'
    );

    if (!Array.isArray(baseList)) return [];

    const players = listsInit.players(props) || [];

    return baseList.map((meeting) => ({
      ...meeting,
      player:
        meeting.type === 'personal'
          ? players.find((p) => p.playerId === meeting.playerId)
          : null,
    }));
  },
};
