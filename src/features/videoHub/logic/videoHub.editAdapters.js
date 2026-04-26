// src/features/videoHub/logic/videoHub.editAdapters.js

export const VIDEO_ANALYSIS_EDIT_ADAPTER = {
  buildOriginal: (video) => ({
    id: video?.id || '',
    name: video?.name || video?.title || '',
    notes: video?.notes || '',
    tagIds: Array.isArray(video?.tagIds)
      ? video.tagIds
      : Array.isArray(video?.tags)
        ? video.tags
        : [],
  }),

  isDirty: (draft, original) => {
    if (!draft || !original) return false

    const draftTags = Array.isArray(draft.tagIds) ? draft.tagIds : []
    const originalTags = Array.isArray(original.tagIds) ? original.tagIds : []

    const a = draftTags.slice().sort().join('|')
    const b = originalTags.slice().sort().join('|')

    return (
      (draft.name || '') !== (original.name || '') ||
      (draft.notes || '') !== (original.notes || '') ||
      a !== b
    )
  },

  buildPatch: (draft, original) => {
    const patch = {}

    if ((draft?.name || '') !== (original?.name || '')) {
      patch.name = draft?.name || ''
    }

    if ((draft?.notes || '') !== (original?.notes || '')) {
      patch.notes = draft?.notes || ''
    }

    const draftTags = Array.isArray(draft?.tagIds) ? draft.tagIds : []
    const originalTags = Array.isArray(original?.tagIds) ? original.tagIds : []

    const a = draftTags.slice().sort().join('|')
    const b = originalTags.slice().sort().join('|')

    if (a !== b) {
      patch.tagIds = draftTags
    }

    return patch
  },
}
