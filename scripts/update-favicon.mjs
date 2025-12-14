import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..') // Go up one level from scripts

const logoDataPath = path.join(rootDir, 'src', 'components', 'logoData.ts')
const indexPath = path.join(rootDir, 'index.html') // Correctly locate index.html at the root

try {
  // 1. Read the logoData.ts file
  const logoDataContent = fs.readFileSync(logoDataPath, 'utf-8')

  // 2. Extract color constants from the file
  const getColor = (colorName) => {
    const regex = new RegExp(`const ${colorName} = '([^']*)'`)
    const match = logoDataContent.match(regex)
    if (!match || !match[1]) {
      throw new Error(`Could not find ${colorName} in logoData.ts`)
    }
    return match[1]
  }

  const YARN_COLOR = getColor('YARN_COLOR')
  const NEEDLE_COLOR = getColor('NEEDLE_COLOR')
  const HOOK_COLOR = getColor('HOOK_COLOR')

  // 3. Replicate the encoding and string interpolation logic
  const encodeColor = (color) => color.toUpperCase().replace('#', '%23')

  const ENCODED_YARN_COLOR = encodeColor(YARN_COLOR)
  const ENCODED_NEEDLE_COLOR = encodeColor(NEEDLE_COLOR)
  const ENCODED_HOOK_COLOR = encodeColor(HOOK_COLOR)

  const svgContent = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><circle cx='32' cy='32' r='20' fill='${ENCODED_YARN_COLOR}' /><path d='M12 52 L50 14' stroke='${ENCODED_NEEDLE_COLOR}' stroke-width='4' stroke-linecap='round' /><circle cx='12' cy='52' r='5' fill='${ENCODED_NEEDLE_COLOR}' /><path d='M52 52 L14 14' stroke='${ENCODED_HOOK_COLOR}' stroke-width='4' stroke-linecap='round' /><path d='M14 14 L10 10 C 6 6, 14 6, 18 10' stroke='${ENCODED_HOOK_COLOR}' stroke-width='4' fill='none' /></svg>`

  const svgUrl = `data:image/svg+xml;utf8,${svgContent}`

  // 3. Read the index.html file
  let indexContent = fs.readFileSync(indexPath, 'utf-8')

  // 4. Replace the href attribute of the favicon link
  const updatedIndexContent = indexContent.replace(
    /(<link\s+rel="icon"\s+href=")[^"]*(")/,
    `$1${svgUrl}$2`,
  )

  // 5. Write the updated content back to index.html
  fs.writeFileSync(indexPath, updatedIndexContent, 'utf-8')

  console.log('✅ Successfully updated favicon in index.html!')
} catch (error) {
  console.error('❌ Failed to update favicon:', error)
  process.exit(1)
}