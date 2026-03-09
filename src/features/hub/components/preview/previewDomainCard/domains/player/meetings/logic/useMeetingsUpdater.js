// useMeetingsUpdater.js (only the changes you need)
import { useCallback, useMemo } from 'react'
import { useUpdateAction } from '../../../../../../../../../ui/domains/entityActions/updateAction.js'
import { clean } from '../../../../../../../../../shared/format/string.js'
import { getFullDateIl } from '../../../../../../../../../shared/format/dateUtiles.js'
import { buildSavePayload } from './meetings.modal.logic.js'
import { useCoreData } from '../../../../../../../../coreData/CoreDataProvider.js' // adjust relative path if needed

export function useMeetingsUpdater({ draft, editOriginal, entity }) {
  const { patchEntity } = useCoreData()

  const entityName = useMemo(() => {
    const playerName = [entity?.playerFirstName, entity?.playerLastName].filter(Boolean).join(' ').trim()
    const date = draft?.meetingDate ? getFullDateIl(draft.meetingDate, false) : ''
    return ['פגישה', date, playerName].filter(Boolean).join(' • ') || 'פגישה'
  }, [draft, entity])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'meetings',
    snackEntityType: 'meeting',
    id: draft?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const save = useCallback(async (patch, section) => {
    const id = draft?.id
    if (!id) return

    const cleanPatch = patch && typeof patch === 'object' ? patch : {}
    if (Object.keys(cleanPatch).length === 0) return

    await runUpdate(cleanPatch, { section })
    patchEntity('meetings', id, cleanPatch)
  }, [draft?.id, runUpdate, patchEntity])

  const saveBasic = async () => {
    if (!editOriginal) return

    const full = buildSavePayload({ draft, editOriginal })
    const patch = {
      ...(full?.patchDate || {}),
      ...(full?.patchPlayer || {}),
    }

    Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])
    return save(patch, 'meetings.basic')
  }

  const saveNotes = () => save({ notes: clean(draft?.notes) }, 'meetings.notes')

  const saveVideo = () =>
    save({ videoId: clean(draft?.videoId) }, 'meetings.video')

  return { saveBasic, saveNotes, saveVideo, pending }
}
