export function getTeamColor(teamId, formProps) {
  const teams = formProps?.teams || [];
  const clubs = formProps?.clubs || [];

  const team = teams.find(t => t.id === teamId) || null;
  const club = team ? (clubs.find(c => c.id === team.clubId) || null) : null;

  const bg = team?.color?.bg?.trim()
    ? team.color.bg
    : (club?.color?.bg?.trim() || 'white');

  const tex = team?.color?.tex?.trim()
    ? team.color.tex
    : (club?.color?.tex?.trim() || 'black');

  return { bg, tex };
}
