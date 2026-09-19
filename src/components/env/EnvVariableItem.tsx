'use client'

import { ExpiryBadge } from '@/components/env/ExpiryBadge'
import { SecretHistoryModal } from '@/components/env/SecretHistoryModal'
import {
	Clipboard,
	Copy,
	Eye,
	EyeOff,
	FileCode2,
	History,
	Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export type EnvVariableSummary = {
	_id: string
	key: string
	value: string | null
	type: string
	isPublic: boolean
	note: string
	environment: string
	expiryDate?: string | null
	updatedAt: string
}

export function EnvVariableItem({
	projectId,
	variable,
}: {
	projectId: string
	variable: EnvVariableSummary
}) {
	const router = useRouter()
	const [copied, setCopied] = useState<string | null>(null)
	const [revealedValue, setRevealedValue] = useState<string | null>(null)
	const [isRevealing, setIsRevealing] = useState(false)
	const [isHistoryOpen, setIsHistoryOpen] = useState(false)

	async function getDecryptedValue() {
		const response = await fetch(`/api/projects/${projectId}/env?reveal=true`)
		const payload = (await response.json()) as {
			variables: EnvVariableSummary[]
		}
		const current = payload.variables.find((item) => item._id === variable._id)

		return current?.value || ''
	}

	async function copyValue(format: 'key' | 'value' | 'pair') {
		const value = await getDecryptedValue()
		const text =
			format === 'key'
				? variable.key
				: format === 'pair'
					? `${variable.key}=${value}`
					: value

		await navigator.clipboard.writeText(text)
		setCopied(format)

		// Audit log secret copy event
		void fetch('/api/audit/log', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				action: 'SECRET_COPY',
				projectId,
				targetKey: variable.key,
				environment: variable.environment,
				metadata: { format },
			}),
		})

		window.setTimeout(() => {
			navigator.clipboard.writeText('')
			setCopied(null)
		}, 30000)
	}

	async function toggleReveal() {
		if (revealedValue !== null) {
			setRevealedValue(null)
			return
		}

		setIsRevealing(true)
		setRevealedValue(await getDecryptedValue())
		setIsRevealing(false)

		// Audit log secret reveal event
		void fetch('/api/audit/log', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				action: 'SECRET_REVEAL',
				projectId,
				targetKey: variable.key,
				environment: variable.environment,
			}),
		})
	}

	async function deleteVariable() {
		if (!window.confirm(`Delete variable ${variable.key}?`)) return

		await fetch(`/api/projects/${projectId}/env/${variable._id}`, {
			method: 'DELETE',
		})
		router.refresh()
	}

	return (
		<>
			<tr className='border-border border-t'>
				<td className='text-foreground px-3 py-3 font-mono text-sm'>
					{variable.key}
				</td>
				<td className='text-muted-foreground max-w-55 truncate px-3 py-3 font-mono text-sm'>
					{revealedValue ?? '••••••••'}
				</td>
				<td className='px-3 py-3'>
					<span className='bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs'>
						{variable.type}
					</span>
				</td>
				<td className='text-muted-foreground px-3 py-3 text-sm'>
					{variable.environment}
				</td>
				<td className='text-muted-foreground px-3 py-3 text-sm'>
					<div className='flex flex-col gap-1'>
						<ExpiryBadge expiryDate={variable.expiryDate} />
						{variable.note && <span>{variable.note}</span>}
					</div>
				</td>
				<td className='px-3 py-3 text-right'>
					<div className='flex justify-end gap-2'>
						<IconAction
							label={revealedValue === null ? 'Reveal value' : 'Hide value'}
							onClick={toggleReveal}
							disabled={isRevealing}
						>
							{revealedValue === null ? (
								<Eye className='h-4 w-4' />
							) : (
								<EyeOff className='h-4 w-4' />
							)}
						</IconAction>
						<IconAction
							label='Version history & rollback'
							onClick={() => setIsHistoryOpen(true)}
						>
							<History className='h-4 w-4' />
						</IconAction>
						<IconAction
							label={copied === 'key' ? 'Copied key' : 'Copy key'}
							onClick={() => copyValue('key')}
						>
							<Clipboard className='h-4 w-4' />
						</IconAction>
						<IconAction
							label={copied === 'value' ? 'Copied value' : 'Copy value'}
							onClick={() => copyValue('value')}
						>
							<Copy className='h-4 w-4' />
						</IconAction>
						<IconAction
							label={copied === 'pair' ? 'Copied KEY=VALUE' : 'Copy KEY=VALUE'}
							onClick={() => copyValue('pair')}
						>
							<FileCode2 className='h-4 w-4' />
						</IconAction>
						<IconAction
							label='Delete variable'
							onClick={deleteVariable}
							tone='danger'
						>
							<Trash2 className='h-4 w-4' />
						</IconAction>
					</div>
				</td>
			</tr>

			<SecretHistoryModal
				projectId={projectId}
				variableId={variable._id}
				variableKey={variable.key}
				environment={variable.environment}
				isOpen={isHistoryOpen}
				onClose={() => setIsHistoryOpen(false)}
			/>
		</>
	)
}

function IconAction({
	children,
	label,
	onClick,
	tone = 'default',
	disabled = false,
}: {
	children: React.ReactNode
	label: string
	onClick: () => void
	tone?: 'default' | 'danger'
	disabled?: boolean
}) {
	return (
		<button
			type='button'
			onClick={onClick}
			disabled={disabled}
			title={label}
			aria-label={label}
			className={`inline-flex h-8 w-8 items-center justify-center rounded-md border transition ${
				tone === 'danger'
					? 'border-danger/30 text-danger hover:bg-danger-foreground'
					: 'border-border text-muted-foreground hover:bg-hover hover:text-foreground'
			} disabled:cursor-not-allowed disabled:opacity-50`}
		>
			{children}
		</button>
	)
}
