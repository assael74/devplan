//  hub/playerProfile/modules/abilities/components/inviteDrawer/AbilitiesInviteCreateDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Drawer,
  Typography,
  Sheet,
  DialogContent,
} from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { editDrawerSx as sx } from './sx/drawer.sx.js'
import AbilitiesInviteDrawerHeader from './AbilitiesInviteDrawerHeader.js'
import AbilitiesInviteDrawerContent from './AbilitiesInviteDrawerContent.js'
import {
  buildRolesPool,
  buildEvaluatorFromRoles,
  buildPlayerLabel,
  resolvePlayerPhoto,
  copyText,
  openWhatsapp,
  buildInviteInitialState,
  getInviteIsValid,
  getInviteCanSave,
  getCreatedLink,
  getCreatedWhatsappText,
  createInviteFlow,
  clean,
} from './logic/abilitiesInvite.logic.js'

export default function AbilitiesInviteCreateDrawer({
  open,
  onClose,
  player,
  context,
  onCreated,
}) {
  const roles = useMemo(() => buildRolesPool(context), [context])
  const playerPhoto = useMemo(() => resolvePlayerPhoto(player), [player])
  const playerName = useMemo(() => buildPlayerLabel(player), [player])

  const initialState = useMemo(() => buildInviteInitialState(), [])
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState(initialState.selectedEvaluatorId)
  const [selectedDomains, setSelectedDomains] = useState([])
  const [pending, setPending] = useState(initialState.pending)
  const [error, setError] = useState(initialState.error)
  const [copied, setCopied] = useState(initialState.copied)
  const [createdState, setCreatedState] = useState(initialState.createdState)

  useEffect(() => {
    if (!open) return

    const next = buildInviteInitialState()
    setSelectedEvaluatorId(next.selectedEvaluatorId)
    setPending(next.pending)
    setError(next.error)
    setCopied(next.copied)
    setCreatedState(next.createdState)
  }, [open])

  const evaluator = useMemo(() => {
    return buildEvaluatorFromRoles(roles, selectedEvaluatorId)
  }, [roles, selectedEvaluatorId])

  const isValid = useMemo(() => {
    return getInviteIsValid({ player, playerName, evaluator })
  }, [player, playerName, evaluator])

  const canSave = useMemo(() => {
    return getInviteCanSave({ isValid, pending, createdState })
  }, [isValid, pending, createdState])

  const createdLink = useMemo(() => getCreatedLink(createdState), [createdState])
  const createdWhatsappText = useMemo(() => getCreatedWhatsappText(createdState), [createdState])

  const handleCreate = async () => {
    if (pending) return

    if (!clean(player?.id)) {
      setError('לא נמצא שחקן תקין ליצירת הקישור')
      return
    }

    if (!clean(evaluator?.id)) {
      setError('יש לבחור מעריך לפני יצירת הקישור')
      return
    }

    setPending(true)
    setError('')
    setCopied(false)

    try {
      const created = await createInviteFlow({
        player,
        evaluator,
        activeDomains: selectedDomains,
      })

      setCreatedState(created)
      onCreated(created)

    } catch (err) {
      setError(clean(err?.message) || 'יצירת הקישור נכשלה')
    } finally {
      setPending(false)
    }
  }

  const handleCopy = async () => {
    const ok = await copyText(createdLink)
    setCopied(ok)
  }

  const handleWhatsapp = () => {
    openWhatsapp(createdWhatsappText)
  }

  return (
    <Drawer
      size="md"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <AbilitiesInviteDrawerHeader
          createdState={createdState}
          playerName={playerName}
          playerPhoto={playerPhoto}
        />

        <DialogContent sx={{ gap: 2 }}>
          <AbilitiesInviteDrawerContent
            createdState={createdState}
            roles={roles}
            selectedEvaluatorId={selectedEvaluatorId}
            setSelectedEvaluatorId={setSelectedEvaluatorId}
            evaluator={evaluator}
            error={error}
            setError={setError}
            createdLink={createdLink}
            copied={copied}
            handleCopy={handleCopy}
            handleWhatsapp={handleWhatsapp}
            createdWhatsappText={createdWhatsappText}
            selectedDomains={selectedDomains}
            setSelectedDomains={setSelectedDomains}
          />
        </DialogContent>

        <Box sx={sx.footerSx}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {!createdState ? (
              <Button
                loading={pending}
                disabled={!canSave}
                startDecorator={iconUi({ id: 'link' })}
                onClick={handleCreate}
                sx={sx.conBut}
              >
                צור קישור
              </Button>
            ) : (
              <Button
                startDecorator={iconUi({ id: 'whatsapp' })}
                onClick={handleWhatsapp}
                disabled={!createdWhatsappText}
                sx={sx.conBut}
              >
                שלח בוואטסאפ
              </Button>
            )}

            <Button
              color="neutral"
              variant="outlined"
              onClick={onClose}
              disabled={pending}
            >
              {createdState ? 'סגור' : 'ביטול'}
            </Button>
          </Box>

          <Typography level="body-xs" color={!isValid && !createdState ? 'warning' : 'neutral'}>
            {!createdState
              ? !isValid
                ? 'יש לבחור מעריך כדי לאפשר יצירת קישור'
                : 'הטופס מוכן ליצירת קישור'
              : copied
                ? 'הקישור הועתק בהצלחה'
                : 'אפשר לשתף עכשיו את הקישור או להעתיק אותו'}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
