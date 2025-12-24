import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { exec as execCallback } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execCallback)

// --- Configuration ---
const PACKAGE_PATH = resolve(process.cwd(), 'package.json')
const LOCK_PATH = resolve(process.cwd(), 'package-lock.json')

const args = process.argv.slice(2)
const isFinishMode = args.includes('--finish')
const manualVersion = args.find(arg => !arg.startsWith('--'))

/**
 * Executes a shell command and returns output.
 */
async function runCommand(command) {
  try {
    const { stdout, stderr } = await exec(command)
    return stdout.trim()
  } catch (error) {
    console.error(`\n❌ Error executing: ${command}`)
    throw error
  }
}

/**
 * Logic to determine the version.
 */
function calculateVersion(currentVersion) {
  if (manualVersion) {
    console.log(`💡 Using CLI override version: **${manualVersion}**`)
    return manualVersion
  }

  if (isFinishMode) {
    console.log(`🏁 Finish mode: Using current version **${currentVersion}**`)
    return currentVersion
  }

  const parts = currentVersion.split('.').map(Number)
  if (parts.length < 3 || parts.some(isNaN)) {
    throw new Error(`Cannot parse version "${currentVersion}".`)
  }
  parts[2]++
  const newVersion = parts.join('.')
  console.log(`📈 Auto-incrementing: ${currentVersion} -> **${newVersion}**`)
  return newVersion
}

async function updateFiles(newVersion) {
  const packageData = JSON.parse(await readFile(PACKAGE_PATH, 'utf8'))
  packageData.version = newVersion
  await writeFile(PACKAGE_PATH, JSON.stringify(packageData, null, 2) + '\n')

  try {
    const lockData = JSON.parse(await readFile(LOCK_PATH, 'utf8'))
    lockData.version = newVersion
    if (lockData.packages?.['']) lockData.packages[''].version = newVersion
    await writeFile(LOCK_PATH, JSON.stringify(lockData, null, 2) + '\n')
  } catch (e) {
    // Lock file optional
  }
}

async function main() {
  try {
    // 1. Get current branch state
    const currentBranch = await runCommand('git rev-parse --abbrev-ref HEAD')
    const packageData = JSON.parse(await readFile(PACKAGE_PATH, 'utf8'))
    const currentVersion = packageData.version || '0.0.0'

    if (!isFinishMode) {
      // --- START FLOW ---
      
      // Safety Check: Only allow starting from 'main'
      if (currentBranch !== 'main') {
        console.error(`\n🚫 Error: You must be on the **main** branch to start a release.`)
        console.error(`Currently on: ${currentBranch}`)
        process.exit(1)
      }

      const targetVersion = calculateVersion(currentVersion)
      console.log('🚀 Starting new development branch...')
      
      await updateFiles(targetVersion)
      
      const branchName = `release/v${targetVersion}`
      await runCommand(`git checkout -b ${branchName}`)
      await runCommand(`git add package.json package-lock.json`)
      await runCommand(`git commit -m "chore: start release ${targetVersion}"`)
      
      console.log(`\n✅ Successfully created branch **${branchName}** from main.`)

    } else {
      // --- FINISH FLOW ---
      const targetVersion = calculateVersion(currentVersion)
      console.log('🏗️ Finishing release build...')
      
      // Ensure we are actually on a release branch
      if (!currentBranch.startsWith('release/v')) {
        console.warn(`⚠️ Warning: You are finishing a release while on "${currentBranch}". Usually, this is done on a release branch.`)
      }

      await updateFiles(targetVersion)
      
      console.log('--- Running Build ---')
      await runCommand('npm run build')
      
      const tagName = `v${targetVersion}`
      await runCommand(`git add .`)
      await runCommand(`git commit -m "chore: final release build ${tagName}" --allow-empty`)
      await runCommand(`git tag ${tagName}`)
      
      console.log(`\n✅ Build completed and tagged as **${tagName}**!`)
    }
  } catch (error) {
    console.error(`\n❌ Script failed:`, error.message)
    process.exit(1)
  }
}

main()