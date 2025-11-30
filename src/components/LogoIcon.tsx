import { SvgIcon, type SvgIconProps } from '@mui/material'
import { LOGO_COLORS } from './logoData'

const LogoIcon = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 64 64">
    {/* Ball of Yarn */}
    <circle cx="32" cy="32" r="20" fill={LOGO_COLORS.YARN_COLOR} />
    {/* Knitting Needle */}
    <path
      d="M12 52 L50 14"
      stroke={LOGO_COLORS.NEEDLE_COLOR}
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="12" cy="52" r="5" fill={LOGO_COLORS.NEEDLE_COLOR} />
    {/* Crochet Hook */}
    <path d="M52 52 L14 14" stroke={LOGO_COLORS.HOOK_COLOR} strokeWidth="4" strokeLinecap="round" />
    <path
      d="M14 14 L10 10 C 6 6, 14 6, 18 10"
      stroke={LOGO_COLORS.HOOK_COLOR}
      strokeWidth="4"
      fill="none"
    />
  </SvgIcon>
)

export default LogoIcon
