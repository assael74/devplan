// src/ui/domains/video/videoAnalysis/videoAnalysisCard.presets.js
export const VIDEO_ANALYSIS_CARD_PRESETS = {
  videoHub: {
    showYm: true,
    maxVisibleTags: 3,
    showDivider: true,
    playButtonColor: 'danger',
    menu: ({ video, onShare, onEdit, onLink }) => [
      { id: 'share', label: 'שיתוף', icon: 'share', onClick: () => onShare?.(video) },
      { id: 'link', label: 'עריכת שיוך הוידאו', icon: 'link', onClick: () => onLink?.(video) },
      { id: 'edit', label: 'עריכת תגים והערות', icon: 'tags', onClick: () => onEdit?.(video) },
      { divider: true },
      { id: 'delete', label: 'מחיקה', icon: 'delete', color: 'danger' },
    ],
  },

  hub: {
    showYm: true,
    maxVisibleTags: 2,
    showDivider: true,
    playButtonColor: 'primary',
    menu: () => [],
  },

  team: {
    showYm: true,
    maxVisibleTags: 3,
    showDivider: true,
    playButtonColor: 'danger',
    menu: ({ video, onEdit, onLink }) => [
      { id: 'edit', label: 'עריכת תגים', icon: 'tags', onClick: () => onEdit?.(video) },
      { id: 'link', label: 'שיוך', icon: 'link', onClick: () => onLink?.(video) },
    ],
  },
}
