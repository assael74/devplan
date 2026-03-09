export const PAYMENT_TYPES = [
  { id: 'monthlyPayment', labelH: 'חודשי', idIcon: 'monthlyPayment', disabled: false },
  { id: 'oneTimePayment', labelH: 'חד פעמי', idIcon: 'oneTimePayment', disabled: false },
]

export const PAYMENT_STATUSES = [
  { id: 'new', labelH: 'ממתין לתשלום', idIcon: 'isNotPaid', color: 'warning', disabled: false },
  { id: 'invoice', labelH: 'חשבונית', idIcon: 'isInvoice', color: 'neutral', disabled: false },
  { id: 'done', labelH: 'תשלום נסגר', idIcon: 'isPaid', color: 'success', disabled: false },
]

export const OPEN_PAYMENT_STATUS_IDS = new Set(['new', 'invoice'])
