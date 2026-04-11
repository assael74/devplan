// previewDomainCard/domains/club/teams/components/newForm/NewFormDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import { Drawer, ModalClose, Sheet, Box, Typography, Button, IconButton, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import useTeamHubCreate from '../../../../../../../../hooks/teams/useTeamHubCreate.js'

import NewFormDrawerHeader from './NewFormDrawerHeader.js'
import TeamCreateForm from '../../../../../../../../../../ui/forms/TeamCreateForm.js'

import {
  buildInitialDraft,
  getIsDirty,
} from './newFormDrawer.utils.js'

import { drawerNewFormSx as sx } from '../../sx/newFormDrawer.sx.js'

export default function NewFormDrawer({ open, onClose, onSaved, context }) {
  const initial = useMemo(() => buildInitialDraft(context), [context])

  const [draft, setDraft] = useState(initial)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!open) return

    setDraft(initial)
    setIsValid(false)
  }, [open])

  const isDirty = useMemo(() => getIsDirty(draft, initial), [draft, initial])
  const { saving, runCreateTeam } = useTeamHubCreate()
  const canSave = isDirty && isValid && !saving

  const handleSave = async () => {
    if (!canSave || saving) return

    try {
      const res = await runCreateTeam({ draft, context })
      onClose()
      onSaved(res || draft)
    } catch (error) {
      console.error('create team failed:', error)
    }
  }

  const handleReset = () => {
    if (saving) return
    setDraft(initial)
  }

  return (
    <Drawer
      open={!!open}
      size="md"
      anchor="right"
      onClose={saving ? undefined : onClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: 'transparent',
            p: { xs: 0, md: 2 },
            boxShadow: 'none',
          },
        },
      }}
    >
      <Sheet sx={sx.drawerSheetSx}>
        <Box sx={sx.drawerRootSx}>
          <NewFormDrawerHeader draft={draft} club={context.club} />
          <ModalClose sx={{ mt: 2, mr: 2 }} />

          <Box sx={{ position: 'sticky', zIndex: 5, borderRadius: 12, bgcolor: 'background.body' }}>
            <TeamCreateForm
              draft={draft}
              onDraft={setDraft}
              onValidChange={setIsValid}
              context={context}
              variant="drawer"
              clubDisabled={true}
            />
          </Box>

          <Box sx={sx.footerSx}>
            <Box sx={sx.footerActionsSx}>
              <Button
                loading={saving}
                loadingPosition="start"
                disabled={!canSave}
                startDecorator={!saving ? iconUi({ id: 'save' }) : null}
                onClick={handleSave}
                sx={sx.conBut}
              >
                {saving ? 'שומר...' : 'שמירה'}
              </Button>

              <Button
                color="neutral"
                variant="outlined"
                onClick={onClose}
                disabled={saving}
              >
                ביטול
              </Button>

              <Tooltip title="איפוס טופס">
                <span>
                  <IconButton
                    disabled={!isDirty || saving}
                    size="sm"
                    variant="soft"
                    sx={sx.icoRes}
                    onClick={handleReset}
                  >
                    {iconUi({ id: 'reset' })}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>

            <Typography level="body-xs" color={isDirty ? 'danger' : 'neutral'}>
              {saving
                ? 'שומר שחקן חדש'
                : !isDirty
                  ? 'אין שינויים'
                  : !isValid
                    ? 'יש להשלים את כל שדות החובה'
                    : 'מוכן לשמירה'}
            </Typography>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
