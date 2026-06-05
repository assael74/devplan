// src/features/liveTagging/ui/drawer/flow/sx/flowDrawer.sx.js

export const flowDrawerSx = {
  drawer: isZoneStep => ({
    height: isZoneStep ? '92dvh' : '38dvh',
    maxHeight: isZoneStep ? '92dvh' : '42dvh',
    bgcolor: 'background.body',
    borderTopRightRadius: 'xl',
    borderTopLeftRadius: 'xl',
    p: 1,
    overflowY: 'auto',
    transition: 'height .18s ease, max-height .18s ease',
  }),
}
