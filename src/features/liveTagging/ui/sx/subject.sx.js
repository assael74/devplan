// src/features/liveTagging/ui/sx/subject.sx.js

export const subjectSx = {
  subjectBar: {
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 'lg',
    p: 1,
    display: 'grid',
    gap: 0.75,
  },

  subjectInline: {
    display: 'grid',
    gridTemplateColumns: {
      xs: 'auto 1fr',
      sm: 'auto minmax(220px, 1fr)',
    },
    gap: 0.75,
    alignItems: 'center',
  },

  subjectTypeActions: {
    display: 'flex',
    gap: 0.5,
  },

  playerSelect: {
    width: '100%',
  },
}
