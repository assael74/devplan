// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/ui/outcomeBlock.ui.js

const emptyArray = []

export const getOutcomeGroups = model => {
  return Array.isArray(model?.groups) ? model.groups : emptyArray
}

export const getFirstGroupId = groups => {
  return groups[0]?.id || null
}

export const getSelectedGroup = ({ groups, selectedId, }) => {
  return groups.find(group => group.id === selectedId) || groups[0] || null
}

export const byGroupIds = ids => group => {
  return ids.includes(group.id)
}

export const getVisibleGroups = ({ groups, hideGroupIds = emptyArray, }) => {
  return groups.filter(group => !hideGroupIds.includes(group.id))
}

export const getInfoGroups = ({ groups, infoGroupIds = emptyArray, }) => {
  return groups.filter(byGroupIds(infoGroupIds))
}
