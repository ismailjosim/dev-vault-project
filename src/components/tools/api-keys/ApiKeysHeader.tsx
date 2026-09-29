import { Plus } from 'lucide-react'

interface ApiKeysHeaderProps {
	onOpenCreateModal: () => void
}

export function ApiKeysHeader({ onOpenCreateModal }: ApiKeysHeaderProps) {
	return (
		<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
			<div>
				<h2 className='text-foreground text-lg font-semibold'>
					Personal Access Tokens (PAT)
				</h2>
				<p className='text-muted-foreground text-sm'>
					Authenticate the DevVault CLI, CI/CD pipelines, and local dev
					environments without plaintext .env files.
				</p>
			</div>
			<button
				type='button'
				onClick={onOpenCreateModal}
				className='bg-primary text-primary-foreground flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90'
			>
				<Plus className='h-4 w-4' />
				Generate New Token
			</button>
		</div>
	)
}
