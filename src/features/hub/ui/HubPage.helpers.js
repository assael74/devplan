// src/features/hub/ui/HubPage.helpers.js
import { iconUi } from '../../../ui/core/icons/iconUi.js'

export const buildTabsMeta = (MODE) => [
  { value: MODE.CLUBS, label: 'מועדונים', icon: iconUi({ id: 'clubs' }) },
  { value: MODE.TEAMS, label: 'קבוצות', icon: iconUi({ id: 'teams' }) },
  { value: MODE.PLAYERS, label: 'שחקנים', icon: iconUi({ id: 'players' }) },
  { value: MODE.STAFF, label: 'צוות מקצועי', icon: iconUi({ id: 'roles' }) },
  { value: MODE.SCOUTING, label: 'שחקנים במעקב', icon: iconUi({ id: 'scouting' }) },
]

export const buildContextFromSelection = (selection) => {
  const t = selection?.type
  const d = selection?.data || {}
  const clubKey = d?.clubsId ?? d?.clubId ?? null
  const teamKey = d?.teamId ?? null

  return {
    clubId: t === 'club' ? (d?.id ?? clubKey) : clubKey,
    teamId: t === 'team' ? (d?.id ?? teamKey) : teamKey,
  }
}

export const buildCreateHandlers = ({ openCreate, context, s }) => ({
  onCreateClub: () =>
    openCreate('club', {}, { ...context, onDone: (res) => s.selectClubById(res?.id || res?.clubId || null) }),
  onCreateTeam: () =>
    openCreate('team', {}, { ...context, onDone: (res) => s.selectTeamById(res?.id || res?.teamId || null) }),
  onCreatePlayer: () =>
    openCreate('player', {}, { ...context, onDone: (res) => s.selectPlayerById(res?.id || res?.playerId || null) }),
  onCreateStaff: () =>
    openCreate('role', {}, { ...context, onDone: (res) => s.selectStaffById(res?.id || res?.roleId || null) }),
})
