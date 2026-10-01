// src/features/playersDatabase/ui/hooks/saveEditor.js

import { SNACK_STATUS } from '../../../../ui/core/feedback/snackbar/snackbar.model.js'

export async function saveEditor({
  write,
  reload,
  reloadAfterSuccess = true,
  notify,
  close,
  setSaving,
  title,
}) {
  setSaving(true)
  let saved = false
  try {
    await write()
    saved = true
    notify({ status: SNACK_STATUS.SUCCESS, title })
  } catch (error) {
    notify({
      status: SNACK_STATUS.ERROR,
      title: 'לא התקבל אישור לשמירה',
      message: error.message,
    })
  }
  try {
    if (!saved || reloadAfterSuccess) {
      await reload()
    }
  } catch (error) {
    notify({
      status: SNACK_STATUS.ERROR,
      title: saved ? 'השמירה הצליחה; רענון התצוגה נכשל' : 'רענון התצוגה נכשל',
      message: error.message,
    })
  } finally {
    if (saved) close()
    setSaving(false)
  }
}
