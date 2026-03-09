import React, { useState } from 'react';
import { getDefaultActions } from '../../f_forms/X_Actions';
import { getDefaultQuickActions } from '../../g_quickForms/X_Actions';
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { deleteTag } from '../../a_firestore/actionData/deleteData/deleteTag';
import NewTagForm from '../../f_forms/H_NewTag.js';
import GenericObjectLayout from '../a_containers/A_GenericObjectLayout.js';

export default function TagsLayout(props) {
  const { clubs, teams, players, meetings, payments, videos, videoAnalysis, tags, allShorts } = props;
  const [idDisplay, setIdDisplay] = useState('tableList');
  const [tab, setTab] = useState(0);

  const { showSnackbar } = useSnackbar();

  const addActions = getDefaultActions({ type: 'tags' });
  const editActions = getDefaultQuickActions({ type: 'tags' });

  const actions = {
    ...addActions,
    ...editActions,
    onAdd: async (data, internalActions) => {
      await addActions.onAdd(data, internalActions);
    },
    onDelete: async (tag) => {
      await deleteTag(tag, showSnackbar, allShorts);
    },
    setTab: setTab,
    setIdDisplay: setIdDisplay
  };

  const formProps = {
    players,
    teams,
    clubs,
    meetings,
    payments,
    videos,
    tags,
    videoAnalysis
  }

  return (
    <GenericObjectLayout
      id="tagsLayout"
      type="tags"
      view='profileAnalyst'
      tab={tab}
      title="תגיות"
      icon="tags"
      idDisplay={idDisplay}
      rowData={{ tags }}
      form={NewTagForm}
      formProps={formProps}
      columns={{ xs: 2, sm: 3, md: 4 }}
      actions={actions}
      getInitialState={(tag) => ({
        id: tag?.id || '',
        tagName: tag?.tagName || '',
        tagType: tag?.tagType || 'general',
        tagPlayers: tag?.tagPlayers || [],
        tagVideos: tag?.tagVideos || [],
      })}
      getChips={() => []}
    />
  );
}
