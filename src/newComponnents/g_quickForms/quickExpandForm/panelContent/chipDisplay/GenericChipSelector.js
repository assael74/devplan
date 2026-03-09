import { useState } from 'react';
import { Chip, Modal, ModalDialog, Box, Typography, ModalClose, Button, DialogContent, DialogTitle } from '@mui/joy';
import Avatar from '@mui/joy/Avatar';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import MeetingSelectField from '../../../../f_forms/allFormInputs/selectUi/MeetingSelectField.js'
import GameTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/GameTypeSelectField.js'
import StatsParmTypeSelectField from '../../../../f_forms/allFormInputs/selectUi/StatsParmTypeSelectField.js'

const selectorComponentsMap = {
  selectMeeting: MeetingSelectField,
  selectGameType: GameTypeSelectField,
  selectStatsParmType: StatsParmTypeSelectField,
};

export default function GenericChipSelector({
  view,
  type,
  formProps,
  onChange,
  value = '',
  label = '',
  iconId = '',
  options = [],
  placeholder = '',
  isMobile = false,
  labelPrefix = '',
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.id === value);

  const SelectComponent = selectorComponentsMap[type] || false;

  return (
    <>
      <Chip
        variant="outlined"
        size={isMobile ? 'sm' : 'md'}
        color={selected ? 'success' : 'neutral'}
        sx={{
          maxWidth: isMobile ? 100 : 140 ,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          px: 1,
          cursor: 'pointer',
        }}
        onClick={view === 'profilePlayer' ? undefined : () => setOpen(true)}
        startDecorator={iconUi({ id: selected.idIcon, size: isMobile ? 'sm' : 'md' })}
      >
        {selected.labelH}
      </Chip>

      <Modal open={open}>
        <ModalDialog sx={{ bgcolor: 'background.surface', p: 1, borderRadius: 'sm', boxShadow: 'lg', width: 250 }}>
          <DialogTitle>בחר סוג חדש</DialogTitle>
          <ModalClose variant="outlined" onClick={() => setOpen(false)} />
          <DialogContent>
          {SelectComponent ? (
              <SelectComponent
                value={value}
                onChange={onChange}
                options={options}
                formProps={formProps}
                size="sm"
              />
            ) : (
              <Typography level="body-sm" color="danger">
                סוג סלקט לא נתמך: {type}
              </Typography>
            )}
          </DialogContent>
          <Button onClick={() => setOpen(false)}>ok</Button>
        </ModalDialog>
      </Modal>
    </>
  );
}
