// src/features/playersDatabase/ui/components/drawers/LeagueUrlEditDrawer.js

import EntitySeasonUrlDrawer from './EntitySeasonUrlDrawer.js'

export default function LeagueUrlEditDrawer({
  league,
  season,
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
      entityType='league'
      entityName={league?.name || league?.leagueName || ''}
      seasonLabel={season?.seasonKey || ''}
      value={season?.season?.seasonUrl || ''}
      title={season?.season?.seasonUrl ? 'עריכת קישור ליגה' : 'הוספת קישור ליגה'}
      fieldLabel='קישור הליגה לעונה'
      fieldPlaceholder='הדבק כאן קישור מלא לליגה'
    />
  )
}
