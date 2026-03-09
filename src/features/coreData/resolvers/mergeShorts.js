// src/features/coreData/resolvers/mergeShorts.js
export function mergeShorts(shorts, mainDoc, mergeDocs, idField, extra = () => ({})) {
  if (!Array.isArray(shorts) || shorts.length === 0) return []

  const docMap = Object.fromEntries(shorts.map((doc) => [doc.docName, doc.list || []]))
  const mainList = docMap[mainDoc] || []
  if (!Array.isArray(mainList) || mainList.length === 0) return []

  const merged = mainList.map((item) => {
    const base = Array.isArray(mergeDocs)
      ? mergeDocs.reduce((acc, docName) => {
          const list = docMap[docName] || []
          const found = list.find((i) => i?.[idField] === item?.[idField])
          return { ...acc, ...(found || {}) }
        }, {})
      : {}

    const core = { ...item, ...base }
    return { ...core, ...(extra(core, { docMap }) || {}) }
  })

  return merged
}
