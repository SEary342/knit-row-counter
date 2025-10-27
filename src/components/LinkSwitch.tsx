import React from 'react'
import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import { IconButton } from '@mui/material'

interface LinkSwitchProps {
  onClick?: (checked: boolean) => void
}

const LinkSwitch = ({ onClick }: LinkSwitchProps) => {
  const [checked, setChecked] = React.useState(false)

  const handleClick = () => {
    setChecked(!checked)
    onClick?.(checked)
  }

  return (
    <IconButton onClick={handleClick}>
      {checked ? <LinkIcon fontSize="small" color="success" /> : <LinkOffIcon fontSize="small" />}
    </IconButton>
  )
}

export default LinkSwitch
