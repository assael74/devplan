import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme, Box, Stack, Typography, Divider } from '@mui/joy';
import QuickExpandedFormContainer from './A_QuickExpandedFormContainer';
import ProManEditField from '../../f_forms/allFormInputs/inputUi/ProManEditField';
import ClubNameField from '../../f_forms/allFormInputs/inputUi/ClubNameField';

export default function EditExpanClub({ type, item = {}, actions, formProps = {} }) {
  const [clubName, setClubName] = useState(item.clubName || '');
  const [proMan, setProMan] = useState(item.proMan?.[0] || { role: '', fullName: '', phone: '' });

  const [initialState, setInitialState] = useState({ clubName, proMan });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setInitialState({ clubName, proMan });
  }, [item]);

  const isDirty =
    clubName !== initialState.clubName ||
    JSON.stringify(proMan) !== JSON.stringify(initialState.proMan);

  const handleReset = () => {
    setClubName(initialState.clubName);
    setProMan(initialState.proMan);
  };

  const handleSave = () => {
    const newItem = {
      ...item,
      clubName,
      proMan: [proMan],
    };
    actions.onEdit({ oldItem: item, newItem, type: 'clubs' });
    actions.setExpandedId?.(null);
  };

  return (
    <QuickExpandedFormContainer
      title={clubName || '-'}
      label="שם מועדון:"
      type={type}
      isDirty={isDirty}
      onSave={handleSave}
      onReset={handleReset}
      autoHeight={false}
      minContentHeight={100}
      maxContentHeight={250}
      height={(isMobile) => (isMobile ? 300 : 200)}
      renderMobileContent={() => (
        <Box sx={{ overflowY: 'auto', pr: 1 }}>
          <Box mb={2}>
            <ClubNameField label="שם מועדון" value={clubName} onChange={setClubName} />
          </Box>
          <ProManEditField value={proMan} onChange={setProMan} size="sm" />
        </Box>
      )}
      renderDesktopContent={() => (
        <Stack spacing={2}>
          <Stack spacing={2} direction="row" alignItems="flex-start">
            <Box flex={1}>
              <ClubNameField label="שם מועדון" value={clubName} onChange={setClubName} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box flex={1}>
              <ProManEditField value={proMan} onChange={setProMan} size="sm" />
            </Box>
          </Stack>
        </Stack>
      )}
    />
  );
}
