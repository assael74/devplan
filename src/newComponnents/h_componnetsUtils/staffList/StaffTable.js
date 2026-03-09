import { formatPhoneNumber } from '../../x_utils/contactUtiles.js'
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import playerImage from '../../b_styleObjects/images/playerImage.jpg'
import { STAFF_ROLE_OPTIONS } from '../../x_utils/optionLists.js';
import { Table, Typography, IconButton, Menu, MenuItem, Avatar, Dropdown, MenuButton, Box, Tooltip } from '@mui/joy';

export default function StaffTable({
  onChange,
  value = [],
  formProps,
  isMobile,
  size = 'sm',
  required = false,
  disabled = false,
}) {
  //console.log(onChange)
  const getRoleLabel = (id) => STAFF_ROLE_OPTIONS.find(i => i.id === id)?.labelH || 'תפקיד לא ידוע';

  const handleRemove = (e, staffId) => {
    e.stopPropagation();
    const updated = value.filter(staff => staff.id !== staffId);
    onChange(updated);
  };

  const handleSelectStaffToAdd = (staff) => {
    // הימנע מהוספה כפולה
    const isAlreadyAdded = value.some(s => s.id === staff.id);
    if (isAlreadyAdded) return;

    const updated = [...value, staff];
    onChange(updated);
  };

  const fontSize = size === 'sm' ? '10px' : '12px'
  const styleCell = {
    textAlign: 'center',
    fontSize: fontSize,
    level: "body-sm",
    dir: "ltr"
  }

  return (
    <>
      <Table borderAxis="bothBetween" stripe="even" size={size} sx={{ width: '100%', mt: 1 }}>
        <thead>
          <tr>
            <th style={{ width: 50 }}></th>
            <th><Typography {...styleCell}>שם</Typography></th>
            <th><Typography {...styleCell}>תפקיד</Typography></th>
            <th><Typography {...styleCell}>טלפון</Typography></th>
            <th><Typography {...styleCell}>אימייל</Typography></th>
            <th style={{ width: 50 }}></th>
          </tr>
        </thead>
        <tbody>
          {value.map((staff) => (
            <tr key={staff.id}>
              <td style={{ width: 50 }}>
                <Avatar src={playerImage} alt={staff.fullName} sx={{ width: 30, height: 30 }} />
              </td>
              <td><Typography {...styleCell}>{staff.fullName}</Typography></td>
              <td><Typography {...styleCell}>{getRoleLabel(staff.type)}</Typography></td>
              {!isMobile ? (
                <>
                  <td><Typography {...styleCell}>{formatPhoneNumber(staff.phone)}</Typography></td>
                  <td><Typography {...styleCell}>{staff.email}</Typography></td>
                </>
              ) : (
                <>
                  <td>
                    <Dropdown>
                      <MenuButton slots={{ root: IconButton }} slotProps={{ root: { size } }} variant="plain">
                        {iconUi({id: 'phone', size: size})}
                      </MenuButton>
                      <Menu sx={{ zIndex: 1500, p: 2 }} placement="left-start">
                        <Typography {...styleCell}>
                          {staff.phone !== '' ? formatPhoneNumber(staff.phone) : 'No Phone'}
                        </Typography>
                      </Menu>
                    </Dropdown>
                  </td>
                  <td>
                    <Dropdown>
                      <MenuButton slots={{ root: IconButton }} slotProps={{ root: { size } }} variant="plain">
                        {iconUi({id: 'email', size: size})}
                      </MenuButton>
                      <Menu sx={{ zIndex: 1500, p: 2 }} placement="left-start">
                        <Typography {...styleCell}>{staff.email !== '' ? staff.email : 'No Email'}</Typography>
                      </Menu>
                    </Dropdown>
                  </td>
                </>
              )}
              <td style={{ width: 50 }}>
                <Tooltip title="הסר איש מקצוע מהרשימה">
                  <IconButton size="sm" onClick={(e) => handleRemove(e, staff.id)} disabled={disabled}>
                    {iconUi({ id: 'remove', size: size })}
                  </IconButton>
                </Tooltip>
              </td>
            </tr>
          ))}

          {/* שורת הוספה */}
          <tr>
            <td colSpan={5}></td>
            <td style={{ width: 50 }}>
              <Tooltip title="הוסף איש מקצוע לרשימה">
                <Dropdown>
                  <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{ root: { size } }}
                    disabled={disabled}
                  >
                    {iconUi({ id: 'add', size: size })}
                  </MenuButton>

                  <Menu sx={{ zIndex: 1500 }} placement="left-start">
                    {formProps.roles.map((staff) => {
                      const team = formProps.teams?.find(t => t.id === staff.teamId);
                      const club = formProps.clubs?.find(c => c.id === staff.clubId);
                      const role = getRoleLabel(staff.type);

                      const isUnassigned = !staff.teamId && !staff.clubId;
                      const isAlreadyAdded = value.some(s => s.id === staff.id);

                      const colorUnAssigned = isUnassigned ? 'success' : 'neutral';
                      const teamName = team?.teamName || 'ללא קבוצה';
                      const clubName = club?.clubName || 'ללא מועדון';

                      return (
                        <MenuItem
                          key={staff.id}
                          disabled={isAlreadyAdded}
                          onClick={() => handleSelectStaffToAdd(staff)}
                          sx={{ alignItems: 'flex-start', py: 1.2 }}
                        >
                          <Avatar src={staff.photo || ''} alt={staff.fullName} sx={{ width: 32, height: 32, mr: 1 }} />
                          <Box sx={{ display: 'flex', flexDirection: 'column', mt: -0.5 }}>
                            <Typography level="body-sm">{staff.fullName}</Typography>
                            <Typography level="body-xs" sx={{ color: 'neutral.500', fontSize: '0.7rem' }}>
                              {role}
                            </Typography>
                            <Typography color={colorUnAssigned} level="body-xs" sx={{ fontSize: '0.7rem' }}>
                              {teamName} | {clubName}
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Menu>
                </Dropdown>
              </Tooltip>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}
