// ui/actions/buildTaskFabContext.js

function resolveWorkspaceByArea(area = '') {
  if (area === 'home') return 'app'
  if (area === 'video') return 'analyst'
  if (area === 'calendar') return 'analyst'
  if (area === 'tags') return 'app'
  return 'analyst'
}

export function buildTaskFabContext({
  location = null,
  area = '',
  mode = '',
  extra = {},
} = {}) {
  const pathname = location?.pathname || ''
  const search = location?.search || ''

  return {
    workspace: resolveWorkspaceByArea(area),
    url: `${pathname}${search}`,
    contextArea: area || '',
    contextMode: mode || '',
    ...extra,
  }
}
