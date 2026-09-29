'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
	ArrowRight,
	Check,
	Copy,
	Flame,
	ShieldCheck,
	Sparkles,
} from 'lucide-react'

export function LandingHero() {
	const [activeTab, setActiveTab] = useState<'run' | 'pull' | 'share'>('run')
	const [copied, setCopied] = useState(false)

	const commands = {
		run: 'devvault run -- npm run dev',
		pull: 'devvault pull --env prod --format env > .env.local',
		share: 'devvault share --file id_rsa --ttl 1h --burn-on-read',
	}

	const handleCopy = async () => {
		await navigator.clipboard.writeText(commands[activeTab])
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<section className='relative overflow-hidden pt-12 pb-20 sm:pt-20 lg:pt-28'>
			{/* Ambient background glow */}
			<div className='from-primary/20 pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-175 -translate-x-1/2 rounded-full bg-linear-to-tr via-indigo-500/15 to-emerald-500/10 blur-3xl' />

			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='text-center'>
					{/* Badge */}
					<div className='border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold'>
						<ShieldCheck className='h-3.5 w-3.5' />
						<span>AES-256 GCM Zero-Knowledge Secret Management</span>
					</div>

					{/* Main Headline */}
					<h1 className='text-foreground mx-auto mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl'>
						Stop Committing Plaintext Secrets.{' '}
						<span className='from-primary bg-linear-to-r via-indigo-500 to-cyan-500 bg-clip-text text-transparent'>
							Inject Directly In-Memory.
						</span>
					</h1>

					{/* Subtitle */}
					<p className='text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg'>
						Centralize, version, and share environment variables across all your
						teams and environments. Eliminate leaky{' '}
						<code className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>
							.env
						</code>{' '}
						files with instant CLI process injection, 1-click rollback, and
						zero-knowledge ephemeral links.
					</p>

					{/* CTAs */}
					<div className='mt-8 flex flex-wrap items-center justify-center gap-4'>
						<Link
							href='/auth/signup'
							className='bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-md transition-all hover:scale-105'
						>
							<Sparkles className='h-4 w-4' />
							<span>Start Securing Free</span>
							<ArrowRight className='h-4 w-4' />
						</Link>

						<Link
							href='/dashboard/tools/secret-share'
							className='border-border bg-card text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold transition-all'
						>
							<Flame className='h-4 w-4 text-amber-500' />
							<span>Send Ephemeral Secret</span>
						</Link>
					</div>

					{/* Key highlights / Trust points */}
					<div className='text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-6 text-xs'>
						<div className='flex items-center gap-1.5'>
							<Check className='h-4 w-4 text-emerald-500' />
							<span>Zero Plaintext On Disk</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-4 w-4 text-emerald-500' />
							<span>AES-256 Field Encryption</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-4 w-4 text-emerald-500' />
							<span>1-Click Version Rollback</span>
						</div>
						<div className='flex items-center gap-1.5'>
							<Check className='h-4 w-4 text-emerald-500' />
							<span>Zero-Knowledge URL Hashes</span>
						</div>
					</div>
				</div>

				{/* Interactive Terminal Showcase Component */}
				<div id='cli' className='mx-auto mt-14 max-w-4xl'>
					<div className='border-border/80 overflow-hidden rounded-2xl border bg-neutral-950 text-neutral-100 shadow-2xl'>
						{/* Window Titlebar */}
						<div className='flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-4 py-3'>
							<div className='flex items-center gap-2'>
								<div className='h-3 w-3 rounded-full bg-rose-500/80' />
								<div className='h-3 w-3 rounded-full bg-amber-500/80' />
								<div className='h-3 w-3 rounded-full bg-emerald-500/80' />
								<span className='ml-2 font-mono text-xs text-neutral-400'>
									devvault-cli — in-memory runtime injection
								</span>
							</div>

							<div className='flex items-center gap-1.5'>
								<button
									type='button'
									onClick={() => setActiveTab('run')}
									className={`rounded px-2.5 py-1 font-mono text-xs transition ${
										activeTab === 'run'
											? 'bg-neutral-800 font-semibold text-neutral-100'
											: 'text-neutral-400 hover:text-neutral-200'
									}`}
								>
									run
								</button>
								<button
									type='button'
									onClick={() => setActiveTab('pull')}
									className={`rounded px-2.5 py-1 font-mono text-xs transition ${
										activeTab === 'pull'
											? 'bg-neutral-800 font-semibold text-neutral-100'
											: 'text-neutral-400 hover:text-neutral-200'
									}`}
								>
									pull
								</button>
								<button
									type='button'
									onClick={() => setActiveTab('share')}
									className={`rounded px-2.5 py-1 font-mono text-xs transition ${
										activeTab === 'share'
											? 'bg-neutral-800 font-semibold text-neutral-100'
											: 'text-neutral-400 hover:text-neutral-200'
									}`}
								>
									share
								</button>
							</div>
						</div>

						{/* Terminal Body */}
						<div className='space-y-3 p-6 font-mono text-xs leading-relaxed'>
							<div className='flex items-center justify-between text-neutral-400'>
								<div className='flex items-center gap-2'>
									<span className='text-emerald-400'>developer@macbook</span>
									<span>:</span>
									<span className='text-cyan-400'>~/projects/acme-api</span>
									<span>$</span>
									<span className='font-semibold text-white'>
										{commands[activeTab]}
									</span>
								</div>

								<button
									type='button'
									onClick={handleCopy}
									className='flex items-center gap-1 rounded bg-neutral-800/80 px-2 py-1 text-[11px] text-neutral-300 transition hover:bg-neutral-800 hover:text-white'
								>
									{copied ? (
										<>
											<Check className='h-3 w-3 text-emerald-400' />
											<span>Copied</span>
										</>
									) : (
										<>
											<Copy className='h-3 w-3' />
											<span>Copy</span>
										</>
									)}
								</button>
							</div>

							{activeTab === 'run' && (
								<div className='space-y-1 border-t border-neutral-800/60 pt-2 text-neutral-300'>
									<div className='font-medium text-emerald-400'>
										✔ Connected to DevVault project &apos;acme-api&apos;
										(environment: dev)
									</div>
									<div className='text-neutral-400'>
										✔ Decrypted 18 environment variables in 14ms (AES-256-GCM)
									</div>
									<div className='text-neutral-400'>
										✔ Dynamic variable references resolved (${`{DB_HOST}`}:$
										{`{DB_PORT}`})
									</div>
									<div className='text-neutral-400'>
										✔ Spawning child process: [npm run dev] with in-memory
										injection
									</div>
									<div className='pt-2 text-cyan-400'>
										&gt; acme-api@1.0.0 dev
									</div>
									<div className='text-neutral-300'>
										&gt; Ready in 842ms on http://localhost:3000 (Database
										Connected: mongodb+srv://cluster-prod...)
									</div>
								</div>
							)}

							{activeTab === 'pull' && (
								<div className='space-y-1 border-t border-neutral-800/60 pt-2 text-neutral-300'>
									<div className='font-medium text-emerald-400'>
										✔ Authenticated as dev@acme.com via Personal Access Token
									</div>
									<div className='text-neutral-400'>
										✔ Pulled 24 variables for Production environment
									</div>
									<div className='text-cyan-400'>
										✔ Formatted output into .env.local format
									</div>
									<div className='text-[11px] text-amber-400'>
										⚠ Warning: .env.local created on disk. Remember to add it to
										.gitignore!
									</div>
								</div>
							)}

							{activeTab === 'share' && (
								<div className='space-y-1 border-t border-neutral-800/60 pt-2 text-neutral-300'>
									<div className='font-medium text-emerald-400'>
										✔ Encrypted payload client-side with ephemeral 256-bit key
									</div>
									<div className='text-neutral-400'>
										✔ Ephemeral link created with 1-hour TTL and 1-view burn
										destruction
									</div>
									<div className='pt-1 font-bold break-all text-cyan-300'>
										https://devvault.app/share/sec_4a89f92c#f7b8c2d1e90a43b6...
									</div>
									<div className='text-[11px] text-neutral-500'>
										(The server does not know the decryption key. Only the URL
										recipient can decrypt it.)
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
