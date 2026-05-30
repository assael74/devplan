// playerProfile/sharedModules/videos/playerVideosModule.helpers.js

export const asArr = value => {
  return Array.isArray(value) ? value : []
}

export const resolveContextTags = context => {
  const tags = asArr(context?.tags)
  if (tags.length) return tags

  const tagsArr = asArr(context?.tagsArr)
  if (tagsArr.length) return tagsArr

  return []
}
