import MultiSeasonUrlDrawer from './MultiSeasonUrlDrawer.js'
export default function PlayerUrlEditDrawer({ rows, entityName, open, saving, onClose, onSave, onChange }) {
  return <MultiSeasonUrlDrawer open={open} onClose={onClose} onSave={onSave} onChange={onChange} rows={rows} saving={saving} entityType='player' entityName={entityName} title='עריכת קישורי שחקן' fieldLabel='קישור השחקן לעונה' contextLabel={row => [row.teamName, row.leagueName].filter(Boolean).join(' · ')} />
}
