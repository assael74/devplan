// features/playersDatabase/ui/pages/teamPage/TeamRoleModal.js

import PlayerRoleEditModal from '../../components/playerRole/PlayerRoleEditModal.js'

export default function TeamRoleModal({
  row,
  draft,
  busy,
  changed,
  onDraftChange,
  onConfirm,
  onClose,
}) {
  return (
    <PlayerRoleEditModal
      open={Boolean(row)}
      playerName={row?.fullName || ''}
      draft={draft}
      busy={busy}
      changed={changed}
      onDraftChange={onDraftChange}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}
