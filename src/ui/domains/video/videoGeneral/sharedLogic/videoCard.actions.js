//  src/ui/video/sharedLogic/videoCard.actions.js

export function buildVideoCardActions({
  video,
  model,
  onWatch,
  onEdit,
  onShare,
  onDelete,
  canEdit = true,
  canDelete = true,
  canShare = true,
}) {
  const canWatch = Boolean(model?.preview) && typeof onWatch === 'function'
  const canOpenEdit = canEdit && typeof onEdit === 'function'
  const canOpenShare = canShare && typeof onShare === 'function'
  const canRemove = canDelete && typeof onDelete === 'function'

  const menuItems = []

  if (canWatch) {
    menuItems.push({
      id: 'watch',
      label: 'צפייה',
      icon: 'playVideo',
      onClick: () => onWatch(video),
    })
  }

  if (canOpenEdit) {
    menuItems.push({
      id: 'edit',
      label: model?.isMissing || model?.isPartial ? 'אפיין וידאו' : 'עריכה',
      icon: 'edit',
      onClick: () => onEdit(video),
    })
  }

  if (canOpenShare) {
    menuItems.push({
      id: 'share',
      label: 'שיתוף',
      icon: 'share',
      onClick: () => onShare(video),
    })
  }

  if (canRemove) {
    if (menuItems.length) menuItems.push({ divider: true })

    menuItems.push({
      id: 'delete',
      label: 'מחיקה',
      icon: 'delete',
      color: 'danger',
      onClick: () => onDelete(video),
    })
  }

  return {
    canWatch,
    canOpenEdit,
    canOpenShare,
    canRemove,
    menuItems,
    handleWatch: canWatch ? () => onWatch(video) : undefined,
    handleEdit: canOpenEdit ? () => onEdit(video) : undefined,
    handleShare: canOpenShare ? () => onShare(video) : undefined,
    handleDelete: canRemove ? () => onDelete(video) : undefined,
  }
}
