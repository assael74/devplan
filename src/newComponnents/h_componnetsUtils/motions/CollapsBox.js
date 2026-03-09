import { Box } from '@mui/joy';

export default function CollapseBox({ open, children, duration = 300 }) {
  return (
    <Box
      sx={{
        //maxHeight: open ? 1000 : 0, // גובה מקסימלי משוער
        display: open ? 'block' : 'none',
        overflow: 'hidden',
        //transition: `max-height ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`,
        transition: `opacity ${duration}ms ease-in-out`,
        opacity: open ? 1 : 0,
      }}
    >
      {children}
    </Box>
  );
}
