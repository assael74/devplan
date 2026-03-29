//  features/abilitiesPublic/components/sx/domainsGrowthStage.sx.js

export const domainsGrowthStageSx = {
  root: (hasError) => ({
    p: 1.25,
    borderRadius: 'xl',
    border: '1px solid',
    borderColor: hasError ? 'danger.outlinedBorder' : 'primary.outlinedBorder',
    bgcolor: hasError ? 'danger.softBg' : 'primary.softBg',
  }),

  iconWrap: (hasError) => ({
    width: 34,
    height: 34,
    borderRadius: '50%',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  }),

  scrollWrap: {
    overflowX: 'auto',
    overflowY: 'hidden',
    WebkitOverflowScrolling: 'touch',
    pb: 0.5,
  },

  chipsRow: {
    flexWrap: 'nowrap',
    width: 'max-content',
    minWidth: '100%',
    my: 0.5,
  },

  chip: {
    flex: '0 0 auto',
    whiteSpace: 'nowrap',
    borderRadius: '999px',
    fontWeight: 600,
  },
}
