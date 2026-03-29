//  features/abilitiesPublic/components/sx/domainsHeader.sx.js

export const domainsHeaderSx = {
  root: {
    position: 'sticky',
    top: 0,
    zIndex: 20,
    px: 1.25,
    pt: 1.25,
    pb: 1,
    bgcolor: '#f6f8fb',
  },

  card: {
    p: 1.25,
    borderRadius: 'xl',
    boxShadow: 'sm',
    background:
      'linear-gradient(135deg, rgba(25,118,210,1) 0%, rgba(66,165,245,1) 100%)',
  },

  scoreCard: {
    px: 1,
    py: 0.75,
    borderRadius: 'lg',
    bgcolor: 'rgba(255,255,255,0.14)',
    minWidth: 72,
  },

  starsWrap: {
    px: 0.75,
    py: 0.375,
    borderRadius: '999px',
    bgcolor: 'rgba(255,255,255,0.16)',
    display: 'inline-flex',
    alignItems: 'center',
  },
}
