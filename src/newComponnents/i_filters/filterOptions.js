const isYouthOrSenior = (name = '') => /נוער|בוגרים/.test(String(name));

export function getPlayerTeamOptions(formProps = {}) {
  const { teams = [], players = [] } = formProps;

  const teamById = new Map(teams.map(t => [String(t.id), t]));
  const seen = new Set();
  const out = [];

  for (const p of players) {
    const id = p?.teamId != null ? String(p.teamId) : '';
    if (!id || seen.has(id)) continue;
    const t = teamById.get(id);
    if (t) {
      out.push({ id: t.id, teamName: String(t.teamName || ''), teamYear: t.teamYear });
      seen.add(id);
    }
  }

  return out.sort((a, b) => {
    const ay = a.teamYear ?? null;
    const by = b.teamYear ?? null;

    if (ay != null && by != null) {
      const diff = Number(ay) - Number(by); // עולה לפי שנתון
      if (diff !== 0) return diff;
    } else if (ay != null && by == null) {
      return -1; // עם שנתון לפני בלי שנתון
    } else if (ay == null && by != null) {
      return 1;
    }

  // שובר שוויון לפי שם קבוצה
  return a.teamName.localeCompare(b.teamName, 'he', { numeric: true, sensitivity: 'base' });
});
}

export function getPlayerClubOptions(formProps = {}) {
  const { clubs = [], players = [] } = formProps;

  const clubById = new Map(clubs.map(c => [String(c.id), c]));
  const seen = new Set();
  const out = [];

  for (const p of players) {
    const id = p?.clubId != null ? String(p.clubId) : '';
    if (!id || seen.has(id)) continue;
    const c = clubById.get(id);
    if (c) {
      out.push({ id: c.id, clubName: String(c.clubName || '') });
      seen.add(id);
    }
  }

  return out.sort((a, b) =>
    a.clubName.localeCompare(b.clubName, 'he', { numeric: true, sensitivity: 'base' })
  );
}

export function getTeamClubOptions(formProps = {}) {
  const { clubs = [], teams = [] } = formProps;

  const clubById = new Map(clubs.map(c => [String(c.id), c]));
  const seen = new Set();
  const out = [];

  for (const p of teams) {
    const id = p?.clubId != null ? String(p.clubId) : '';
    if (!id || seen.has(id)) continue;
    const c = clubById.get(id);
    if (c) {
      out.push({ id: c.id, clubName: String(c.clubName || '') });
      seen.add(id);
    }
  }

  return out.sort((a, b) =>
    a.clubName.localeCompare(b.clubName, 'he', { numeric: true, sensitivity: 'base' })
  );
}

export function getGameClubOptions(formProps = {}) {
  const { clubs = [], games = [] } = formProps;

  const clubById = new Map(clubs.map(c => [String(c.id), c]));
  const seen = new Set();
  const out = [];

  for (const p of games) {
    const id = p?.clubId != null ? String(p.clubId) : '';
    if (!id || seen.has(id)) continue;
    const c = clubById.get(id);
    if (c) {
      out.push({ id: c.id, clubName: String(c.clubName || '') });
      seen.add(id);
    }
  }

  return out.sort((a, b) =>
    a.clubName.localeCompare(b.clubName, 'he', { numeric: true, sensitivity: 'base' })
  );
}

export function getGameTeamOptions(formProps = {}) {
  const { teams = [], games = [] } = formProps;

  const teamById = new Map(teams.map(t => [String(t.id), t]));
  const seen = new Set();
  const out = [];

  for (const p of games) {
    const id = p?.teamId != null ? String(p.teamId) : '';
    if (!id || seen.has(id)) continue;
    const t = teamById.get(id);
    if (t) {
      out.push({ id: t.id, teamName: String(t.teamName || ''), teamYear: t.teamYear });
      seen.add(id);
    }
  }

  return out.sort((a, b) => {
    const ay = a.teamYear ?? null;
    const by = b.teamYear ?? null;

    if (ay != null && by != null) {
      const diff = Number(ay) - Number(by); // עולה לפי שנתון
      if (diff !== 0) return diff;
    } else if (ay != null && by == null) {
      return -1; // עם שנתון לפני בלי שנתון
    } else if (ay == null && by != null) {
      return 1;
    }

  // שובר שוויון לפי שם קבוצה
  return a.teamName.localeCompare(b.teamName, 'he', { numeric: true, sensitivity: 'base' });
});
}

