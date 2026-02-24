import AccountCircle from '@mui/icons-material/AccountCircle'
import LoginIcon from '@mui/icons-material/Login'
import { Button, Menu, MenuItem } from '@mui/material'
import React from 'react'

import { isAuthEnabled } from '@src/utils'

export default function LoginControl() {
  // Stub: Replace with actual selector later
  // const user = { firstName: 'Test', lastName: 'User' }
  const user: { firstName: string; lastName: string } | null = null

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  if (!isAuthEnabled) {
    return null
  }

  if (!user) {
    return (
      <Button color="inherit" href="/auth/login" startIcon={<LoginIcon />}>
        Login
      </Button>
    )
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Button color="inherit" onClick={handleMenu} startIcon={<AccountCircle />}>
        {user.firstName} {user.lastName}
      </Button>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </>
  )
}
