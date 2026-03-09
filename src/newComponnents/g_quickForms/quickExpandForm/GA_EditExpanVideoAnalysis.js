import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js'
import { useTheme, Box, Accordion, AccordionSummary, AccordionDetails, Stack, Typography, Divider, Chip } from '@mui/joy';
import QuickExpandedFormContainer from './A_QuickExpandedFormContainer';
import VideoCommentsField from '../../f_forms/allFormInputs/inputUi/VideoCommentsField.js';
import PlayersDisplay from './panelContent/playersDisplay/PlayersDisplay.js';
import TagsDisplay from './panelContent/tagsDisplay/TagsDisplay.js';
import GenericChipSelector from './panelContent/chipDisplay/GenericChipSelector.js'

export default function EditExpanVideoAnalysis({ type, item = {}, actions, formProps = {} }) {
  const [comments, setComments] = useState(item.comments || '');
  const [players, setPlayers] = useState(item.players || []);
  const [meetingId, setMeetingId] = useState(item.meetingId || '');
  const [tags, setTags] = useState(item.tags || []);
  const [initialState, setInitialState] = useState({ comments, players, tags, meetingId });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setInitialState({ comments, players, tags, meetingId });
  }, [item]);

  const isDirty =
    JSON.stringify(comments) !== JSON.stringify(initialState.comments) ||
    JSON.stringify(meetingId) !== JSON.stringify(initialState.meetingId) ||
    JSON.stringify(players) !== JSON.stringify(initialState.players) ||
    JSON.stringify(tags) !== JSON.stringify(initialState.tags);

  const handleReset = () => {
    setComments(initialState.comments);
    setMeetingId(initialState.meetingId);
    setPlayers(initialState.players);
    setTags(initialState.tags);
  };

  const handleSave = () => {
    const newItem = {
      ...item,
      comments,
      players,
      meetingId,
      tags,
    };
    actions.onEdit({ oldItem: item, newItem, type: 'videoAnalysis' });
    actions.setExpandedId?.(null);
  };

  const meeting = formProps?.meetings?.find(i => i.id === meetingId);
  const meetingLabel = meeting ? `${meeting.meetingDate}` : 'פגישה';

  return (
    <QuickExpandedFormContainer
      title={item.name || '-'}
      isDirty={isDirty}
      onSave={handleSave}
      onReset={handleReset}
      autoHeight={false}
      formProps={formProps}
      type={type}
      minContentHeight={100}
      maxContentHeight={350}
      height={(isMobile) => (isMobile ? 350 : 250)}
      renderMobileContent={() => (
        <Box sx={{ overflowY: 'auto', pr: 1 }}>
          <Box mb={2}>
            <VideoCommentsField value={comments} onChange={setComments} size="sm" />
          </Box>
          <Accordion sx={{ p:1 }}>
            <AccordionSummary sx={{ p: 0.5 }}><Typography level="body-sm">שחקנים בניתוח</Typography></AccordionSummary>
            <AccordionDetails>
              <PlayersDisplay
                value={players}
                editable={true}
                onChange={setPlayers}
                formProps={formProps}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion sx={{ p:1 }}>
            <AccordionSummary sx={{ p: 0.5 }}><Typography level="body-sm">תגיות</Typography></AccordionSummary>
            <AccordionDetails>
              <TagsDisplay
                tags={tags}
                type="videoAnalysis"
                editable={true}
                formProps={formProps}
                onChange={setTags}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
      renderDesktopContent={() => (
        <Stack spacing={2} direction="column">
          <Stack spacing={2} direction="row" alignItems="flex-start">
            <Box flex={1}>
              <TagsDisplay
                tags={tags}
                type="videoAnalysis"
                editable={true}
                formProps={formProps}
                onChange={setTags}
              />
            </Box>

            {/* מפריד אנכי */}
            <Divider orientation="vertical" flexItem />

            <Box flex={1}>
              <PlayersDisplay
                value={players}
                editable={true}
                onChange={setPlayers}
                formProps={formProps}
              />
            </Box>
          </Stack>

          {/* אזור הערות עם עיצוב מופרד */}
          <Box>
            <VideoCommentsField value={comments} onChange={setComments} size="sm" />
          </Box>
        </Stack>
      )}
      chip={
        <GenericChipSelector
          label={meetingLabel}
          iconId="meeting"
          color="success"
          type={'selectMeeting'}
          formProps={formProps}
          value={meetingId}
          onChange={setMeetingId}
          isMobile={isMobile}
          options={formProps.meetings}
        />
      }
    />
  );
}
