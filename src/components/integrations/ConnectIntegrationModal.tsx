import { AlertCircle, Loader2 } from 'lucide-react'
import type { IntegrationProvider } from './types'

interface ConnectIntegrationModalProps {
	isOpen: boolean
	provider: IntegrationProvider
	name: string
	setName: (name: string) => void
	targetIdentifier: string
	setTargetIdentifier: (target: string) => void
	authToken: string
	setAuthToken: (token: string) => void
	isLoading: boolean
	error: string | null
	onClose: () => void
	onSubmit: (e: React.FormEvent) => void
}

export function ConnectIntegrationModal({
	isOpen,
	provider,
	name,
	setName,
	targetIdentifier,
	setTargetIdentifier,
	authToken,
	setAuthToken,
	isLoading,
	error,
	onClose,
	onSubmit,
}: ConnectIntegrationModalProps) {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'>
			<div className='border-border bg-card animate-in fade-in zoom-in-95 w-full max-w-md rounded-xl border p-6 shadow-2xl'>
				<h3 className='text-foreground text-lg font-semibold capitalize'>
					Connect {provider}
				</h3>
				<p className='text-muted-foreground mt-1 text-xs'>
					Provide connection credentials to automate secret synchronization.
				</p>

				{error && (
					<div className='border-destructive/20 bg-destructive/10 text-destructive mt-3 flex items-center gap-2 rounded-md border p-2.5 text-xs'>
						<AlertCircle className='h-4 w-4 shrink-0' />
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={onSubmit} className='mt-4 space-y-4'>
					<div>
						<label className='text-foreground block text-xs font-medium'>
							Integration Label
						</label>
						<input
							type='text'
							required
							value={name}
							onChange={(e) => setName(e.target.value)}
							className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
						/>
					</div>

					<div>
						<label className='text-foreground block text-xs font-medium'>
							{provider === 'vercel'
								? 'Vercel Project ID or Slug'
								: provider === 'github'
									? 'GitHub Repository (owner/repo)'
									: 'Webhook Destination URL'}
						</label>
						<input
							type='text'
							required
							value={targetIdentifier}
							onChange={(e) => setTargetIdentifier(e.target.value)}
							placeholder={
								provider === 'vercel'
									? 'prj_abc12345...'
									: provider === 'github'
										? 'acme-corp/api-server'
										: 'https://api.acme.com/webhooks/secrets'
							}
							className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
						/>
					</div>

					<div>
						<label className='text-foreground block text-xs font-medium'>
							{provider === 'webhook'
								? 'HMAC Signing Secret'
								: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API Token`}
						</label>
						<input
							type='password'
							required
							value={authToken}
							onChange={(e) => setAuthToken(e.target.value)}
							placeholder='••••••••••••••••'
							className='border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-md border px-3 py-2 text-sm focus:outline-none'
						/>
					</div>

					<div className='flex items-center justify-end gap-2 pt-2'>
						<button
							type='button'
							onClick={onClose}
							className='border-border text-muted-foreground hover:bg-muted rounded-md border px-3 py-2 text-xs font-medium'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isLoading || !name || !targetIdentifier || !authToken}
							className='bg-primary text-primary-foreground flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50'
						>
							{isLoading && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
							Save & Connect
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
