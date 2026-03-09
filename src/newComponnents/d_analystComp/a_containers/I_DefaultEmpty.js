import React from 'react';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';
import { boxEmptyProps, sheetIconProps } from './containersStyle/I_DefaultEmptyStyle.js';
import { Box, Stack, Sheet, Typography, Button } from '@mui/joy';
import NewClubForm from '../../f_forms/B_NewClub.js'
import NewTeamForm from '../../f_forms/C_NewTeam.js'
import NewPlayerForm from '../../f_forms/D_NewPlayer.js'
import NewPaymentForm from '../../f_forms/E_NewPayment.js'
import NewMeetingForm from '../../f_forms/F_NewMeeting.js'
import NewVideoForm from '../../f_forms/G_NewVideo.js'
import NewTagForm from '../../f_forms/H_NewTag.js'
import NewGameForm from '../../f_forms/I_NewGame.js'

const formComponents = {
  players: {
    default: NewPlayerForm,
  },
  teams: {
    default: NewTeamForm,
  },
  clubs: {
    default: NewClubForm,
  },
  payments: {
    default: NewPaymentForm,
  },
  meetings: {
    default: NewMeetingForm,
  },
  videos: {
    default: NewVideoForm,
  },
  tags: {
    default: NewTagForm,
  },
  games: {
    default: NewGameForm,
  },
};

const formOpenActionId = {
  players: 'newPlayer',
  teams: 'newTeam',
  clubs: 'newClub',
  payments: 'newPayment',
  meetings: 'newMeeting',
  videos: 'newVideo',
  tags: 'newTag',
  games:'newGame',
}

export default function DefaultEmpty({
  title = 'פריטים',
  icon,
  onAdd,
  data,
  formProps,
  type
}) {
  const FormComponent = formComponents[type]?.default || null;

  const idForm = formOpenActionId[type] || null;

  const handleSave = (data) => {
    onAdd?.(data);
  };
  //console.log(formProps)

  return (
    <>
      <Box {...boxEmptyProps}>
        <Stack spacing={2} alignItems="center">
          <Sheet {...sheetIconProps}>
            {icon && iconUi({ id: icon, size: 'lg' })}
          </Sheet>
          <Typography level="h6">אין {title} להצגה</Typography>
          <Typography level="body-sm" color="neutral">
            ניתן להוסיף {title} דרך הכפתור למטה
          </Typography>
          {FormComponent && (
            <FormComponent
              idNav = 'defaultEmpty'
              onSave={onAdd}
              idForm={idForm}
              isMobile={false}
              formProps={{ ...formProps, onSave: handleSave }}
            />
          )}
        </Stack>
      </Box>

    </>
  );
}
