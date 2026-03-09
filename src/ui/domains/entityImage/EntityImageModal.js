// src/ui/entityImage/EntityImageModal.js
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Modal,
  ModalDialog,
  Typography,
  IconButton,
  Button,
  Avatar,
  Box,
  LinearProgress,
  CircularProgress,
} from '@mui/joy'
import CloseRounded from '@mui/icons-material/CloseRounded'
import PhotoCameraRounded from '@mui/icons-material/PhotoCameraRounded'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'

import EntityImageCrop from './EntityImageCrop.js'
import { sx } from './entityImage.sx.js'
import { DEFAULT_SNACK_ENTITY, buildDefaultUploader, makePreviewUrl, revokeUrl } from './entityImage.logic.js'
import { useUpdateAction } from '../entityActions/updateAction.js'
import { deleteImageByUrl } from '../../../services/firestore/storage/deleteImageByUrl.js'

export const ENTITY_LABEL = {
  players: 'עריכת תמונת שחקן',
  teams: 'עריכת תמונת קבוצה',
  clubs: 'עריכת תמונת מועדון',
  roles: 'עריכת תמונת איש צוות',
}

export default function EntityImageModal({
  open,
  onClose,

  entityType = 'players',
  id,
  entityName,
  currentPhotoUrl,

  routerEntityType,
  snackEntityType,

  uploadImageOnly,
  uploadFn,

  onAfterSave,
}) {
  const inputRef = useRef(null)

  const routerType = routerEntityType || entityType
  const snackType = snackEntityType || DEFAULT_SNACK_ENTITY[entityType] || 'entity'

  const { runUpdate, pending: pendingUpdate } = useUpdateAction({
    routerEntityType: routerType,
    snackEntityType: snackType,
    id,
    entityName: entityName || '',
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const uploader = useMemo(() => {
    if (typeof uploadFn === 'function') return uploadFn
    return buildDefaultUploader(uploadImageOnly)
  }, [uploadFn, uploadImageOnly])

  const [cropSrc, setCropSrc] = useState(null)
  const [cropOpen, setCropOpen] = useState(false)

  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  const [progress, setProgress] = useState(null)
  const [pendingUpload, setPendingUpload] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(false)

  const pendingAny = pendingUpdate || pendingUpload || pendingDelete

  useEffect(() => {
    return () => {
      revokeUrl(cropSrc)
      revokeUrl(previewUrl)
    }
  }, [])

  const effectivePreview = previewUrl || currentPhotoUrl || ''

  const resetLocal = useCallback(() => {
    setSelectedFile(null)
    setProgress(null)
    setPendingUpload(false)
    setPendingDelete(false)

    setCropOpen(false)

    revokeUrl(cropSrc)
    setCropSrc(null)

    revokeUrl(previewUrl)
    setPreviewUrl(null)
  }, [cropSrc, previewUrl])

  const handleClose = useCallback(() => {
    if (pendingAny) return
    resetLocal()
    onClose?.()
  }, [pendingAny, resetLocal, onClose])

  const handlePick = useCallback(() => {
    if (pendingAny) return
    inputRef.current?.click()
  }, [pendingAny])

  const onFileChange = useCallback(
    (e) => {
      const f = e.target.files?.[0]
      if (!f) return
      e.target.value = ''

      revokeUrl(cropSrc)
      const nextSrc = makePreviewUrl(f)
      setCropSrc(nextSrc)
      setCropOpen(true)
    },
    [cropSrc]
  )

  const onCropDone = useCallback(
    (f) => {
      setSelectedFile(f)

      revokeUrl(previewUrl)
      const nextPrev = makePreviewUrl(f)
      setPreviewUrl(nextPrev)

      setCropOpen(false)
    },
    [previewUrl]
  )

  const canSave = !!selectedFile && !!id && typeof uploader === 'function' && !pendingAny

  const canDelete = !!currentPhotoUrl && !!id && !pendingAny

  const handleSave = useCallback(async () => {
    if (!canSave) return

    setPendingUpload(true)
    setProgress(0)

    try {
      console.log('[EntityImageModal] SAVE:start', {
        entityType,
        id,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        hasCurrentPhoto: Boolean(currentPhotoUrl),
      })

      const downloadURL = await uploader({
        entityType,
        id,
        file: selectedFile,
        oldUrl: currentPhotoUrl || '',
        onProgress: (p) => setProgress(p),
      })

      if (!downloadURL) throw new Error('Upload finished without downloadURL')

      console.log('[EntityImageModal] SAVE:uploadDone', { downloadURL })

      await runUpdate(
        { photo: downloadURL },
        { success: 'תמונה עודכנה', fail: 'שגיאה בעדכון תמונה' }
      )

      const busted = `${downloadURL}${downloadURL.includes('?') ? '&' : '?'}v=${Date.now()}`
      onAfterSave?.(busted)

      resetLocal()
      onClose?.()
    } catch (e) {
      console.error('[EntityImageModal] SAVE:failed', e)
      setProgress(null)
    } finally {
      setPendingUpload(false)
    }
  }, [canSave, uploader, entityType, id, selectedFile, currentPhotoUrl, runUpdate, onAfterSave, resetLocal, onClose])

  const handleDelete = useCallback(async () => {
    if (!canDelete) return
    if (pendingDelete) return

    setPendingDelete(true)
    setProgress(null)

    try {
      await deleteImageByUrl(currentPhotoUrl)

      await runUpdate({ photo: '' }, { section: 'entityImage', entityType, op: 'deletePhoto' })

      resetLocal()
      onClose?.()
    } catch (e) {
      console.error('[EntityImageModal] DELETE:failed', e)
    } finally {
      setPendingDelete(false)
    }
  }, [canDelete, pendingDelete, currentPhotoUrl, runUpdate, entityType, resetLocal, onClose])

  return (
    <>
      <Modal open={!!open} onClose={handleClose}>
        <ModalDialog sx={sx.dialog}>
          <Box style={sx.headerTop}>
            <Box style={{ width: 40 }} />
            <Box style={sx.headerCenter}>
              <Typography level="title-md" sx={sx.headerTitle}>
                {entityName || 'תמונה'}
              </Typography>
              <Typography level="body-xs" sx={sx.headerSub}>
                {ENTITY_LABEL[entityType] || ''}
              </Typography>
            </Box>

            <IconButton
              sx={sx.closeBtn}
              variant="plain"
              color="neutral"
              onClick={handleClose}
              disabled={pendingAny}
            >
              <CloseRounded />
            </IconButton>
          </Box>

          <Box style={sx.body}>
            <Box style={sx.imageCenterWrap}>
              <Avatar src={effectivePreview} sx={sx.heroAvatar} />
            </Box>

            <Box sx={sx.pickWrap}>
              <Button
                sx={sx.pickBtn}
                variant="solid"
                startDecorator={pendingAny ? <CircularProgress size="sm" /> : <PhotoCameraRounded />}
                onClick={handlePick}
                disabled={pendingAny}
              >
                בחירת תמונה
              </Button>
            </Box>

            {pendingUpload && typeof progress === 'number' ? (
              <Box style={sx.progressWrap}>
                <LinearProgress determinate value={Math.max(0, Math.min(100, progress))} />
                <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.8, textAlign: 'center' }}>
                  {`העלאה: ${progress}%`}
                </Typography>
              </Box>
            ) : null}

            <Box sx={sx.footerActions}>
              <Button
                variant="soft"
                color="danger"
                startDecorator={pendingDelete ? <CircularProgress size="sm" /> : <DeleteOutlineRounded />}
                onClick={handleDelete}
                disabled={!canDelete}
                loading={pendingDelete}
              >
                מחיקה
              </Button>

              <Button variant="outlined" color="neutral" onClick={resetLocal} disabled={pendingAny}>
                איפוס
              </Button>

              <Button
                variant="soft"
                onClick={handleSave}
                disabled={!canSave}
                loading={pendingUpload || pendingUpdate}
                startDecorator={pendingUpload || pendingUpdate ? <CircularProgress size="sm" /> : undefined}
              >
                שמירה
              </Button>
            </Box>

            <input ref={inputRef} type="file" accept="image/*" hidden onChange={onFileChange} />
          </Box>
        </ModalDialog>
      </Modal>

      <EntityImageCrop
        open={cropOpen}
        imageSrc={cropSrc}
        aspect={1}
        onCancel={() => {
          if (pendingAny) return
          setCropOpen(false)
          revokeUrl(cropSrc)
          setCropSrc(null)
        }}
        onDone={onCropDone}
      />
    </>
  )
}
