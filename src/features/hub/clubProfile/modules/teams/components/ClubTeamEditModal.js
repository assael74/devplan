// clubProfile/modules/teams/components/ClubTeamEditModal.js
import React, { useMemo, useState, useEffect } from 'react'
import { Modal, ModalDialog, Typography, Box, Button, Divider, Chip, Avatar } from '@mui/joy'

import { buildFallbackAvatar } from '../../../../../../ui/core/avatars/fallbackAvatar.js'
import TeamIfaLinkField from '../../../../../../ui/fields/inputUi/teams/TeamIfaLinkField.js'
import TeamNameField from '../../../../../../ui/fields/inputUi/teams/TeamNameField.js'
import TeamProjectSelector from '../../../../../../ui/fields/checkUi/teams/TeamProjectSelector.js'
import TeamActiveSelector from '../../../../../../ui/fields/checkUi/teams/TeamActiveSelector.js'
import YearPicker from '../../../../../../ui/fields/dateUi/YearPicker.js'

import { useUpdateAction } from '../../../../../../ui/domains/entityActions/updateAction.js'

const str = (v) => (v == null ? '' : String(v).trim())

const buildInitial = (row) => {
  const r = row?.raw || row || {}

  return {
    id: r?.id,
    teamName: str(r?.teamName),
    ifaLink: str(r?.ifaLink),
    teamYear: r?.teamYear || null,
    active: !!r?.active,
    project: !!r?.project,
  }
}

export default function ClubTeamEditModal({ open, row, onClose }) {
  const initial = useMemo(() => buildInitial(row), [row])
  const [draft, setDraft] = useState(initial)

  useEffect(() => setDraft(initial), [initial])

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'teams',
    snackEntityType: 'team',
    id: draft?.id,
    entityName: draft?.teamName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const isDirty = useMemo(() => {
    return JSON.stringify(initial) !== JSON.stringify(draft)
  }, [initial, draft])

  const canSave = !!draft?.id && !!draft?.teamName && isDirty

  const handleSave = async () => {
    if (!canSave) return

    const patch = {
      teamName: draft.teamName,
      ifaLink: draft.ifaLink || null,
      teamYear: draft.teamYear || null,
      active: draft.active,
      project: draft.project,
    }

    await runUpdate(patch, {
      section: 'team-general',
      source: 'ClubTeamEditModal',
    })

    onClose()
  }

  const src = row?.photo || buildFallbackAvatar({ entityType: 'club', id: row?.id, name: row?.clubName })

  return (
    <Modal open={!!open} onClose={onClose}>
      <ModalDialog sx={{ width: 'min(720px, 94vw)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="title-md">עריכת קבוצה</Typography>

          <Chip size="sm" variant="soft" startDecorator={<Avatar src={src} />}>
            {draft.teamName || '—'}
          </Chip>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1.2 }}>

          <TeamNameField
            value={draft.teamName}
            onChange={(v) => setDraft((d) => ({ ...d, teamName: v }))}
          />

          <YearPicker
            value={draft.teamYear}
            label='שנתון'
            onChange={(v) => setDraft((d) => ({ ...d, teamYear: v }))}
          />

          <Box sx={{ display: 'flex', alignItems: 'flex-end', pb: 1, gap: 2, justifyContent: 'center' }}>
            <TeamActiveSelector
              value={draft.active}
              onChange={(v) => setDraft((d) => ({ ...d, active: v }))}
            />

            <TeamProjectSelector
              value={draft.project}
              onChange={(v) => setDraft((d) => ({ ...d, project: v }))}
            />
          </Box>

        </Box>

        <TeamIfaLinkField
          value={draft.ifaLink}
          onChange={(v) => setDraft((d) => ({ ...d, ifaLink: v }))}
        />

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="plain"
            disabled={pending}
            onClick={onClose}
          >
            ביטול
          </Button>

          <Button
            loading={pending}
            disabled={!canSave}
            onClick={handleSave}
          >
            שמירה
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
