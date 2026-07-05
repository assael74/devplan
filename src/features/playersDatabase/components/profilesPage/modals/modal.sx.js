// features/playersDatabase/components/profilesPage/modals/modal.sx.js

export const modalSx = {
  dialog: {
    width: 'min(720px, calc(100vw - 24px))',
    borderRadius: '10px',
  },

  head: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1.5,
    pr: 3.5,
  },

  meta: {
    color: '#6b7280',
  },

  identity: {
    mt: 1,
    p: 1,
    border: '1px solid #d8e0e7',
    borderRadius: '8px',
    bgcolor: '#fbfcfd',
    display: 'grid',
    gap: 0.4,
  },

  identityTitle: {
    fontWeight: 700,
  },

  field: {
    mt: 1,
  },

  label: {
    display: 'block',
    mb: 0.5,
    fontSize: 12,
    fontWeight: 700,
    color: '#6b7280',
  },

  error: {
    mt: 1,
    color: '#b42318',
    fontWeight: 700,
  },

  actions: {
    mt: 2,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 0.75,
  },
}
