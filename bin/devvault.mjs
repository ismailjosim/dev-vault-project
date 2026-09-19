#!/usr/bin/env node

/**
 * DevVault CLI - Developer Secret Injection & Environment Sync
 */

import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

const CONFIG_DIR = path.join(os.homedir(), '.devvault')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')
const PROJECT_CONFIG_FILE = path.join(process.cwd(), '.devvault.json')
const DEFAULT_API_URL = process.env.DEVVAULT_API_URL || 'http://localhost:3000'

function loadGlobalConfig() {
	try {
		if (fs.existsSync(CONFIG_FILE)) {
			return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
		}
	} catch {
		// Ignore corrupted config
	}
	return {}
}

function saveGlobalConfig(data) {
	if (!fs.existsSync(CONFIG_DIR)) {
		fs.mkdirSync(CONFIG_DIR, { recursive: true })
	}
	fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8')
}

function loadProjectConfig() {
	try {
		if (fs.existsSync(PROJECT_CONFIG_FILE)) {
			return JSON.parse(fs.readFileSync(PROJECT_CONFIG_FILE, 'utf8'))
		}
	} catch {
		// Ignore
	}
	return {}
}

function saveProjectConfig(data) {
	fs.writeFileSync(PROJECT_CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8')
}

async function fetchSecrets({
	apiUrl,
	token,
	projectId,
	projectSlug,
	environment,
}) {
	const url = new URL('/api/cli/secrets', apiUrl)
	if (projectId) url.searchParams.set('projectId', projectId)
	if (projectSlug) url.searchParams.set('slug', projectSlug)
	url.searchParams.set('environment', environment || 'dev')

	const res = await fetch(url.toString(), {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	if (!res.ok) {
		const err = await res.json().catch(() => ({}))
		throw new Error(err.error || `HTTP error ${res.status}: ${res.statusText}`)
	}

	return res.json()
}

function printHelp() {
	console.log(`
🔐 DevVault CLI - In-Memory Secret Injection & Sync

USAGE:
  devvault <command> [options]

COMMANDS:
  login              Authenticate CLI with a Personal Access Token (PAT)
  link               Link current directory to a DevVault project
  run -- <command>   Fetch secrets and inject directly into child process
  pull               Download decrypted secrets into local .env file
  help               Display this help message

OPTIONS:
  --project <id/slug>  Project identifier or slug
  --env <environment>  Environment (dev, staging, prod, test). Default: dev
  --token <token>      DevVault API token (or set DEVVAULT_TOKEN)
  --url <url>          DevVault server URL (default: http://localhost:3000)
  --format <format>    Export format for 'pull' (env, json). Default: env

EXAMPLES:
  $ devvault login --token dv_live_abc123...
  $ devvault link --project my-web-app --env dev
  $ devvault run -- npm run dev
  $ devvault run -- pnpm dev
  $ devvault pull --format env
`)
}

async function main() {
	const args = process.argv.slice(2)
	const command = args[0]

	if (
		!command ||
		command === 'help' ||
		command === '--help' ||
		command === '-h'
	) {
		printHelp()
		process.exit(0)
	}

	const globalConfig = loadGlobalConfig()
	const projectConfig = loadProjectConfig()

	// Parse flags
	let token = process.env.DEVVAULT_TOKEN || globalConfig.token
	let apiUrl =
		process.env.DEVVAULT_API_URL || globalConfig.apiUrl || DEFAULT_API_URL
	let projectId = projectConfig.projectId
	let projectSlug = projectConfig.slug
	let environment = projectConfig.environment || 'dev'
	let format = 'env'

	for (let i = 1; i < args.length; i++) {
		const arg = args[i]
		if (arg === '--token' && args[i + 1]) token = args[++i]
		else if (arg === '--url' && args[i + 1]) apiUrl = args[++i]
		else if (arg === '--project' && args[i + 1]) {
			const val = args[++i]
			if (val.length === 24 && /^[0-9a-fA-F]+$/.test(val)) {
				projectId = val
			} else {
				projectSlug = val
			}
		} else if (arg === '--env' && args[i + 1]) environment = args[++i]
		else if (arg === '--format' && args[i + 1]) format = args[++i]
	}

	switch (command) {
		case 'login': {
			if (!token) {
				console.error(
					'❌ Please provide a token: devvault login --token <dv_live_...>',
				)
				process.exit(1)
			}
			saveGlobalConfig({ token, apiUrl })
			console.log(
				`✅ DevVault authenticated successfully! Config saved to ${CONFIG_FILE}`,
			)
			break
		}

		case 'link': {
			if (!projectId && !projectSlug) {
				console.error(
					'❌ Please specify a project: devvault link --project <slug_or_id>',
				)
				process.exit(1)
			}
			saveProjectConfig({
				projectId: projectId || null,
				slug: projectSlug || null,
				environment,
			})
			console.log(
				`✅ Linked directory to DevVault project (${projectSlug || projectId}) [${environment}]`,
			)

			// Safeguard .gitignore
			const gitignorePath = path.join(process.cwd(), '.gitignore')
			if (fs.existsSync(gitignorePath)) {
				const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
				if (!gitignoreContent.includes('.devvault.json')) {
					fs.appendFileSync(
						gitignorePath,
						'\n# DevVault\n.devvault.json\n.devvault/\n.env*\n',
					)
					console.log(
						'🔒 Appended .devvault.json and .env* safeguards to .gitignore',
					)
				}
			}
			break
		}

		case 'run': {
			const doubleDashIndex = args.indexOf('--')
			if (doubleDashIndex === -1 || doubleDashIndex === args.length - 1) {
				console.error(
					'❌ Specify command after -- separator (e.g. devvault run -- npm run dev)',
				)
				process.exit(1)
			}

			if (!token) {
				console.error(
					'❌ No API token configured. Run "devvault login" or pass --token <token>',
				)
				process.exit(1)
			}

			if (!projectId && !projectSlug) {
				console.error(
					'❌ Directory not linked. Run "devvault link --project <slug>" or pass --project',
				)
				process.exit(1)
			}

			const commandToRun = args.slice(doubleDashIndex + 1)
			console.log(
				`⚡ DevVault: Fetching secrets for ${projectSlug || projectId} (${environment})...`,
			)

			try {
				const result = await fetchSecrets({
					apiUrl,
					token,
					projectId,
					projectSlug,
					environment,
				})

				const secrets = result.secrets || {}
				const count = Object.keys(secrets).length
				console.log(
					`🔑 Injected ${count} secrets into process memory. Starting execution...`,
				)

				const childEnv = { ...process.env, ...secrets }
				const proc = spawn(commandToRun[0], commandToRun.slice(1), {
					env: childEnv,
					stdio: 'inherit',
					shell: true,
				})

				proc.on('exit', (code, signal) => {
					if (signal) {
						process.kill(process.pid, signal)
					} else {
						process.exit(code || 0)
					}
				})
			} catch (err) {
				console.error(`❌ Failed to inject secrets: ${err.message}`)
				process.exit(1)
			}
			break
		}

		case 'pull': {
			if (!token) {
				console.error(
					'❌ No API token configured. Run "devvault login" or pass --token <token>',
				)
				process.exit(1)
			}
			if (!projectId && !projectSlug) {
				console.error(
					'❌ Directory not linked. Run "devvault link --project <slug>" or pass --project',
				)
				process.exit(1)
			}

			console.log(
				`📥 Pulling secrets for ${projectSlug || projectId} (${environment})...`,
			)
			try {
				const result = await fetchSecrets({
					apiUrl,
					token,
					projectId,
					projectSlug,
					environment,
				})

				const secrets = result.secrets || {}
				const outFilename = format === 'json' ? '.env.json' : '.env'
				const outPath = path.join(process.cwd(), outFilename)

				if (format === 'json') {
					fs.writeFileSync(outPath, JSON.stringify(secrets, null, 2), {
						mode: 0o600,
					})
				} else {
					const content = Object.entries(secrets)
						.map(
							([k, v]) =>
								`${k}=${v.includes(' ') || v.includes('\n') ? `"${v.replace(/"/g, '\\"')}"` : v}`,
						)
						.join('\n')
					fs.writeFileSync(outPath, content + '\n', { mode: 0o600 })
				}

				console.log(
					`✅ Saved ${Object.keys(secrets).length} secrets to ${outFilename} with restricted permissions (0600)`,
				)
			} catch (err) {
				console.error(`❌ Failed to pull secrets: ${err.message}`)
				process.exit(1)
			}
			break
		}

		default:
			console.error(`❌ Unknown command: ${command}`)
			printHelp()
			process.exit(1)
	}
}

main().catch((err) => {
	console.error('Fatal CLI error:', err)
	process.exit(1)
})
