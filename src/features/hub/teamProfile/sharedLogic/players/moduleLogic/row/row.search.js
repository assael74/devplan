// teamProfile/sharedLogic/players/moduleLogic/row/row.search.js

export const buildSearchText = ({
  playerFullName,
  birthLabel,
  age,
  positions,
  primaryPosition,
  generalPositionLabel,
  generalPositionKey,
  typeLabel,
  activeLabel,
  projectStatusLabel,
  projectChipLabel,
  squadRoleLabel,
}) => {
  return [
    playerFullName,
    birthLabel,
    Number.isFinite(age) ? `גיל ${age}` : '',
    Array.isArray(positions) ? positions.join(' ') : '',
    primaryPosition ? `עמדה ראשית ${primaryPosition}` : '',
    generalPositionLabel,
    generalPositionKey,
    typeLabel,
    activeLabel,
    projectStatusLabel,
    projectChipLabel,
    squadRoleLabel,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}
