import EntitySeasonUrlDrawer from './EntitySeasonUrlDrawer.js'
import MultiSeasonUrlDrawer from './MultiSeasonUrlDrawer.js'
export default function TeamUrlEditDrawer({ rows, entityName, row, seasonLabel, open, saving, onClose, onSave, onChange }) {
  if (!Array.isArray(rows)) return <EntitySeasonUrlDrawer open={open} onClose={onClose} onSave={onSave} saving={saving} entityType='team' entityName={row?.name || row?.teamName || ''} seasonLabel={seasonLabel} value={row?.teamUrl || ''} title='עריכת קישור קבוצה' fieldLabel='קישור הקבוצה לעונה' fieldPlaceholder='הדבק כאן קישור מלא לקבוצה' />
  return <MultiSeasonUrlDrawer open={open} onClose={onClose} onSave={onSave} onChange={onChange} rows={rows} saving={saving} entityType='team' entityName={entityName} title='עריכת קישורי קבוצה' fieldLabel='קישור הקבוצה לעונה' contextLabel={item => [item.leagueName, item.ageGroupLabel].filter(Boolean).join(' · ')} />
}
