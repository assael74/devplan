//  src/features/bulkActions/videos/import/logic/buildVideosImportDraft.js

const clean = value => String(value ?? '').trim()

export function buildVideosImportDraft({
  rows = [],
} = {}) {
  return {
    videos: rows
      .filter(row => row?.isValid)
      .map(row => ({
        name: clean(row.name),
        link: clean(row.link),
        primaryCategory: clean(row.primaryCategory) || null,
      })),
  }
}
