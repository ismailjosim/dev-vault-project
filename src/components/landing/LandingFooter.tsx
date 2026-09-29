import Link from 'next/link'
import { Shield } from 'lucide-react'

export function LandingFooter() {
	return (
		<footer className='border-border/60 bg-muted/20 border-t py-12 sm:py-16'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
					{/* Col 1: Brand */}
					<div className='md:col-span-2'>
						<Link href='/' className='inline-flex items-center gap-2.5'>
							<div className='bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl shadow-sm'>
								<Shield className='h-5 w-5' />
							</div>
							<div className='flex flex-col'>
								<span className='text-foreground text-base font-bold tracking-tight'>
									DevVault
								</span>
								<span className='text-muted-foreground -mt-1 text-[10px] font-medium'>
									Zero-Knowledge Secrets Manager
								</span>
							</div>
						</Link>
						<p className='text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed'>
							End-to-end encrypted secret and environment variable platform
							built for modern development workflows, CI/CD pipelines, and
							secure team collaboration.
						</p>
					</div>

					{/* Col 2: Navigation */}
					<div>
						<h4 className='text-foreground text-sm font-semibold'>Product</h4>
						<ul className='mt-4 space-y-2.5 text-sm'>
							<li>
								<a
									href='#features'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Features
								</a>
							</li>
							<li>
								<a
									href='#cli'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Developer CLI
								</a>
							</li>
							<li>
								<a
									href='#security'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Security Specs
								</a>
							</li>
							<li>
								<a
									href='#comparison'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Comparison
								</a>
							</li>
						</ul>
					</div>

					{/* Col 3: Tools & Resources */}
					<div>
						<h4 className='text-foreground text-sm font-semibold'>Tools</h4>
						<ul className='mt-4 space-y-2.5 text-sm'>
							<li>
								<Link
									href='/dashboard/tools/secret-share'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Ephemeral Secret Share
								</Link>
							</li>
							<li>
								<Link
									href='/dashboard/tools/api-keys'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									CLI API Keys
								</Link>
							</li>
							<li>
								<Link
									href='/dashboard/tools/check-missing'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Missing Keys Checker
								</Link>
							</li>
							<li>
								<Link
									href='/login'
									className='text-muted-foreground hover:text-foreground transition-colors'
								>
									Sign In / Dashboard
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom sub-footer */}
				<div className='border-border/40 mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row'>
					<p className='text-muted-foreground text-xs'>
						&copy; {new Date().getFullYear()} DevVault. Engineered for developer
						security.
					</p>
					<div className='text-muted-foreground flex items-center gap-1 text-xs'>
						<span>Built with Next.js 15, Tailwind, &amp; AES-256</span>
					</div>
				</div>
			</div>
		</footer>
	)
}