export const getFilterOptions = (formProps = {}, view) => {
  const playerTeamOptions = getPlayerTeamOptions(formProps);
  const playerClubOptions = getPlayerClubOptions(formProps);
  const teamClubOptions = getTeamClubOptions(formProps);
  const gameClubOptions = getGameClubOptions(formProps);
  const gameTeamOptions = getGameTeamOptions(formProps);

  const groupOptions = Array.from(
    new Set(
      (formProps.teams || [])
        .map(t => {
          const name = t?.teamName || '';
          if (isYouthOrSenior(name)) return name;
          // אחרת – נשתמש בשנתון אם קיים
          return t?.teamYear != null ? String(t.teamYear) : '';
        })
        .filter(Boolean)
    )
  ).sort((a, b) => {
    // מיין מספרים (שנים) תחילה בסדר עולה, ואז מחרוזות (שמות)
    const an = /^\d+$/.test(a);
    const bn = /^\d+$/.test(b);
    if (an && bn) return Number(a) - Number(b);
    if (an && !bn) return -1;
    if (!an && bn) return 1;
    return a.localeCompare(b, 'he', { numeric: true, sensitivity: 'base' });
  });

  const paymentForOptions = Array.from(
    new Set(formProps.payments?.map(p => p.paymentFor).filter(Boolean))
  ).sort();

  const meetingForOptions = Array.from(
    new Set(formProps.meetings?.map(p => p.meetingFor).filter(Boolean))
  ).sort();

  const tagOptions = Array.from(
    new Set(formProps.tags?.map(t => t.tagName).filter(Boolean))
  ).sort();

  return {
    teams: [
      ...teamClubOptions.map(club => ({
        id: 'clubName',
        value: String(club.id),
        labelH: club.clubName,
        idIcon: 'club',
        labelIdH: 'מועדון',
      })),
      { id: 'active', value: true, labelH: 'פעילה', idIcon: 'active', labelIdH: 'סוג קבוצה' },
      { id: 'active', value: false, labelH: 'לא פעילה', idIcon: 'notActive', labelIdH: 'קבוצה פעילה' },
      { id: 'project', value: true, labelH: 'פרוייקט', idIcon: 'project', labelIdH: 'קבוצת פרוייקט' },
      { id: 'project', value: false, labelH: 'כללית', idIcon: 'isNotProject', labelIdH: 'קבוצת פרוייקט' },
    ],

    players: [
      ...playerClubOptions.map(club => ({
        id: 'clubName',
        value: String(club.id),
        labelH: club.clubName,
        idIcon: 'club',
        labelIdH: 'מועדון',
      })),
      ...playerTeamOptions.map(team => ({
        id: 'teamName',
        value: String(team.id),
        labelH: `${team.teamName} - ${team.teamYear}`,
        idIcon: 'team',
        labelIdH: 'קבוצה',
      })),
      { id: 'type', value: 'project', labelH: 'פרויקט', idIcon: 'project', labelIdH: 'סוג שחקן' },
      { id: 'type', value: 'noneType', labelH: 'קבוצה', idIcon: 'isNotProject', labelIdH: 'סוג שחקן' },
      { id: 'projectStatus', value: true, labelH: 'סטטוס פרוייקט', idIcon: 'candidate', labelIdH: 'סטטוס פרוייקט' },
      { id: 'isOpenPayment', value: true, labelH: 'כן', idIcon: 'isNotPaid', labelIdH: 'סטטוס תשלום' },
      { id: 'isOpenPayment', value: false, labelH: 'לא', idIcon: 'isPaid', labelIdH: 'סטטוס תשלום' },
    ],

    payments: [
      { id: 'status', value: 'new', labelH: 'פתוח', idIcon: '', labelIdH: 'סטטוס תשלום' },
      { id: 'status', value: 'invoice', labelH: 'חשבונית', idIcon: '', labelIdH: 'סטטוס תשלום' },
      ...paymentForOptions.map(p => ({
        id: 'paymentFor',
        value: p,
        labelH: p,
        idIcon: '',
        labelIdH: 'תשלום עבור',
      })),
    ],

    meetings: [
      { id: 'status', value: 'new', labelH: 'נקבעו', idIcon: '', labelIdH: 'סטטוס פגישה' },
      { id: 'status', value: 'canceled', labelH: 'בוטלו', idIcon: '', labelIdH: 'סטטוס פגישה' },
      { id: 'status', value: 'done', labelH: 'התקיימו', idIcon: '', labelIdH: 'סטטוס פגישה' },
      { id: 'type', value: 'personal', labelH: 'אישית', idIcon: '', labelIdH: 'סוג פגישה' },
      { id: 'type', value: 'team', labelH: 'קבוצתית', idIcon: '', labelIdH: 'סוג פגישה' },
      { id: 'type', value: 'group', labelH: 'חלקית', idIcon: '', labelIdH: 'סוג פגישה' },
      ...meetingForOptions.map(p => ({
        id: 'meetingFor',
        value: p,
        labelH: p,
        idIcon: '',
        labelIdH: 'פגישה עבור',
      })),
    ],

    games: [
      ...gameClubOptions.map(club => ({
        id: 'clubName',
        value: String(club.id),
        labelH: club.clubName,
        idIcon: 'club',
        labelIdH: 'מועדון',
      })),
      ...gameTeamOptions.map(team => ({
        id: 'teamName',
        value: String(team.id),
        labelH: `${team.teamName} - ${team.teamYear}`,
        idIcon: 'team',
        labelIdH: 'קבוצה',
      })),
      { id: 'result', value: 'win', labelH: 'ניצחון', idIcon: 'win', labelIdH: 'תוצאה' },
      { id: 'result', value: 'draw', labelH: 'תיקו', idIcon: 'draw', labelIdH: 'תוצאה' },
      { id: 'result', value: 'loss', labelH: 'הפסד', idIcon: 'loss', labelIdH: 'תוצאה' },
      { id: 'type', value: 'league', labelH: 'משחק ליגה', idIcon: 'league', labelIdH: 'סוג משחק' },
      { id: 'type', value: 'cup', labelH: 'משחק גביע', idIcon: 'cup', labelIdH: 'סוג משחק' },
      { id: 'type', value: 'friendly', labelH: 'משחק ידידות', idIcon: 'friendly', labelIdH: 'סוג משחק' },
      { id: 'difficulty', value: 'easy', labelH: 'רמה קלה', idIcon: 'easy', labelIdH: 'רמת משחק' },
      { id: 'difficulty', value: 'equal', labelH: 'אותה רמה', idIcon: 'equal', labelIdH: 'רמת משחק' },
      { id: 'difficulty', value: 'hard', labelH: 'רמה קשה', idIcon: 'hard', labelIdH: 'רמת משחק' },
    ],

    videos: tagOptions.map(tag => ({
      id: 'tagName',
      value: tag,
      labelH: tag,
      idIcon: 'tag',
      labelIdH: 'תגית וידאו',
    }))
  };
};
