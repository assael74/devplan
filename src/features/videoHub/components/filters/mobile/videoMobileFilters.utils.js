// videoHub/components/filters/mobile/videoMobileFilters.utils.js

const toStr = (v) => (v == null ? '' : String(v).trim())

const normalizeArr = (v) => {
  if (Array.isArray(v)) return v
  if (v == null || v === '') return []
  return [v]
}

const safeId = (v) => toStr(v)

const getTagLabel = (tag) =>
  toStr(tag?.tagName || tag?.name || tag?.label || tag?.slug || tag?.id)

const getTagParentId = (tag) =>
  toStr(tag?.parentTagId || tag?.parentId || tag?.parent?.id || tag?.parentTag?.id)

const getTagType = (tag) => toStr(tag?.tagType || tag?.type)

export function buildVideoMobileTagOptions(context = {}) {
  const tagsAll = Array.isArray(context?.tags)
    ? context.tags
    : Array.isArray(context?.analysisTags)
    ? context.analysisTags
    : Array.isArray(context?.videoTags)
    ? context.videoTags
    : []

  const all = tagsAll.filter(Boolean)

  const parents = all
    .filter((tag) => {
      const type = getTagType(tag)
      const parentId = getTagParentId(tag)

      if (type === 'parent') return true
      if (!parentId && type !== 'child') return true
      return false
    })
    .map((tag) => ({
      value: safeId(tag?.id),
      label: getTagLabel(tag),
      raw: tag,
    }))
    .filter((tag) => tag.value && tag.label)

  const children = all
    .filter((tag) => {
      const type = getTagType(tag)
      const parentId = getTagParentId(tag)
      return Boolean(parentId) || type === 'child'
    })
    .map((tag) => ({
      value: safeId(tag?.id),
      label: getTagLabel(tag),
      parentTagId: getTagParentId(tag),
      raw: tag,
    }))
    .filter((tag) => tag.value && tag.label)

  parents.sort((a, b) => a.label.localeCompare(b.label, 'he'))
  children.sort((a, b) => a.label.localeCompare(b.label, 'he'))

  return { parents, children }
}

function extractItemTagIds(item) {
  const direct = normalizeArr(item?.tagIds).map(safeId).filter(Boolean)
  if (direct.length) return direct

  return normalizeArr(item?.tagsFull)
    .map((tag) => safeId(tag?.id || tag?.tagId))
    .filter(Boolean)
}

export function filterItemsByMobileVideoFilters(items = [], filters = {}, context = {}) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return []

  const q = toStr(filters?.q).toLowerCase()
  const parentTagId = safeId(filters?.parentTagId)
  const childTagId = safeId(filters?.childTagId)

  if (!q && !parentTagId && !childTagId) return list

  const { children } = buildVideoMobileTagOptions(context)
  const childToParentMap = new Map(
    children.map((tag) => [safeId(tag.value), safeId(tag.parentTagId)])
  )

  return list.filter((item) => {
    const tagIds = extractItemTagIds(item)

    if (q) {
      const searchBlob = [
        item?.title,
        item?.name,
        item?.notes,
        item?.description,
        item?.link,
        item?.videoLink,
        item?.playerName,
        item?.teamName,
        item?.clubName,
      ]
        .map(toStr)
        .join(' ')
        .toLowerCase()

      if (!searchBlob.includes(q)) return false
    }

    if (parentTagId) {
      const hasParentMatch = tagIds.some((tagId) => childToParentMap.get(tagId) === parentTagId)
      if (!hasParentMatch) return false
    }

    if (childTagId) {
      const hasChildMatch = tagIds.includes(childTagId)
      if (!hasChildMatch) return false
    }

    return true
  })
}

export function buildVideoMobileDrawerConfig({ filters = {}, context = {} }) {
  const { parents, children } = buildVideoMobileTagOptions(context)

  const selectedParentId = safeId(filters?.parentTagId)

  const childOptions = selectedParentId
    ? children.filter((tag) => safeId(tag.parentTagId) === selectedParentId)
    : []

  return {
    fields: [
      {
        key: 'q',
        placeholder: 'חיפוש חופשי',
      },
    ],
    groups: [
      {
        key: 'parentTagId',
        title: 'תג אב',
        options: parents.map((tag) => ({
          value: tag.value,
          label: tag.label,
        })),
      },
      {
        key: 'childTagId',
        title: 'תג ילד',
        options: childOptions.map((tag) => ({
          value: tag.value,
          label: tag.label,
        })),
      },
    ],
  }
}
