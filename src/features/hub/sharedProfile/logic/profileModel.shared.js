// src/features/hub/sharedProfile/logic/profileModel.shared.js

export const findProfileEntityById = ({ rows, id }) => {
  if (!Array.isArray(rows) || id === undefined || id === null) {
    return null
  }

  return rows.find(item => {
    return String(item?.id) === String(id)
  }) || null
}

export const buildProfileTagsById = tags => {
  if (!Array.isArray(tags)) return null

  return Object.fromEntries(
    tags.map(item => [String(item.id), item])
  )
}

export const resolveProfileRawTab = ({ tabKey, searchParams }) => {
  const fromParam = String(tabKey || '').trim()
  if (fromParam) return fromParam

  return String(searchParams?.get('tab') || '').trim()
}

export const resolveProfileSelectedTab = ({ rawTab, tab }) => {
  return rawTab ? tab : ''
}

export const resolveProfilePageState = ({ loading, error, entity }) => {
  if (loading) return 'loading'
  if (error) return 'error'
  if (!entity) return 'missing'
  return 'ready'
}
