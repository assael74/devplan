// previewDomainCard/domains/team/players/sx/teamPlayerEditDrawer.sx.js
import { getEntityColors } from '../../../../../../../../../ui/core/theme/Colors.js'

const c = getEntityColors('players')

export const drawerSx = {
  drawerSheetSx: {
    borderRadius: 'md',
    py: 1,
    px: 0.5,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    height: '100%',
    overflow: 'hidden',
    bgcolor: 'background.body',
  },

  drawerRootSx: {
    height: '100%',
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    bgcolor: 'background.body',
  },

  headerRowSx: {
    px: 1.25,
    pt: 0.75,
    pb: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    borderRadius: 'sm',
    bgcolor: c.bg
  },

  playerHeroSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
  },

  headerMainSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: 0,
    width: '100%',
    pr: 4,
  },

  avatarWrapSx: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: 'sm',
    outline: '2px solid',
    outlineColor: 'rgba(255,255,255,0.85)',
  },

  playerTextSx: {
    minWidth: 0,
    display: 'grid',
    gap: 0.2,
  },

  playerNameSx: {
    fontWeight: 600,
    lineHeight: 1.05,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  playerMetaSx: {
    color: 'text.secondary',
    fontSize: 12,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  bodySx: {
    display: 'grid',
    gap: 1,
    p: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    minWidth: 0,
    minHeight: 0,
    flex: 1,
  },

  sectionCardSx: {
    p: 1,
    borderRadius: 'xl',
    bgcolor: 'background.level1',
    border: '1px solid',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.75,
  },

  sectionStatusCardSx: {
    p: 1,
    mt: 4,
    borderRadius: 'sm',
    borderTop: '1px solid',
    bgcolor: 'background.surface',
    borderColor: 'divider',
    display: 'grid',
    gap: 0.75,
  },

  sectionTitleSx: {
    fontWeight: 700,
    color: 'text.secondary',
    fontSize: 12,
  },

  boolRowSx: {
    display: 'grid',
    alignItems: 'center',
    gap: 0.75,
    gridTemplateColumns: '1fr 1fr',
  },

  footerSx: {
    pt: 1,
    mt: 1,
    borderTop: '1px solid',
    borderColor: 'divider',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    flexWrap: 'wrap',
    bgcolor: 'background.body',
  },

  footerActionsSx: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
  },

  icoRes: {
    height: 36,
    width: 36,
    flexShrink: 0,
  },

  conBut: {
    bgcolor: c.bg,
    color: c.text,
    transition: 'filter .15s ease, transform .12s ease',
    '&:hover': {
      bgcolor: c.bg,
      color: c.text,
      filter: 'brightness(0.96)',
      transform: 'translateY(-1px)',
    },
  },
}
