import * as React from 'react';
import { Box } from '@mui/joy';
import { useQuickFormManager } from '../../utils/useQuickFormManager.js';
import PlayerMobileInfoView from './mobile/A_PlayerMobileInfoView';
import PlayerDesktopInfoView from './desktop/A_PlayerDesktopInfoView.js'

export default function InfoViewController({
  player,
  actions,
  isMobile,
  sections,
  formProps,
}) {
  const {
    formData,
    editState,
    isChanged,
    handleChange,
    handleReset,
    handleToggle,
    handleSave,
  } = useQuickFormManager({
    item: player,
    sections,
    formProps,
    onEdit: actions.editPlayer.onEdit,
  });

  const commonProps = {
    formData,
    editState,
    isChanged,
    formProps,
    onChange: handleChange,
    onToggle: handleToggle,
    onReset: handleReset,
    onSave: handleSave,
    player,
  };

  return isMobile
    ? <PlayerMobileInfoView {...commonProps} />
    : <PlayerDesktopInfoView {...commonProps} />;
}
