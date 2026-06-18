export const PLAYERS_DATABASE_TEAM_SLOT_TEMPLATE = [
  { ageGroupId: 'u19', ageGroupLabel: 'נוער', maxSlots: 3 },
  { ageGroupId: 'u17', ageGroupLabel: 'נערים א', maxSlots: 3 },
  { ageGroupId: 'u16', ageGroupLabel: 'נערים ב', maxSlots: 3 },
  { ageGroupId: 'u15', ageGroupLabel: 'נערים ג', maxSlots: 3 },
  { ageGroupId: 'u14', ageGroupLabel: 'ילדים א', maxSlots: 3 },
  { ageGroupId: 'u13', ageGroupLabel: 'ילדים ב', maxSlots: 3 },
]

const toPositiveInt = (value, fallback) => {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : fallback
}

export function buildClubTeamSlots(club = {}) {
  const overrides = club.teamSlotOverrides || {}

  return PLAYERS_DATABASE_TEAM_SLOT_TEMPLATE.flatMap((template) => {
    const maxSlots = toPositiveInt(overrides[template.ageGroupId], template.maxSlots)

    return Array.from({ length: maxSlots }, (_, index) => {
      const slot = index + 1

      return {
        id: `${club.id || 'club'}_${template.ageGroupId}_${slot}`,
        clubId: club.id || '',
        clubName: club.name || '',
        ageGroupId: template.ageGroupId,
        ageGroupLabel: template.ageGroupLabel,
        slot,
        teamName: `${template.ageGroupLabel} ${slot}`,
        displayName: `${club.name || ''} ${template.ageGroupLabel} ${slot}`.trim(),
      }
    })
  })
}
