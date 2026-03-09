export function previewClubDeletion(club, allShorts, formProps) {
  const clubTeams = (formProps?.teams || []).filter(t => t.clubId === club.id);
  const clubPlayers = (formProps?.players || []).filter(p => p.clubId === club.id);

  console.group(`📦 תצוגה מקדימה למחיקת מועדון: ${club.clubName || club.id}`);
  console.log("🏢 קבוצות שיימחקו:", clubTeams.map(t => t.teamName || t.id));
  console.log("👥 שחקנים שיימחקו:", clubPlayers.map(p => p.playerFullName || p.id));

  for (const player of clubPlayers) {
    const payments = (formProps?.payments || []).filter(pay => pay.playerId === player.id);
    const meetings = (formProps?.meetings || []).filter(m => m.playerId === player.id);

    console.group(`🔎 שחקן: ${player.playerFullName || player.id}`);
    console.log("💰 תשלומים שיימחקו:", payments.map(p => p.paymentFor));
    console.log("📅 פגישות שיימחקו:", meetings.map(m => m.meetingDate));
    console.groupEnd();
  }

  console.groupEnd();
}
