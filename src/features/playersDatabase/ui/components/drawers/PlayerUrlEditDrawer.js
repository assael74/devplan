// features/playersDatabase/ui/components/drawers/PlayerUrlEditDrawer.js

import EntitySeasonUrlDrawer from './EntitySeasonUrlDrawer.js'

export default function PlayerUrlEditDrawer({
  row,
  seasonLabel,
  open,
  saving,
  onClose,
  onSave,
}) {
  return (
    <EntitySeasonUrlDrawer
      open={open}
      onClose={onClose}
      onSave={onSave}
      saving={saving}
      entityType='player'
      entityName={row?.fullName || row?.playerName || ''}
      seasonLabel={seasonLabel}
      value={row?.playerUrl || ''}
      title='עריכת קישור שחקן'
      fieldLabel='קישור השחקן לעונה'
      fieldPlaceholder='https://www.football.org.il/players/player/...'
    />
  )
}
