import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import { IconButton } from '@mui/material'

interface LinkSwitchProps {
  onClick?: () => void
  checked: boolean
}

const LinkSwitch = ({ onClick, checked }: LinkSwitchProps) => {
  return (
    <IconButton onClick={onClick}>
      {checked ? <LinkIcon fontSize="small" color="success" /> : <LinkOffIcon fontSize="small" />}
    </IconButton>
  )
}

export default LinkSwitch
