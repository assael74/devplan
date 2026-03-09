import * as React from 'react';
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import DynamicMainHeader from './DynamicMainHeader';
import BottomTabsContainer from './d_analystComp/a_containers/C_BottomTabsContainer.js'

function Root(props) {
  return (
    <Box
      {...props}
      sx={[
        {
          bgcolor: 'background.appBody',
          display: 'grid',
          // 2 עמודות בלבד: סיידבר + מיינ
          gridTemplateAreas: {
            xs: `"header" "main"`,
           sm: `"header header" "sidenav main"`,
          },
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(64px, 220px) 1fr',
          },
          gridTemplateRows: 'var(--Header-h) minmax(0, 1fr)',
          height: '100dvh',
          minHeight: '100dvh',
          overflow: 'hidden',
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}

function Header(props) {
  return (
    <Box
      component="header"
      className="Header"
      {...props}
      sx={[
        {
          gridArea: 'header',
          p: 2,
          gap: 2,
          bgcolor: 'background.surface',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}

function SideNav(props) {
  return (
    <Box
      component="nav"
      className="Navigation"
      {...props}
      sx={[
        {
          gridArea: 'sidenav',
          p: 2,
          bgcolor: 'background.surface',
          borderRight: '1px solid',
          borderColor: 'divider',
          position: { sm: 'sticky' },
          top: { sm: 'var(--Header-h, 64px)' },
          height: { sm: 'calc(100dvh - var(--Header-h, 64px))' },
          overflowY: { sm: 'auto' },
          overflowX: { sm: 'clip' },
          minWidth: 0,
          overflowWrap: 'anywhere',
          display: { xs: 'none', sm: 'initial' },
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    />
  );
}

function Main(props) {
  const { headerProps, children, ...rest } = props;
  return (
    <Box
      component="main"
      className="Main"
      {...rest}
      sx={[
        {
          gridArea: 'main',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100dvh - var(--Header-h, 64px))',
          minHeight: 0,
          overflow: 'hidden',
          px: 2,
          pt: 1,
          pb: 'env(safe-area-inset-bottom)',
          maxWidth: '100%',
          contain: 'inline-size',
          WebkitOverflowScrolling: 'touch',
          scrollbarColor: 'var(--joy-palette-neutral-400) transparent',
          scrollbarGutter: 'stable',
          '& > *': { maxWidth: '100%', minWidth: 0 },
          '&::-webkit-scrollbar': {
            width: '1px',
            height: 'var(--scroll-size)',
          },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--joy-palette-neutral-400)',
            borderRadius: 9999,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'var(--joy-palette-neutral-500)',
          },
        },
        ...(Array.isArray(rest.sx) ? rest.sx : [rest.sx]),
      ]}
    >
     {headerProps && <DynamicMainHeader {...headerProps} />}
      <Box
        sx={{
         flex: 1,
         minHeight: 0,
         overflowY: 'auto',
         overflowX: 'clip',
         p: 1.5,
         '--table-sticky-top': 'var(--MainHeader-h, 56px)',
       }}
      >
        {typeof children === 'function' ? children(headerProps) : children}
      </Box>
      {headerProps?.bottomTabs?.length > 0 && (
       <BottomTabsContainer
         icon={headerProps.icon}
         tab={headerProps.tab}
         isMobile={headerProps.isMobile}
         bottomTabs={headerProps.bottomTabs}
         setTab={headerProps.actions?.setTab}
         type={headerProps.type}
       />
     )}
    </Box>
  );
}

function SideDrawer(props) {
  const { onClose, ...other } = props;
  return (
    <Box
      {...other}
      sx={[
        { position: 'fixed', zIndex: 1200, width: '100%', height: '100%' },
        ...(Array.isArray(other.sx) ? other.sx : [other.sx]),
      ]}
    >
      <Box
        role="button"
        onClick={onClose}
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: (theme) =>
            `rgba(${theme.vars.palette.neutral.darkChannel} / 0.8)`,
        }}
      />
      <Sheet
        sx={{
          minWidth: 256,
          width: 'max-content',
          height: '100%',
          p: 2,
          boxShadow: 'lg',
          bgcolor: 'background.surface',
        }}
      >
        {other.children}
      </Sheet>
    </Box>
  );
}

export default {
  Root,
  Header,
  SideNav,
  SideDrawer,
  Main,
};
