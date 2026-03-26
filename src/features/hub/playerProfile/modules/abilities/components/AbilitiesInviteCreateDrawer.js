import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControl,
  FormLabel,
  Input,
  ModalClose,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy'

import { createAbilitiesInvite } from '../../../../../abilitiesPublic/invites/abilitiesInvites.create.service.js'

function clean(v) {
  return String(v ?? '').trim()
}

function buildDefaultEvaluator(player, context) {
  const roleFromContext = Array.isArray(context?.roles) ? context.roles[0] : null

  return {
    id: clean(roleFromContext?.id),
    name: clean(roleFromContext?.name || roleFromContext?.fullName),
    type: clean(roleFromContext?.type || roleFromContext?.roleType || roleFromContext?.roleName),
  }
}

export default function AbilitiesInviteCreateDrawer({
  open,
  onClose,
  player,
  context,
}) {
  const defaultEvaluator = useMemo(() => {
    return buildDefaultEvaluator(player, context)
  }, [player, context])

  const [evaluatorName, setEvaluatorName] = useState(defaultEvaluator?.name || '')
  const [evaluatorType, setEvaluatorType] = useState(defaultEvaluator?.type || '')
  const [defaultRoleId, setDefaultRoleId] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('7')
  const [allowRoleEdit, setAllowRoleEdit] = useState(true)
  const [allowGrowthStageEdit, setAllowGrowthStageEdit] = useState(true)
  const [singleUse, setSingleUse] = useState(true)

  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    setEvaluatorName(defaultEvaluator?.name || '')
    setEvaluatorType(defaultEvaluator?.type || '')
  }, [defaultEvaluator])

  useEffect(() => {
    if (!open) return

    setError('')
    setResult(null)
  }, [open])

  const canCreate = useMemo(() => {
    return Boolean(clean(player?.id) && clean(player?.playerFullName || player?.fullName || player?.name))
  }, [player])

  async function handleCreateInvite() {
    if (!canCreate) {
      setError('חסר שחקן תקין ליצירת קישור')
      return
    }

    try {
      setPending(true)
      setError('')

      const created = await createAbilitiesInvite({
        player,
        evaluator: {
          id: '',
          name: evaluatorName,
          type: evaluatorType,
        },
        defaults: {
          roleId: defaultRoleId,
          growthStage: '',
        },
        meta: {
          expiresInDays: Number(expiresInDays || 7),
          allowRoleEdit,
          allowGrowthStageEdit,
          singleUse,
          createdBy: '',
        },
      })

      setResult(created)
    } catch (err) {
      setError(err?.message || 'יצירת הקישור נכשלה')
    } finally {
      setPending(false)
    }
  }

  async function handleCopyLink() {
    const text = result?.invite?.link || ''
    if (!text) return
    if (!navigator?.clipboard?.writeText) return
    await navigator.clipboard.writeText(text)
  }

  async function handleCopyWhatsappText() {
    const text = result?.invite?.whatsappText || result?.whatsappText || ''
    if (!text) return
    if (!navigator?.clipboard?.writeText) return
    await navigator.clipboard.writeText(text)
  }

  function handleClose() {
    onClose?.()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      size="md"
      slotProps={{
        content: {
          sx: {
            width: 'min(100vw, 520px)',
          },
        },
      }}
    >
      <Sheet
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.body',
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 2,
            bgcolor: 'background.body',
          }}
        >
          <ModalClose />
          <Typography level="title-lg">שליחת טופס יכולות</Typography>
          <Typography level="body-sm">
            יצירת קישור ציבורי למילוי מהנייד ללא התחברות
          </Typography>
        </Box>

        <Box
          className="dpScrollThin"
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 1.5,
          }}
        >
          <Stack spacing={1.5}>
            <Sheet variant="soft" sx={{ p: 1.25, borderRadius: 'md' }}>
              <Stack spacing={0.5}>
                <Typography level="title-sm">פרטי שחקן</Typography>
                <Typography level="body-sm">
                  שחקן: {player?.playerFullName || player?.fullName || player?.name || '-'}
                </Typography>
                <Typography level="body-sm">
                  קבוצה: {player?.teamName || player?.team?.teamName || player?.team?.name || '-'}
                </Typography>
              </Stack>
            </Sheet>

            <FormControl>
              <FormLabel>שם הממלא</FormLabel>
              <Input
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                placeholder="לדוגמה: מאמן קבוצה"
              />
            </FormControl>

            <FormControl>
              <FormLabel>סוג ממלא</FormLabel>
              <Input
                value={evaluatorType}
                onChange={(e) => setEvaluatorType(e.target.value)}
                placeholder="לדוגמה: coach / parent / analyst"
              />
            </FormControl>

            <FormControl>
              <FormLabel>תפקיד ברירת מחדל</FormLabel>
              <Input
                value={defaultRoleId}
                onChange={(e) => setDefaultRoleId(e.target.value)}
                placeholder="roleId"
              />
            </FormControl>

            <FormControl>
              <FormLabel>תוקף קישור בימים</FormLabel>
              <Input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="7"
              />
            </FormControl>

            <Sheet variant="outlined" sx={{ p: 1.25, borderRadius: 'md' }}>
              <Stack spacing={1}>
                <Typography level="title-sm">הגדרות הרשאה</Typography>

                <Checkbox
                  checked={allowRoleEdit}
                  onChange={(e) => setAllowRoleEdit(e.target.checked)}
                  label="לאפשר שינוי תפקיד בטופס"
                />

                <Checkbox
                  checked={allowGrowthStageEdit}
                  onChange={(e) => setAllowGrowthStageEdit(e.target.checked)}
                  label="לאפשר שינוי שלב התפתחות"
                />

                <Checkbox
                  checked={singleUse}
                  onChange={(e) => setSingleUse(e.target.checked)}
                  label="קישור חד פעמי"
                />
              </Stack>
            </Sheet>

            {error ? (
              <Typography level="body-sm" color="danger">
                {error}
              </Typography>
            ) : null}

            {result?.invite?.link ? (
              <Sheet variant="soft" sx={{ p: 1.25, borderRadius: 'md' }}>
                <Stack spacing={1}>
                  <Typography level="title-sm">קישור שנוצר</Typography>

                  <Typography level="body-sm" sx={{ wordBreak: 'break-word' }}>
                    {result.invite.link}
                  </Typography>

                  <Divider />

                  <Typography level="title-sm">הודעת וואטסאפ</Typography>

                  <Typography level="body-sm" sx={{ whiteSpace: 'pre-wrap' }}>
                    {result?.invite?.whatsappText || result?.whatsappText || ''}
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button variant="soft" onClick={handleCopyLink}>
                      העתק קישור
                    </Button>

                    <Button variant="soft" onClick={handleCopyWhatsappText}>
                      העתק הודעת וואטסאפ
                    </Button>
                  </Stack>
                </Stack>
              </Sheet>
            ) : null}
          </Stack>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            bottom: 0,
            bgcolor: 'background.body',
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button variant="plain" color="neutral" onClick={handleClose}>
              סגור
            </Button>

            <Button
              sx={{ ml: 'auto' }}
              onClick={handleCreateInvite}
              loading={pending}
              disabled={!canCreate || pending}
            >
              צור קישור
            </Button>
          </Stack>
        </Box>
      </Sheet>
    </Drawer>
  )
}
