export const moduleSx = {
  root: {
    display: 'grid',
    gap: 1,
    minWidth: 0,
  },

  toolbar: {
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    px: 1.25,
    py: 0.75,
    borderRadius: 'md',
    bgcolor: 'rgba(23, 59, 87, 0.045)',
    border: '1px solid',
    borderColor: 'divider',
  },

  toolbarTitleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  toolbarDot: {
    width: 9,
    height: 9,
    borderRadius: '50%',
    bgcolor: 'primary.500',
    boxShadow: '0 0 0 4px rgba(47, 134, 199, 0.12)',
    flexShrink: 0,
  },

  toolbarTitle: {
    fontWeight: 700,
    color: 'text.primary',
    lineHeight: 1.15,
  },

  toolbarSubtitle: {
    color: 'text.tertiary',
    mt: 0.2,
    whiteSpace: 'nowrap',
  },

  toolbarActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 0.75,
    flexShrink: 0,
  },

  secondaryAction: {
    minHeight: 32,
    borderRadius: 8,
    fontWeight: 700,
    border: '1px solid',
    borderColor: 'divider',
  },

  saveAction: (canSave = false) => ({
    minHeight: 32,
    borderRadius: 8,
    fontWeight: 800,
    bgcolor: canSave ? 'primary.600' : 'neutral.300',
    color: canSave ? '#fff' : 'text.tertiary',
    '&:hover': {
      bgcolor: canSave ? 'primary.700' : 'neutral.300',
    },
    '&:disabled': {
      opacity: 1,
    },
  }),

  rolesWrap: {
    minWidth: 0,
    alignSelf: 'start',
    height: 'auto',
    display: 'grid',
    gap: 0.6,
  },

  infoCard: {
    p: 1,
    borderRadius: 'md',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: 'sm',
    display: 'grid',
    gap: 0.9,
    minWidth: 0,
  },

  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 0.75,
    minWidth: 0,
  },

  readGrid: {
    display: 'grid',
    gap: 0.75,
    minWidth: 0,
  },

  readItem: {
    minWidth: 0,
    p: 0.85,
    borderRadius: 'md',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
  },

  readLabel: {
    color: 'text.tertiary',
    fontWeight: 600,
    mb: 0.35,
  },

  readValue: {
    color: 'text.primary',
    fontWeight: 700,
    minWidth: 0,
  },

  readLink: {
    color: 'primary.700',
    fontWeight: 700,
    direction: 'ltr',
    textAlign: 'right',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  },

  editHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 0.75,
    pb: 0.6,
    borderBottom: '1px solid',
    borderColor: 'divider',
    minWidth: 0,
  },

  editTitle: {
    fontWeight: 700,
    color: 'text.primary',
  },

  editSubtitle: {
    color: 'text.tertiary',
    mt: 0.2,
  },

  fieldsGrid: {
    display: 'grid',
    gap: 0.8,
    minWidth: 0,
  },
}
