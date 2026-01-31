const YARN_COLOR = '#5fadedff' // LightPink
const NEEDLE_COLOR = '#cd3f3fff' // Peru
const HOOK_COLOR = '#4cd62dff' // LightSeaGreen

const encodeColor = (color: string) => color.toUpperCase().replace('#', '%23')

const ENCODED_YARN_COLOR = encodeColor(YARN_COLOR)
const ENCODED_NEEDLE_COLOR = encodeColor(NEEDLE_COLOR)
const ENCODED_HOOK_COLOR = encodeColor(HOOK_COLOR)

export const LOGO_SVG_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="${ENCODED_YARN_COLOR}" /><path d="M12 52 L50 14" stroke="${ENCODED_NEEDLE_COLOR}" stroke-width="4" stroke-linecap="round" /><circle cx="12" cy="52" r="5" fill="${ENCODED_NEEDLE_COLOR}" /><path d="M52 52 L14 14" stroke="${ENCODED_HOOK_COLOR}" stroke-width="4" stroke-linecap="round" /><path d="M14 14 L10 10 C 6 6, 14 6, 18 10" stroke="${ENCODED_HOOK_COLOR}" stroke-width="4" fill="none" /></svg>`

export const LOGO_COLORS = { YARN_COLOR, NEEDLE_COLOR, HOOK_COLOR }
