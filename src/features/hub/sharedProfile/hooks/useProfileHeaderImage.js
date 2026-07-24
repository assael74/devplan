// src/features/hub/sharedProfile/hooks/useProfileHeaderImage.js

import { useCallback, useEffect, useState } from 'react'

import { appendImageCacheVersion } from '../logic/headerModel.shared.js'

export default function useProfileHeaderImage({
  entityId,
  source,
}) {
  const [open, setOpen] = useState(false)
  const [photo, setPhoto] = useState(source)

  useEffect(() => {
    setPhoto(source)
  }, [entityId, source])

  const openModal = useCallback(() => {
    setOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
  }, [])

  const handleSave = useCallback(url => {
    if (!url) return

    setPhoto(appendImageCacheVersion(url))
  }, [])

  return {
    open,
    photo,
    openModal,
    closeModal,
    handleSave,
  }
}
