import * as React from 'react';
import { useQuickFormManager } from '../../utils/useQuickFormManager.js';
import MobileInfoView from './mobile/A_MobileInfoView';
import DesktopInfoView from './desktop/A_DesktopInfoView';

export default function InfoViewController({
  team,
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
    item: team,
    sections,
    formProps,
    onEdit: actions.editTeam.onEdit,
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
    team,
  };

  return isMobile
    ? <MobileInfoView {...commonProps} />
    : <DesktopInfoView {...commonProps} />;
}
