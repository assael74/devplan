// features/playersDatabase/ui/layout/Breadcrumbs.js

import * as React from 'react'
import {
  Box,
  Link,
  Typography,
} from '@mui/joy'
import { Link as RouterLink } from 'react-router-dom'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { breadcrumbsSx as sx } from './breadcrumbs.sx.js'

export default function Breadcrumbs({ items = [] }) {
  const [homeItem, ...restItems] = items

  return (
    <Box sx={sx.root}>
      {homeItem ? (
        <Link
          component={RouterLink}
          to={homeItem.to}
          underline='none'
          sx={sx.homeLink}
        >
          {iconUi({
            id: 'home',
            size: 'sm',
          })}
        </Link>
      ) : null}

      {restItems.map((item, index) => {
        const offsetIndex = index + 1
        const isLast = offsetIndex === items.length - 1
        return (
          <React.Fragment key={`${item.label}-${offsetIndex}`}>
            <Typography level='body-sm' sx={sx.separator}>/</Typography>
            {isLast || !item.to ? (
              <Typography level='body-sm' sx={sx.current}>
                {item.label}
              </Typography>
            ) : (
              <Link
                component={RouterLink}
                to={item.to}
                underline='none'
                sx={sx.link}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </Box>
  )
}
