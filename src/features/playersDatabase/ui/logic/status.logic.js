// features/playersDatabase/ui/logic/status.logic.js

export const PDB_STATUS = {
  full: { label: 'מלא', tone: 'success' },
  partial: { label: 'חלקי', tone: 'warning' },
  missing: { label: 'חסר', tone: 'danger' },
  loaded: { label: 'נטען', tone: 'success' },
  notLoaded: { label: 'טרם נטען', tone: 'neutral' },
}

export function resolveStatusMeta(value) {
  return PDB_STATUS[value] || PDB_STATUS.notLoaded
}
