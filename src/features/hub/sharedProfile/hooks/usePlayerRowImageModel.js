// src/features/hub/sharedProfile/hooks/usePlayerRowImageModel.js

import { useCallback, useState } from 'react'

import { uploadEntityImageUrl } from '../../application/index.js'

function appendCacheVersion(url = '') {
  if (!url) return ''
  return `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
}

export default function usePlayerRowImageModel() {
  const [imgRow, setImgRow] = useState(null)
  const [openImg, setOpenImg] = useState(false)
  const [rowPhoto, setRowPhoto] = useState('')

  const handleAvatarClick = useCallback(row => {
    setImgRow(row || null)
    setRowPhoto(row?.photo || row?.imageUrl || '')
    setOpenImg(true)
  }, [])

  const handleAfterImageSave = useCallback(url => {
    setRowPhoto(appendCacheVersion(url))
  }, [])

  return {
    imgRow,
    openImg,
    rowPhoto,
    uploadImageOnly: uploadEntityImageUrl,
    setOpenImg,
    handleAvatarClick,
    handleAfterImageSave,
  }
}
