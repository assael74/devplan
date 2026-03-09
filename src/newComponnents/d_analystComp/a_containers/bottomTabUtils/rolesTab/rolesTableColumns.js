// 📁 bottomTabUtils/tables/videoTableColumns.js
import { Button, Typography, Box, Chip, Avatar, Divider } from '@mui/joy';
import { IconButton, Menu, MenuItem, Dropdown, MenuButton, Tooltip } from '@mui/joy';
import JoyStarRating from '../../../../h_componnetsUtils/rating/JoyStarRating.js';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex.js';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { STAFF_ROLE_OPTIONS } from '../../../../x_utils/optionLists.js';
import { formatPhoneNumber } from '../../../../x_utils/contactUtiles.js'
import { boxProps } from './X_Style'

export const getRolesRowStructure = (isMobile, newActions, formProps, { type }) => {
  /// רוחב העמודות isMobile ? '20%' : '20%'
  const onEdit = newActions.onEdit || (() => {});
  const handleOpenDialog = newActions.handleOpenDialog
  const club = (clubId) => formProps.clubs.find(i=>i.id === clubId)
  const team = (teamId) => formProps.teams.find(i=>i.id === teamId)
  const typeRole = (id) => STAFF_ROLE_OPTIONS.find(i=>i.id === id)

  const mainRow = isMobile
    ? [
        {
          id: 'photo',
          label: 'תמונת איש צוות',
          iconId: 'photo',
          render: (item) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 25, height: 25 }}
                src={item.photo || playerImage}
                alt={item.fullName || 'ללא שם'}
              />
            </Box>
          ),
          width: '15%',
        },
        {
          id: 'name',
          label: 'שם איש הצוות',
          iconId: 'name',
          render: (item) => {
            return <Typography fontSize='10px'>{item?.fullName || ''}</Typography>
          },
          width: '20%',
        },
        {
          id: 'phone',
          label: 'נייד',
          iconId: 'contact',
          render: (item) => {
            return (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Dropdown>
                  <MenuButton slots={{ root: IconButton }} slotProps={{ root: { size: 'sm' } }} variant="plain">
                    {iconUi({id: 'contact', size: 'sm'})}
                  </MenuButton>
                  <Menu sx={{ zIndex: 1500, p: 2 }} placement="bottom">
                    <Box>
                      <Typography startDecorator={iconUi({id: 'phone', size: 'sm'})}>
                        {item.phone !== '' ? formatPhoneNumber(item.phone) : 'No Phone'}
                      </Typography>
                      <Typography startDecorator={iconUi({id: 'email', size: 'sm'})}>
                        {item.email !== '' ? item.email : 'No Email'}
                      </Typography>
                    </Box>
                  </Menu>
                </Dropdown>
              </Box>
            )
          },
          width: '10%',
        },
        {
          id: 'type',
          label: 'תפקיד',
          iconId: 'roles',
          render: (item) => {
            const typeItem = typeRole(item.type);
            return (
              <Box {...boxProps}>
                <Typography fontSize="10px" sx={{ whiteSpace: 'normal', textAlign: 'center' }}>
                  {typeItem?.labelH}
                </Typography>
              </Box>
            )
          },
          width: '15%',
        },
        {
          id: 'clubName',
          label: 'מועדון',
          iconId: 'clubs',
          render: (item) => {
            const clubItem = club(item.clubId);
            const teamItem = team(item.teamId);
            return (
              <Box>
                <Typography fontSize='10px'>{clubItem?.clubName || 'לא משוייך'}</Typography>
                <Typography fontSize='10px'>{teamItem?.teamName || 'לא משוייך'}</Typography>
              </Box>
            )
          },
          width: '20%',
        },
      ]
    : [
        {
          id: 'photo',
          label: '',
          tooltip: '',
          iconId: 'photo',
          render: (item) => (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 30, height: 30 }}
                src={item.photo || playerImage}
                alt={item.fullName || 'ללא שם'}
              />
            </Box>
          ),
          width: '10%'
        },
        {
          id: 'name',
          label: 'שם איש הצוות',
          tooltip: 'שם איש הצוות',
          iconId: 'roles',
          render: (item) => item.fullName || '-',
          width: '20%',
        },
        {
          id: 'type',
          label: 'תפקיד',
          tooltip: 'תפקיד איש הצוות',
          iconId: 'roles',
          render: (item) => {
            const typeItem = typeRole(item.type);
            return typeItem?.labelH || 'לא הוגדר';
          },
          width: '10%',
        },
        {
          id: 'phone',
          label: 'נייד',
          tooltip: 'נייד',
          iconId: 'phone',
          render: (item) => {
            return formatPhoneNumber(item.phone);
          },
          width: '10%',
        },
        {
          id: 'email',
          label: 'אימייל',
          tooltip: 'אימייל',
          iconId: 'email',
          render: (item) => {
            return item.email || 'לא הוגדר';
          },
          width: '10%',
        },
        {
          id: 'teamName',
          label: 'קבוצה',
          tooltip: 'שם הקבוצה',
          iconId: 'teams',
          render: (item) => {
            const teamItem = team(item.teamId);
            return teamItem?.teamName || 'לא משויך לקבוצה';
          },
          width: '10%',
        },
        {
          id: 'clubName',
          label: 'מועדון',
          tooltip: 'שם המועדון',
          iconId: 'clubs',
          render: (item) => {
            const clubItem = club(item.clubId);
            return clubItem?.clubName || 'לא משויך למועדון';
          },
          width: '10%',
        },
      ];

  const expandedRow = [
    {
      id: 'expandedForm',
      render: (item) => (
        <Box>אין מידע נוסף</Box>
      ),
    },
  ];

  return { mainRow, expandedRow };
};
