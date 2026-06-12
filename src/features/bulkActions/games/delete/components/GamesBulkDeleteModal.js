// src/features/bulkActions/games/delete/components/GamesBulkDeleteModal.js

import React from 'react'
import {
  Alert,
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy'
import { AnimatePresence, motion } from 'framer-motion'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { GAMES_DELETE_SCOPE } from '../configs/gamesDelete.config.js'
import { buildGamesDeletePlan } from '../logic/buildGamesDeletePlan.js'
import GamesBulkDeleteSummary from './GamesBulkDeleteSummary.js'
import GamesBulkDeletePreview from './GamesBulkDeletePreview.js'
import GamesBulkDeleteConfirmBox, {
  isGamesDeleteConfirmed,
} from './GamesBulkDeleteConfirmBox.js'
import { gamesDeleteModalSx as sx } from '../sx/gamesDeleteModal.sx.js'

const motionProps = {
  initial: {
    opacity: 0,
    y: 18,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  transition: {
    duration: 0.2,
    ease: [0.22, 1, 0.36, 1],
  },
}

export default function GamesBulkDeleteModal({
  open,
  onClose,
  team,
  games = [],
  selectedGameIds = [],
  initialScope = GAMES_DELETE_SCOPE.SELECTED,
  loading = false,
  error = '',
  onConfirmDelete,
}) {
  const [renderOpen, setRenderOpen] = React.useState(open)
  const [confirmValue, setConfirmValue] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setRenderOpen(true)
      setConfirmValue('')
    }
  }, [open, initialScope, selectedGameIds])

  const plan = React.useMemo(() => {
    return buildGamesDeletePlan({
      team,
      games,
      selectedGameIds,
      scope: initialScope || GAMES_DELETE_SCOPE.SELECTED,
    })
  }, [team, games, selectedGameIds, initialScope])
  
  const confirmed = isGamesDeleteConfirmed(plan, confirmValue)

  const canDelete = Boolean(
    plan?.isValid &&
      confirmed &&
      !loading
  )

  const handleClose = React.useCallback(() => {
    if (loading) return
    onClose()
  }, [loading, onClose])

  const handleConfirmDelete = React.useCallback(async () => {
    if (!canDelete) return
    await onConfirmDelete(plan)
  }, [canDelete, onConfirmDelete, plan])

  const handleExitComplete = React.useCallback(() => {
    if (!open) {
      setRenderOpen(false)
    }
  }, [open])

  if (!renderOpen) return null

  return (
    <Modal
      open={renderOpen}
      onClose={handleClose}
      sx={sx.root}
    >
      <AnimatePresence
        mode="wait"
        onExitComplete={handleExitComplete}
      >
        {open ? (
          <Box
            key="games-bulk-delete-motion"
            component={motion.div}
            {...motionProps}
            sx={sx.motionWrap}
          >
            <ModalDialog
              variant="outlined"
              sx={sx.dialog}
            >
              <DialogTitle sx={sx.header}>
                <Box sx={sx.headerLeft}>
                  <Box sx={sx.headerIcon}>
                    {iconUi({ id: 'delete' })}
                  </Box>

                  <Box sx={sx.titleWrap}>
                    <Typography level="body-xs" sx={sx.kicker}>
                      פעולה מסוכנת
                    </Typography>

                    <Typography level="title-md" sx={sx.title}>
                      מחיקת משחקים
                    </Typography>
                  </Box>
                </Box>

                <ModalClose
                  onClick={handleClose}
                  disabled={loading}
                />
              </DialogTitle>

              <DialogContent sx={sx.dialogContent}>
                <Box sx={sx.content} className="dpScrollThin">
                  {error ? (
                    <Alert color="danger" variant="soft">
                      {error}
                    </Alert>
                  ) : null}

                  {plan?.blockers?.map(blocker => (
                    <Alert
                      key={blocker}
                      color="danger"
                      variant="soft"
                    >
                      {blocker}
                    </Alert>
                  ))}

                  {plan?.warnings?.map(warning => (
                    <Alert
                      key={warning}
                      color="warning"
                      variant="soft"
                    >
                      {warning}
                    </Alert>
                  ))}

                  <GamesBulkDeleteSummary summary={plan.summary} />

                  <GamesBulkDeletePreview games={plan.games} />

                  <GamesBulkDeleteConfirmBox
                    plan={plan}
                    value={confirmValue}
                    onChange={setConfirmValue}
                  />
                </Box>
              </DialogContent>

              <Box sx={sx.footer}>
                <Box sx={sx.footerActions}>
                  <Button
                    size="sm"
                    color="danger"
                    loading={loading}
                    disabled={!canDelete}
                    startDecorator={iconUi({ id: 'delete' })}
                    onClick={handleConfirmDelete}
                    sx={sx.confirmButton}
                  >
                    מחק משחקים
                  </Button>

                  <Button
                    size="sm"
                    variant="soft"
                    color="neutral"
                    disabled={loading}
                    startDecorator={iconUi({ id: 'close' })}
                    onClick={handleClose}
                  >
                    ביטול
                  </Button>
                </Box>

                <Typography level="body-xs" color="danger">
                  המחיקה תתבצע רק לאחר אישור הקלדה מדויק.
                </Typography>
              </Box>
            </ModalDialog>
          </Box>
        ) : null}
      </AnimatePresence>
    </Modal>
  )
}
