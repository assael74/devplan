// teamProfile/modules/videos/components/drawer/EditDrawer.js

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Avatar,
  Box,
  Button,
  Drawer,
  Typography,
  Sheet,
  DialogContent,
  DialogTitle,
  ModalClose,
  Tooltip,
  IconButton,
} from '@mui/joy'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi'
import { getFullDateIl } from '../../../../../../../shared/format/dateUtiles.js'
import { resolveEntityAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { useGameHubUpdate } from '../../../../../hooks/games/useGameHubUpdate.js'
import { useLifecycle } from '../../../../../../../ui/domains/entityLifecycle/LifecycleProvider'

import GameCreateForm from '../../../../../../../ui/forms/GameCreateForm.js'
import GameVideoLinkField from '../../../../../../../ui/fields/inputUi/games/GameVideoLinkField.js'

import { editDrawerSx as sx } from './sx/editDrawer.sx.js'
import {
  buildInitialDraft,
  buildPatch,
  getIsDirty,
} from './logic/teamGameEdit.logic.js'

const c = getEntityColors('teams')

const clean = (v) => (v && String(v).trim() ? v : '')

export default function EditDrawer({
  open,
  game,
  context,
  onClose,
  onSaved,
}) {
  const initial = useMemo(() => buildInitialDraft(game), [game])
  const [draft, setDraft] = useState(initial)
  const [isValid, setIsValid] = useState(false)
  const lifecycle = useLifecycle()

  const team = context?.team || game?.team || {}
  const src = resolveEntityAvatar({ entityType: 'team', entity: team, parentEntity: team?.club, subline: team?.club?.name, })

  useEffect(() => {
    if (!open) return
    setDraft(initial)
    setIsValid(false)
  }, [open, initial])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const patch = useMemo(() => buildPatch(draft, initial), [draft, initial])

  const { run, pending } = useGameHubUpdate(game)
  const canSave = !!initial.id && isDirty && !pending

  const handleSave = async () => {
    if (!canSave) return

    await run('teamGameEdit', patch, {
      section: 'teamGameEdit',
      gameId: initial.id,
      createIfMissing: true,
    })

    onSaved(patch, { ...initial.raw, ...patch })
    onClose()
  }

  const handleReset = () => {
    setDraft({ ...initial })
  }

  const handleDelete = useCallback(() => {
    if (!game?.id) return

    lifecycle.openLifecycle(
      { entityType: 'game', id: game.id, name: `${game?.rivel || 'משחק'} ${game?.gameDate || ''}`, },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'game') return
          if (id !== game.id) return

          onClose()
        },
      }
    )
  }, [lifecycle, game?.id, game?.rivel, game?.gameDate, onClose])

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
        <DialogTitle sx={{ bgcolor: c.bg, borderRadius: 'sm', p: 1, boxShadow: 'sm' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Avatar src={src} />

            <Box sx={{ ml: 2 }}>
              <Typography level="title-md" sx={sx.formNameSx}>
                {team?.teamName || team?.name || 'קבוצה'}
              </Typography>

              <Typography
                level="body-sm"
                sx={sx.formNameSx}
                startDecorator={iconUi({ id: 'games' })}
              >
                {draft?.rivel || game?.rival || 'משחק'} - {getFullDateIl(draft?.gameDate || game?.dateRaw || '')}
              </Typography>
            </Box>
          </Box>

          <ModalClose sx={{ mr: 0.5, mt: 0.5 }} />
        </DialogTitle>

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className="dpScrollThin">
            <GameCreateForm
              draft={draft}
              onDraft={setDraft}
              onValidChange={setIsValid}
              context={{
                clubs: context?.clubs || [],
                teams: context?.teams || [],
              }}
              variant="drawer"
            />

            <GameVideoLinkField
              value={draft?.vLink || ''}
              onChange={(value) => { setDraft((prev) => ({ ...prev, vLink: value || '', })) }}
            />
          </Box>
        </DialogContent>

        <Box sx={sx.footerSx}>
          <Box sx={sx.footerActionsSx}>
            <Button
              loading={pending}
              disabled={!canSave}
              startDecorator={iconUi({ id: 'save' })}
              onClick={handleSave}
              sx={sx.conBut}
            >
              שמירה
            </Button>

            <Button
              color="neutral"
              variant="outlined"
              onClick={onClose}
              disabled={pending}
            >
              ביטול
            </Button>

            <Tooltip title="איפוס השינויים">
              <span>
                <IconButton
                  disabled={!isDirty}
                  size="sm"
                  variant="soft"
                  sx={sx.icoRes}
                  onClick={handleReset}
                >
                  {iconUi({ id: 'reset' })}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="מחיקת משחק">
              <span>
                <IconButton
                  size="sm"
                  color='danger'
                  variant="solid"
                  onClick={handleDelete}
                >
                  {iconUi({ id: 'delete' })}
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Typography level="body-xs" color={!isValid ? 'warning' : isDirty ? 'danger' : 'neutral'}>
            {!isValid ? 'יש שדות חובה חסרים' : isDirty ? 'יש שינויים שלא נשמרו' : 'אין שינויים'}
          </Typography>
        </Box>
      </Sheet>
    </Drawer>
  )
}
