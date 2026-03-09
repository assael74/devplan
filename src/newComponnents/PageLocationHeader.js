import * as React from 'react';
import { useLocation } from 'react-router-dom';
import Typography from '@mui/joy/Typography';

const routeMap = [
  ['SignUp', 'הרשמה'],
  ['SignIn', 'התחברות'],
  ['Players', 'מרכז שליטה שחקנים'],
  ['Player', 'פרופיל שחקן'],
  ['Clubs', 'מרכז שליטה מועדונים'],
  ['Teams', 'מרכז שליטה קבוצות'],
  ['Team', 'פרופיל קבוצה'],
  ['Meetings', 'מרכז שליטה פגישות'],
  ['Meeting', 'פרופיל פגישה'],
  ['Train', 'אימונים'],
  ['Analysis', 'ניתוחים'],
  ['Trainers', 'מאמנים'],
  ['Tags', 'תגיות'],
  ['Videos', 'סרטונים'],
];

export default function PageLocationHeader() {
  const location = useLocation();

  const currentTitle = React.useMemo(() => {
    const match = routeMap.find(([key]) => location.pathname.includes(key));
    return match ? match[1] : 'מרכז שליטה אנליסט';
  }, [location.pathname]);

  return (
    <Typography
      level="h4"
      sx={{
        fontWeight: 'xl',
        color: 'neutral.800',
        textAlign: 'center',
        width: '100%',
        mt: { xs: 1, md: 0 },
        fontSize: { xs: 'lg', sm: 'xl', md: '2xl' }, // שליטה בגודל לפי מסך
        letterSpacing: '0.5px',
      }}
    >
      {currentTitle}
    </Typography>

  );
}
