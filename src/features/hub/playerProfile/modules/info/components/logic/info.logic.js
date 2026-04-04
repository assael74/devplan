//   features/hub/playerProfile/modules/info/components/logic/info.logic.js

const toStr = (v) => (v == null ? '' : String(v))

const toNum = (v) => {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function buildAffiliationInitial(player) {
  return {
    clubId: toStr(player?.clubId),
    teamId: toStr(player?.teamId),
  }
}

export function isAffiliationDirty(draft, initial) {
  return (
    draft.clubId !== initial.clubId ||
    draft.teamId !== initial.teamId
  )
}

export function buildPlayerBirthInitial(player) {
  return {
    birth: toStr(player?.birth),
    birthDay: toStr(player?.birthDay),
  }
}

export function isPlayerBirthDirty(draft, initial) {
  return (
    draft.birth !== initial.birth ||
    draft.birthDay !== initial.birthDay
  )
}

export function buildPlayerNamesInitial(player) {
  return {
    playerFirstName: toStr(player?.playerFirstName),
    playerLastName: toStr(player?.playerLastName),
    playerShortName: toStr(player?.playerShortName),
  }
}

export function isPlayerNamesDirty(draft, initial) {
  return (
    draft.playerFirstName !== initial.playerFirstName ||
    draft.playerLastName !== initial.playerLastName ||
    draft.playerShortName !== initial.playerShortName
  )
}

export function getPlayerFullName(draft = {}) {
  return [draft.playerFirstName, draft.playerLastName]
    .filter(Boolean)
    .join(' ')
    .trim()
}

export function getPlayerNamesChipText(draft = {}) {
  const fullName = getPlayerFullName(draft)
  return fullName || draft.playerShortName || 'ללא שם'
}

export function buildPlayerPhysicalInitial(player) {
  const heightCm = toNum(
    player?.heightCm ?? player?.height ?? player?.physical?.heightCm ?? null
  )
  const weightKg = toNum(
    player?.weightKg ?? player?.weight ?? player?.physical?.weightKg ?? null
  )

  return {
    heightCm: heightCm == null ? '' : String(heightCm),
    weightKg: weightKg == null ? '' : String(weightKg),
  }
}

export function isPlayerPhysicalDirty(draft, initial) {
  return (
    draft.heightCm !== initial.heightCm ||
    draft.weightKg !== initial.weightKg
  )
}

export function calcPlayerBmi(heightCm, weightKg) {
  const h = toNum(heightCm)
  const w = toNum(weightKg)
  if (!h || !w) return null

  const hm = h / 100
  if (!hm) return null

  const bmi = w / (hm * hm)
  return Number.isFinite(bmi) ? bmi : null
}

export function getPlayerBmiText(heightCm, weightKg) {
  const bmi = calcPlayerBmi(heightCm, weightKg)
  return bmi == null ? 'BMI —' : `BMI ${bmi.toFixed(1)}`
}

export function buildPlayerPhysicalPatch(draft = {}) {
  return {
    heightCm: toNum(draft.heightCm),
    weightKg: toNum(draft.weightKg),
  }
}

export function buildPlayerStatusInitial(player) {
  return {
    active: Boolean(player?.active),
    phone: toStr(player?.phone),
    squadRole: toStr(player?.squadRole || ''),
    ifaLink: toStr(player?.ifaLink),
  }
}

export function isPlayerStatusDirty(draft, initial) {
  return (
    draft.active !== initial.active ||
    draft.phone !== initial.phone ||
    draft.ifaLink !== initial.ifaLink ||
    draft.squadRole !== initial.squadRole
  )
}

export function buildPlayerStatusPatch(draft = {}) {
  return {
    active: Boolean(draft.active),
    phone: draft.phone || null,
    squadRole: draft.squadRole || '',
    ifaLink: draft.ifaLink || '',
  }
}

export function getPlayerActiveChipMeta(active) {
  return active
    ? {
        color: 'success',
        iconId: 'active',
        label: 'פעיל',
      }
    : {
        color: 'danger',
        iconId: 'notActive',
        label: 'לא פעיל',
      }
}

export function buildProjectStatusInitial(player) {
  return {
    projectStatus: toStr(player?.projectStatus || ''),
    type: toStr(player?.type || 'noneType'),
  }
}

export function isProjectStatusDirty(draft, initial) {
  return (
    draft.projectStatus !== initial.projectStatus ||
    draft.type !== initial.type
  )
}

export function buildProjectStatusPatch(draft = {}) {
  return {
    projectStatus: draft.projectStatus || '',
    type: draft.type || 'noneType',
  }
}

export function isProjectPlayer(type) {
  return toStr(type) === 'project'
}

export { toStr, toNum }
