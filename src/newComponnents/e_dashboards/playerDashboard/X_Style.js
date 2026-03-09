import { iconUi } from '../../b_styleObjects/icons/IconIndex.js'
import { typeBackground } from '../../b_styleObjects/Colors.js';

/// B_TeamProfileLayout
export const boxTabsProps = {
  sx: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 1000,
    bgcolor: '#f5f5f5',
    borderTop: '1px solid #ddd',
    boxShadow: '0 -2px 6px rgba(0,0,0,0.04)',
  }
}

export const tabListPorps = {
  sx:{
    display: 'flex',
    justifyContent: 'space-around',
    px: 1,
    position: 'relative',
  }
}

export const tabProps = (tabIndex, index) => ({
  sx:{
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    py: 1,
    fontSize: 'xs',
    color: tabIndex === index ? 'primary.plainColor' : 'neutral.600',
    '&:hover': { bgcolor: 'transparent' },
  }
})

export const motiomBoxStyle = (tabIndex) => ({
  layout: true,
  transition: { type: 'spring', stiffness: 300, damping: 30 },
  style: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 4,
    backgroundColor: '#007c91',
    width: `20%`, // 100% / מספר טאבים
    left: `${tabIndex * 20}%`, // מתאים למיקום
  }
})

export const motionBoxProps = {
  sx: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
    p: 0, // נשמור ריווח באזור הגולל
  },
};

/// DesktopPanel
export const boxPanelProps = {
  dir: "rtl",
  sx:{
    direction: 'rtl',
    textAlign: 'right',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 2,
    px: 2,
    py: 3,
  }
}

export const panelHeaderProps = (bgColor) => ({
  sx: {
    borderRadius: 'sm',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    backgroundColor: bgColor || '#f5f5f5',
    borderBottom: '1px solid #ddd',
  }
})

export const sheetPanelProps = (panel) => ({
  variant:"outlined",
  sx:{
    p: 3,
    borderRadius: 'lg',
    cursor: 'pointer',
    transition: '0.25s',
    backgroundColor: panel.color,
    '&:hover': {
      boxShadow: 'lg',
      borderColor: 'primary.outlinedHoverBorder',
      transform: 'scale(1.02)',
    },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 140,
  }
})

export const drawerProps = {
  size: 'md',
  variant: 'plain',
  slotProps: {
    content: {
      sx: {
        height: '100vh',
        display: 'flex',
        overflow: 'hidden',
        p: { md: 2, sm: 0 },
        boxShadow: 'lg',
        minHeight: 0,
      },
    },
  },
};

export const avatarProps = {
  sx: {
    width: 36,
    height: 36,
    mr: 1,
    border: '2px solid rgba(0,0,0,0.06)',
    boxShadow: 'sm',
  }
}
