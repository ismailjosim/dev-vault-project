import { Terminal } from 'lucide-react'

export function CliQuickstartGuide() {
	return (
		<div className='border-border bg-card space-y-4 rounded-xl border p-6 shadow-sm'>
			<div className='flex items-center gap-2'>
				<Terminal className='h-5 w-5 text-emerald-500' />
				<h3 className='text-foreground text-base font-semibold'>
					DevVault CLI Quickstart
				</h3>
			</div>
			<p className='text-muted-foreground text-xs'>
				Streamline your local development workflow by injecting secrets straight
				into child processes in-memory without creating insecure plaintext files
				on disk.
			</p>

			<div className='grid gap-4 md:grid-cols-2'>
				<div className='border-border bg-muted/40 space-y-2 rounded-lg border p-3 font-mono text-xs'>
					<div className='text-muted-foreground text-[11px] font-semibold tracking-wider uppercase'>
						1. Authenticate CLI
					</div>
					<div className='text-foreground rounded bg-black/40 p-2'>
						devvault login --token &lt;YOUR_TOKEN&gt;
					</div>
				</div>

				<div className='border-border bg-muted/40 space-y-2 rounded-lg border p-3 font-mono text-xs'>
					<div className='text-muted-foreground text-[11px] font-semibold tracking-wider uppercase'>
						2. Link Project in Directory
					</div>
					<div className='text-foreground rounded bg-black/40 p-2'>
						devvault link --project &lt;slug&gt; --env dev
					</div>
				</div>

				<div className='border-border bg-muted/40 space-y-2 rounded-lg border p-3 font-mono text-xs'>
					<div className='text-muted-foreground text-[11px] font-semibold tracking-wider uppercase'>
						3. In-Memory Run Injection
					</div>
					<div className='rounded bg-black/40 p-2 text-emerald-400'>
						devvault run -- npm run dev
					</div>
				</div>

				<div className='border-border bg-muted/40 space-y-2 rounded-lg border p-3 font-mono text-xs'>
					<div className='text-muted-foreground text-[11px] font-semibold tracking-wider uppercase'>
						4. Pull Local .env File
					</div>
					<div className='text-foreground rounded bg-black/40 p-2'>
						devvault pull --format env
					</div>
				</div>
			</div>
		</div>
	)
}
