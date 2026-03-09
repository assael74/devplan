import React, { useState } from 'react';
import { Box, Typography, Grid, IconButton, Tooltip, Button, Avatar, Input, Chip, Divider } from '@mui/joy';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import { motion, AnimatePresence } from 'framer-motion';

const staffRoleLabel = (role) => {
  const map = {
    assistant: 'עוזר מאמן',
    fitness: 'מאמן כושר',
    analyst: 'אנליסט',
    contactPerson: 'איש קשר',
  };
  return map[role] || role;
};

export default function DesktopStaffView({
  roles,
  editState,
  onToggle,
  onReset,
  onSave,
  onChange,
  isChanged,
  handleStaffChange,
}) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  if (!roles) return null;
  //console.log(formData)
  const coach = roles?.find((staff) => staff.role === 'coach') || {};
  const otherStaff = roles?.filter((staff) => staff.role !== 'coach') || [];
  const inEdit = editState.staffInfo;
  const MotionAccordionDetails = motion.create(AccordionDetails);

  return (
    <Box sx={{ my: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', direction: 'rtl', mb: 2, }}>
        {/* כפתור עריכה - בצד ימין */}
        <Tooltip title={editState.staffInfo ? 'ביטול עריכה' : 'ערוך'}>
          <IconButton
            variant="solid"
            size="sm"
            color={editState.staffInfo ? 'danger' : 'neutral'}
            onClick={() => onToggle('staffInfo')}
            sx={{ flexShrink: 0 }}
          >
            {iconUi({ id: editState.staffInfo ? 'close' : 'edit' })}
          </IconButton>
        </Tooltip>

        {/* כותרת עם Divider - באמצע */}
        <Box sx={{ flexGrow: 1, mx: 1, ml: -4, mr: 4 }}>
          <Divider>
            <Typography level="title-md" fontWeight="lg">
              צוות מקצועי
            </Typography>
          </Divider>
        </Box>

        {/* אלמנט ריק לאיזון בצד שמאל */}
        <Box sx={{ width: 32 }} />
      </Box>

      <Grid container spacing={2}>
        <Grid xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Avatar src={coach.photo || playerImage} />
            <Chip color="warning" size="sm" startDecorator={iconUi({ id: 'star' })}>מאמן</Chip>
          </Box>
          {inEdit ? (
            <Grid container spacing={1}>
              <Grid xs={12}>
                <Input
                  placeholder="שם המאמן"
                  value={coach.fullName || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-zא-ת\s]/g, '').slice(0, 20);
                    handleStaffChange(roles.findIndex(p => p.role === 'coach'), 'fullName')({ target: { value: val } });
                  }}
                  size="sm"
                  fullWidth
                />
              </Grid>
              <Grid xs={12}>
                <Input
                  placeholder="טלפון"
                  value={coach.phone || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleStaffChange(roles.findIndex(p => p.role === 'coach'), 'phone')({ target: { value: val } });
                  }}
                  size="sm"
                  fullWidth
                />
              </Grid>
            </Grid>
          ) : (
            <>
              <Typography level="body-sm">שם: {coach.fullName || '---'}</Typography>
              <Typography level="body-sm">טלפון: {coach.phone || '---'}</Typography>
            </>
          )}
        </Grid>

        <Grid xs={12}>
          <Accordion
            expanded={isAccordionOpen}
            onChange={(_, expanded) => setIsAccordionOpen(expanded)}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 'md',
              bgcolor: 'background.level1',
              mx: -1
            }}
          >
            <AccordionSummary sx={{ p: 1 }} indicator={<ExpandMoreIcon />}>
              <Typography level="body-md" fontWeight="md">צוות נוסף</Typography>
            </AccordionSummary>
            <AnimatePresence initial={false}>
            {isAccordionOpen && (
              <MotionAccordionDetails
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                sx={{ pt: 1 }}
              >
                <Grid container spacing={2}>
                  {otherStaff.map((staff, index) => (
                    <Grid xs={6} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar src={staff.photo || playerImage} />
                        <Typography level="body-sm" fontWeight="md">{staffRoleLabel(staff.role)}</Typography>
                      </Box>
                      {inEdit ? (
                        <Grid container spacing={1}>
                          <Grid xs={6}>
                            <Input
                              placeholder="שם"
                              value={staff.fullName || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^A-Za-zא-ת\s]/g, '').slice(0, 20);
                                handleStaffChange(roles.findIndex(p => p.role === staff.role), 'fullName')({ target: { value: val } });
                              }}
                              size="sm"
                              fullWidth
                            />
                          </Grid>
                          <Grid xs={6}>
                            <Input
                              placeholder="טלפון"
                              value={staff.phone || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                handleStaffChange(roles.findIndex(p => p.role === staff.role), 'phone')({ target: { value: val } });
                              }}
                              size="sm"
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      ) : (
                        <>
                          <Typography level="body-sm">שם: {staff.fullName || '---'}</Typography>
                          <Typography level="body-sm">טלפון: {staff.phone || '---'}</Typography>
                        </>
                      )}
                    </Grid>
                  ))}
                </Grid>
              </MotionAccordionDetails>
            )}
            </AnimatePresence>
          </Accordion>
        </Grid>
      </Grid>

      {inEdit && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => onReset('staffInfo')}
          >
            איפוס
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="success"
            onClick={() => onSave('staffInfo')}
            disabled={!isChanged.staffInfo}
          >
            שמירה
          </Button>
        </Box>
      )}
    </Box>
  );
}
