// features/playersDatabase/ui/components/drawers/TeamUrlEditDrawer.js

import EntitySeasonUrlDrawer from './EntitySeasonUrlDrawer.js'

export default function TeamUrlEditDrawer({
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
      entityType='team'
      entityName={row?.name || row?.teamName || ''}
      seasonLabel={seasonLabel}
      value={row?.teamUrl || ''}
      title='עריכת קישור קבוצה'
      fieldLabel='קישור הקבוצה לעונה'
      fieldPlaceholder='https://www.football.org.il/team-details/...'
    />
  )
}
