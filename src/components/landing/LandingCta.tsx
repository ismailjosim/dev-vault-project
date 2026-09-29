'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Copy, Sparkles, Terminal } from 'lucide-react'

export function LandingCta() {
	const [copied, setCopied] = useState(false)
	const installCmd = 'npm install -g devvault-cli'

	const handleCopy = async () => {
		await navigator.clipboard.writeText(installCmd)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<section className='relative overflow-hidden py-20 sm:py-28'>
			{/* Ambient background glow */}
			<div className='pointer-events-none absolute inset-0 -z-10 flex items-center justify-center'>
				<div className='from-primary/20 h-100 w-175 rounded-full bg-linear-to-tr via-indigo-500/15 to-pink-500/10 blur-3xl' />
			</div>

			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='border-border/60 from-card to-card/60 relative overflow-hidden rounded-3xl border bg-linear-to-b p-8 shadow-2xl sm:p-12 lg:p-16'>
					<div className='mx-auto max-w-2xl text-center'>
						<div className='border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold'>
							<Sparkles className='h-3.5 w-3.5' />
							<span>Zero-Friction Onboarding</span>
						</div>

						<h2 className='text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl'>
							Secure Your Secrets in Under 2 Minutes
						</h2>

						<p className='text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg'>
							Create an account, initialize your first project, and inject
							credentials directly into your development environment with zero
							leaked keys.
						</p>

						{/* Action Buttons */}
						<div className='mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row'>
							<Link
								href='/register'
								className='bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold shadow-lg transition-all hover:scale-105 sm:w-auto'
							>
								<span>Start Free Now</span>
								<ArrowRight className='h-4 w-4' />
							</Link>
							<Link
								href='/dashboard/tools/secret-share'
								className='border-border/80 bg-background/80 hover:bg-muted text-foreground flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-base font-semibold backdrop-blur-sm transition-all sm:w-auto'
							>
								<span>Try Ephemeral Share</span>
							</Link>
						</div>

						{/* Quick CLI Copy Box */}
						<div className='border-border/60 bg-muted/60 mx-auto mt-8 flex max-w-md items-center justify-between gap-3 rounded-xl border p-2 pl-4 font-mono text-xs backdrop-blur-sm'>
							<div className='text-foreground flex items-center gap-2 truncate'>
								<Terminal className='text-primary h-4 w-4 shrink-0' />
								<span className='truncate'>{installCmd}</span>
							</div>
							<button
								onClick={handleCopy}
								type='button'
								className='bg-background hover:bg-muted text-foreground border-border flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 font-sans font-medium transition-colors'
							>
								{copied ? (
									<>
										<Check className='h-3.5 w-3.5 text-emerald-500' />
										<span>Copied</span>
									</>
								) : (
									<>
										<Copy className='h-3.5 w-3.5' />
										<span>Copy</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
