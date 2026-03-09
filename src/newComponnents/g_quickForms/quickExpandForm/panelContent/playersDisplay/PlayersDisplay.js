import React from 'react';
import { Box, Chip } from '@mui/joy';
import PlayersSelectorField from '../../../../f_forms/allFormInputs/AutoUi/PlayersSelectorField.js';

export default function PlayersDisplay({
  value = [],
  editable = false,
  formProps = {},
  onChange = () => {},
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', backgroundColor: 'transparent', gap: 1.5 }}>
      {editable ? (
        <PlayersSelectorField
          value={value}
          onChange={onChange}
          players={formProps.players || []}
          teams={formProps.teams || []}
          clubs={formProps.clubs || []}
        />
      ) : value.length > 0 ? (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {value.map((playerId, index) => {
            const player = (formProps.players || []).find(p => p.id === playerId);
            return (
              <Chip
                key={playerId + index}
                size="sm"
                variant="outlined"
                color="primary"
              >
                {player?.playerFullName || 'שחקן לא מזוהה'}
              </Chip>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}
