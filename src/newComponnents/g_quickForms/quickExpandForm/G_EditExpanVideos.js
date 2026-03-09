import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, Box } from '@mui/joy';
import QuickExpandedFormContainer from './A_QuickExpandedFormContainer';
import VideoCommentsField from '../../f_forms/allFormInputs/inputUi/VideoCommentsField.js';
import PlayersDisplay from './panelContent/playersDisplay/PlayersDisplay.js';
import TagsDisplay from './panelContent/tagsDisplay/TagsDisplay.js';

export default function EditExpanVideos({ type, item = {}, actions, formProps = {} }) {
  const [comments, setComments] = useState(item.comments || '');
  const [tags, setTags] = useState(item.tags || []);
  const [initialState, setInitialState] = useState({ comments, tags });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setInitialState({ comments, tags });
  }, [item]);

  const isDirty =
    JSON.stringify(comments) !== JSON.stringify(initialState.comments) ||
    JSON.stringify(tags) !== JSON.stringify(initialState.tags);

  const handleReset = () => {
    setComments(initialState.comments);
    setTags(initialState.tags);
  };

  const handleSave = () => {
    const newItem = {
      ...item,
      comments,
      tags,
    };
    actions.onEdit({ oldItem: item, newItem, type: 'videos' });
    actions.setExpandedId?.(null);
  };

  return (
    <QuickExpandedFormContainer
      title={item.name || '-'}
      label={item.name}
      type={type}
      isDirty={isDirty}
      onSave={handleSave}
      onReset={handleReset}
      autoHeight={false}
      minContentHeight={100}
      maxContentHeight={250}
      height={(isMobile) => (isMobile ? 300 : 200)}
      renderMobileContent={() => (
        <Box>
          <Box mb={2}>
            <VideoCommentsField
              value={comments}
              onChange={setComments}
              size={isMobile ? 'sm' : 'sm'}
            />
          </Box>
          <TagsDisplay
            tags={tags}
            type='video'
            editable={true}
            formProps={formProps}
            onChange={setTags}
          />
        </Box>
      )}
      renderDesktopContent={() => (
        <Box>
          <Box mb={2}>
            <VideoCommentsField
              value={comments}
              onChange={setComments}
              size={isMobile ? 'sm' : 'sm'}
            />
          </Box>
          <TagsDisplay
            tags={tags}
            type='video'
            editable={true}
            formProps={formProps}
            onChange={setTags}
          />
        </Box>
      )}
    />
  );
}
