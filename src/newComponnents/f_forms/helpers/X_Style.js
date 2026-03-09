export const drawerProps = {
  size: "md",
  variant: "plain",
  slotProps: {
    content: {
      sx: {
        bgcolor: 'transparent',
        p: { md: 3, sm: 0 },
        boxShadow: 'none',
      },
    },
  }
}

export const drawerSheetProps = {
  sx: {
    borderRadius: 'md',
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    height: 800,
    overflow: 'auto',
  }
}
