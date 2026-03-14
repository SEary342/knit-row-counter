import AccountCircle from '@mui/icons-material/AccountCircle'
import LoginIcon from '@mui/icons-material/Login'
import { Button, Menu, MenuItem } from '@mui/material'
import React from 'react'

import { useActiveUserAuthUserGetQuery } from '@src/store/openApi'
import { isAuthEnabled } from '@src/utils'

export default function LoginControl() {
  const { data } = useActiveUserAuthUserGetQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  if (!isAuthEnabled) return null

  const loggedIn = !!data?.id
  const username = data?.display_name || data?.username || data?.email

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  // THE FIX: Direct window navigation
  const handleLogout = () => {
    window.location.href = '/auth/logout'
  }

  if (!loggedIn) {
    return (
      <Button color="inherit" href="/auth/login" startIcon={<LoginIcon />}>
        Login
      </Button>
    )
  }

  return (
    <>
      <Button color="inherit" onClick={handleMenu} startIcon={<AccountCircle />}>
        {username || 'Logged In'}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </>
  )
}
