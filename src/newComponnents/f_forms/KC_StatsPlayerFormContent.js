import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/joy/styles';
import { iconUi } from '../b_styleObjects/icons/IconIndex';
import playerImage from '../b_styleObjects/images/playerImage.jpg';
import { getGameStatsFieldLists } from './helpers/gameStatsFields';
import { accordInnerProps, boxExraFieldsProps } from './X_Style';
import { getFullDateIl } from '../x_utils/dateUtiles.js'
import { Box, Typography, Stack, Avatar, Divider, Grid, IconButton } from '@mui/joy';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
import GenericInputField from './allFormInputs/inputUi/GenericInputField';
import GenericCheckSelector from './allFormInputs/checkUi/GenericCheckSelector';
import PlayerPositionsSimpleSelect from './allFormInputs/selectUi/PlayerPositionsSimpleSelect';
import StatsFieldSelectorDialog from './helpers/StatsFieldSelectorDialog';
import OnSquadSelector from './allFormInputs/checkUi/OnSquadSelector';

const PlayerInfoMini = React.memo(({ position = 'Pos.', timePlayed = '0', visible = false }) => (
  <Box
    sx={{
      display: visible ? 'flex' : 'none',
      alignItems: 'center',
      gap: 1,
    }}
  >
    <Typography level="title-sm" fontWeight="lg">{position}</Typography>
    <Typography level="title-sm" fontWeight="lg">({timePlayed})</Typography>
  </Box>
));

export default function StatsPlayerFormContent({
  playerStats,
  smartChange,
  onToggle,
  game,
  formProps,
  extraFields,
  setExtraFields,
  settingsOpen,
  setSettingsOpen,
  showExtraStats,
  setShowExtraStats,
  isMobile,
  handleStatChange,
  player,
}) {
  const [isExtraOpen, setIsExtraOpen] = useState(false);
  const { defaultList, extraList, availableExtraOptions } = getGameStatsFieldLists({
    statsParm: formProps.statsParm,
    extraFields,
  });
  const theme = useTheme();
  const accordText = isExtraOpen ? 'הסתר שדות נוספים' : 'הצג שדות נוספים'

  return (
    <Box>
      {/* כותרת */}
      <Box sx={{ display: 'flex', alignItems: 'center', direction: 'rtl', mb: 2, px: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={0.5}>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              {game?.home ? 'בית' : 'חוץ'} מול {game?.rivel || '---'}
              <Typography level="body-sm" fontWeight='lg' sx={{ color: 'text.secondary', mr: 1 }}>
                {getFullDateIl(game?.gameDate, isMobile) || 'תאריך לא ידוע'}
              </Typography>
            </Typography>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              תוצאה: {game?.goalsFor ?? '-'} - {game?.goalsAgainst ?? '-'}
            </Typography>
          </Stack>
        </Box>

        <StatsFieldSelectorDialog
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          allFields={availableExtraOptions}
          selected={extraFields}
          onApply={setExtraFields}
          actionIcon={
            <IconButton variant="solid" onClick={() => setSettingsOpen(true)}>
              {iconUi({ id: 'moreStats', sx: { fontSize: 28 } })}
            </IconButton>
          }
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box p={1}>
        <Box mb={2}>
          <OnSquadSelector
            value={playerStats.isSelected}
            size={isMobile ? 'sm' : 'md'}
            onChange={(e) => onToggle(e.target.checked)}
          />
        </Box>
        <Grid container spacing={2}>
          {defaultList.map(({ id, label, type }, index) => {
            const fieldId = `input-${id}-${playerStats.playerId}-${index}`;
            const val = playerStats[id];

            return (
              <Grid
                key={id}
                xs={type === 'triplet' ? 4 : type === 'select' ? 8 : 4}
                md={type === 'triplet' ? 4 : type === 'select' ? 6 : 3}
              >
                {type === 'boolean' ? (
                  <GenericCheckSelector
                    id={fieldId}
                    label={label}
                    size={isMobile ? 'sm' : 'md'}
                    trueLabel="בהרכב"
                    falseLabel="בספסל"
                    iconIdFalse="isNotStart"
                    iconIdTrue="isStart"
                    value={val || false}
                    onChange={(v) => handleStatChange(id, v)}
                  />
                ) : type === 'select' ? (
                  <PlayerPositionsSimpleSelect
                    id={fieldId}
                    label={label}
                    value={val || ''}
                    size={isMobile ? 'sm' : 'md'}
                    onChange={(v) => handleStatChange(id, v)}
                  />
                ) : (
                  <GenericInputField
                    id={fieldId}
                    type={type}
                    value={val || ''}
                    label={label}
                    size={isMobile ? 'sm' : 'md'}
                    onChange={smartChange(id, type)}
                  />
                )}
              </Grid>
            );
          })}
        </Grid>
        {extraList.length > 0 && (
          <Accordion {...accordInnerProps(theme)} expanded={isExtraOpen} onChange={() => setIsExtraOpen((prev) => !prev)}>
            <AccordionSummary indicator={null}>
              <Typography level="title-sm" fontWeight="lg">{accordText}</Typography>
            </AccordionSummary>
            <AccordionDetails variant="soft" color="success" sx={{ borderRadius: 'lg' }}>
              <Box {...boxExraFieldsProps}>
                <Grid container spacing={1} sx={{ px: 0.5 }}>
                  {extraList
                    .sort((a, b) => {
                      if (a.type === 'triplet' && b.type !== 'triplet') return -1;
                      if (a.type !== 'triplet' && b.type === 'triplet') return 1;
                      return (a.order ?? 0) - (b.order ?? 0);
                    })
                    .map(({ id, label, labelShort, type, tripletGroup }, index) => {
                      const fieldId = `input-${id}-${playerStats.playerId}-${index}`;
                      const labelInput = isMobile ? labelShort : label;
                      const val = playerStats[id];

                      return (
                        <Grid
                          key={id}
                          xs={type === 'triplet' ? 4 : type === 'select' ? 8 : 4}
                          md={type === 'triplet' ? 4 : type === 'select' ? 6 : 3}
                        >
                          {type === 'boolean' ? (
                            <GenericCheckSelector
                              id={fieldId}
                              label={labelInput}
                              size={isMobile ? 'sm' : 'md'}
                              trueLabel="בהרכב"
                              falseLabel="בספסל"
                              iconIdFalse="isNotStart"
                              iconIdTrue="isStart"
                              value={val || false}
                              onChange={(v) => handleStatChange(id, v)}
                            />
                          ) : (
                            <GenericInputField
                              id={fieldId}
                              type={type}
                              size={isMobile ? 'sm' : 'md'}
                              value={
                                id.toLowerCase().includes('rate')
                                  ? (() => {
                                      const success = Number(playerStats[`${tripletGroup}Success`] || 0);
                                      const total = Number(playerStats[`${tripletGroup}Total`] || 0);
                                      const percent = total > 0 ? `${Math.round((success / total) * 100)}%` : '0%';
                                      return percent;
                                    })()
                                  : val || ''
                              }
                              label={labelInput}
                              readOnly={id.toLowerCase().includes('rate')}
                              onChange={smartChange(id, type)}
                            />
                          )}
                        </Grid>
                      );
                    })}
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Box>
  );
}
