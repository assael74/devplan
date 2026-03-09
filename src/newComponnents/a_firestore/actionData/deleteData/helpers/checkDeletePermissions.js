// 📁 actionData/deleteData/helpers/checkDeletePermissions.js

export function canDeletePlayer(player, payments = [], meetings = []) {
  const hasPaid =
    payments.length === 0 ||
    payments.some(p => ['done', 'invoice'].includes(p.status?.id?.trim().toLowerCase()) );

  // רק תשלום
  if (!hasPaid) {
    return {
      allowed: false,
      reason: 'קיים לפחות תשלום אחד שלא שולם',
      tip: '',
    };
  }

  return { allowed: true };
}

export function canDeletePayment(payment) {
  if (payment.status.id !== 'new') {
    return {
      allowed: false,
      reason: 'תשלום זה כבר שולם',
    };
  }
  return { allowed: true };
}

export function canDeleteMeeting(meeting, isPlayerBeingDeleted = false) {
  if (meeting.status.id === 'done' && !isPlayerBeingDeleted) {
    return {
      allowed: false,
      reason: 'הפגישה כבר התקיימה',
    };
  }
  return { allowed: true };
}

export function canDeleteTeam(team, teamPlayerPayments = [], games = []) {
  if (teamPlayerPayments.length > 0) {
    const summary = teamPlayerPayments
      .map(p => `${p.playerFullName} (${p.openPaymentsCount})`)
      .join(', ');

    return {
      allowed: false,
      reason: 'יש שחקנים עם תשלומים פתוחים',
      tip: `שחקנים: ${summary}`,
    };
  }

  const teamGames = games.filter(game => game.teamId === team.id);
  if (teamGames.length > 0) {
    const opponents = teamGames
      .map(g => g.rivel || 'יריב לא ידוע')
      .slice(0, 5) // הצגה חלקית
      .join(', ');

    return {
      allowed: false,
      reason: 'לקבוצה יש משחקים רשומים',
      tip: `נגד: ${opponents}${teamGames.length > 5 ? ' ועוד...' : ''}`,
    };
  }

  return { allowed: true };
}

export function canDeleteClub(club, clubPlayerPayments = [], games = []) {
  if (clubPlayerPayments.length > 0) {
    const summary = clubPlayerPayments
      .map(p => `${p.playerFullName} (${p.openPaymentsCount})`)
      .join(', ');

    return {
      allowed: false,
      reason: 'יש שחקנים עם תשלומים פתוחים',
      tip: `שחקנים: ${summary}`,
    };
  }

  const clubGames = games.filter(game => game.clubId === club.id);
  if (clubGames.length > 0) {
    const opponents = clubGames
      .map(g => g.rivel || 'יריב לא ידוע')
      .slice(0, 5)
      .join(', ');

    return {
      allowed: false,
      reason: 'למועדון יש משחקים רשומים',
      tip: `נגד: ${opponents}${clubGames.length > 5 ? ' ועוד...' : ''}`,
    };
  }

  return { allowed: true };
}
