// ui/forms/meetings/edit.layout.js

export function getMeetingEditFormLayout({ isMobile = false }) {
  if (isMobile) {
    return {
      panelPadding: 1,
      panelBg: 'background.surface',
      gridCols: '1fr 1fr',
      statusMode: 'select',
      showDivider: false,
    }
  }

  return {
    panelPadding: 1.25,
    panelBg: 'background.level1',
    gridCols: '1fr 1fr 1fr 0fr 1fr',
    statusMode: 'steps',
    showDivider: true,
  }
}
