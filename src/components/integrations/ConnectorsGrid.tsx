import { Globe, Plus, Webhook } from 'lucide-react'
import type { IntegrationProvider } from './types'

export function GithubIcon({ className = 'h-4 w-4' }: { className?: string }) {
	return (
		<svg className={className} fill='currentColor' viewBox='0 0 24 24'>
			<path
				fillRule='evenodd'
				clipRule='evenodd'
				d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
			/>
		</svg>
	)
}

interface ConnectorsGridProps {
	onConnect: (provider: IntegrationProvider) => void
}

export function ConnectorsGrid({ onConnect }: ConnectorsGridProps) {
	return (
		<div>
			<h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
				Available Connectors
			</h3>
			<p className='text-muted-foreground mt-1 text-xs'>
				Push secrets directly into third-party CI/CD platforms and hosting
				providers.
			</p>

			<div className='mt-4 grid gap-4 sm:grid-cols-3'>
				<div className='border-border bg-card hover:border-muted-foreground flex flex-col justify-between rounded-xl border p-5 shadow-sm transition'>
					<div>
						<div className='text-foreground flex items-center gap-2 font-semibold'>
							<Globe className='h-5 w-5 text-indigo-500' />
							<span>Vercel</span>
						</div>
						<p className='text-muted-foreground mt-2 text-xs'>
							Automatically sync project secrets to Vercel Production and
							Preview environments.
						</p>
					</div>
					<button
						type='button'
						onClick={() => onConnect('vercel')}
						className='bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-4 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold'
					>
						<Plus className='h-3.5 w-3.5' />
						Connect Vercel
					</button>
				</div>

				<div className='border-border bg-card hover:border-muted-foreground flex flex-col justify-between rounded-xl border p-5 shadow-sm transition'>
					<div>
						<div className='text-foreground flex items-center gap-2 font-semibold'>
							<GithubIcon className='h-5 w-5 text-neutral-800 dark:text-neutral-200' />
							<span>GitHub Actions</span>
						</div>
						<p className='text-muted-foreground mt-2 text-xs'>
							Push encrypted secrets directly to repository secrets for
							automated CI/CD runs.
						</p>
					</div>
					<button
						type='button'
						onClick={() => onConnect('github')}
						className='bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-4 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold'
					>
						<Plus className='h-3.5 w-3.5' />
						Connect GitHub
					</button>
				</div>

				<div className='border-border bg-card hover:border-muted-foreground flex flex-col justify-between rounded-xl border p-5 shadow-sm transition'>
					<div>
						<div className='text-foreground flex items-center gap-2 font-semibold'>
							<Webhook className='h-5 w-5 text-emerald-500' />
							<span>Custom Webhook</span>
						</div>
						<p className='text-muted-foreground mt-2 text-xs'>
							Send HMAC-signed HTTP notifications to custom webhook endpoints on
							secret updates.
						</p>
					</div>
					<button
						type='button'
						onClick={() => onConnect('webhook')}
						className='bg-secondary text-secondary-foreground hover:bg-secondary/80 mt-4 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold'
					>
						<Plus className='h-3.5 w-3.5' />
						Configure Webhook
					</button>
				</div>
			</div>
		</div>
	)
}
