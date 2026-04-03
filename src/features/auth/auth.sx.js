export const authSx = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2,
    bgcolor: 'background.body',
  },

  shell: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 20,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.surface',
    boxShadow: 'sm',
    overflow: 'hidden',
  },

  hero: {
    p: { xs: 2, sm: 3 },
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  },

  content: {
    p: { xs: 2, sm: 3 },
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },

  submitBtn: {
    mt: 0.5,
    minHeight: 42,
  },

  helperRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },
}
