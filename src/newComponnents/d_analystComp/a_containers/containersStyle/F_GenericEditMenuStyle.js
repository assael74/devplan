import { IconButton } from '@mui/joy';

export const menuCardBoxProps = ({isMobile, flexBasis, columns}) => {
  const currentColumns =
    (columns?.xs) ||
    (columns?.sm) ||
    (columns?.md) ||
    columns?.xs || 1;

  const right = () => {
    if (isMobile) {
      return columns?.xs === 1 ? 0 : 6;
    }
    return columns?.md === 1 ? -20 : columns?.md === 2 ? -20 : columns?.md === 3 ? -15 : -2;
  };

  return {
    sx: {
      position: 'absolute',
      top: -10,
      right: right(),
      zIndex: 1,
      width: flexBasis.menu,
    }
  }
}

export const menuTableBoxProps = ({isMobile}) => ({
  size: isMobile ? 'sm' : 'md'
})
