'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, ArrowRight, Menu, X, Flame, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { useSession } from '@/lib/auth-client'

export function LandingNavbar() {
	const { data: session } = useSession()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<header className='border-border/60 bg-background/85 sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors'>
			<div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
				{/* Brand Logo */}
				<Link href='/' className='group flex items-center gap-2.5'>
					<div className='bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-transform group-hover:scale-105'>
						<Shield className='h-5 w-5' />
					</div>
					<div className='flex flex-col'>
						<span className='text-foreground text-base font-bold tracking-tight'>
							DevVault
						</span>
						<span className='text-muted-foreground -mt-1 text-[10px] font-medium'>
							Secrets & Env Manager
						</span>
					</div>
				</Link>

				{/* Desktop Nav Links */}
				<nav className='hidden items-center gap-6 md:flex'>
					<a
						href='#features'
						className='text-muted-foreground hover:text-foreground text-sm font-medium transition-colors'
					>
						Features
					</a>
					<a
						href='#cli'
						className='text-muted-foreground hover:text-foreground text-sm font-medium transition-colors'
					>
						Developer CLI
					</a>
					<a
						href='#security'
						className='text-muted-foreground hover:text-foreground text-sm font-medium transition-colors'
					>
						Security Architecture
					</a>
					<a
						href='#comparison'
						className='text-muted-foreground hover:text-foreground text-sm font-medium transition-colors'
					>
						Comparison
					</a>
					<Link
						href='/dashboard/tools/secret-share'
						className='text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium transition-colors'
					>
						<Flame className='h-3.5 w-3.5 text-amber-500' />
						<span>Share Secret</span>
					</Link>
				</nav>

				{/* Right Side Actions */}
				<div className='hidden items-center gap-3 md:flex'>
					<ThemeToggle />
					{session?.user ? (
						<Link
							href='/dashboard'
							className='bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-90'
						>
							<span>Go to Dashboard</span>
							<ArrowRight className='h-4 w-4' />
						</Link>
					) : (
						<>
							<Link
								href='/auth/login'
								className='border-border text-foreground hover:bg-muted inline-flex items-center rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors'
							>
								Sign In
							</Link>
							<Link
								href='/auth/signup'
								className='bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm hover:opacity-90'
							>
								<Sparkles className='h-3.5 w-3.5' />
								<span>Get Started Free</span>
							</Link>
						</>
					)}
				</div>

				{/* Mobile Menu Button */}
				<div className='flex items-center gap-2 md:hidden'>
					<ThemeToggle />
					<button
						type='button'
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className='text-muted-foreground hover:text-foreground rounded-lg p-2'
						aria-label='Toggle Menu'
					>
						{mobileMenuOpen ? (
							<X className='h-5 w-5' />
						) : (
							<Menu className='h-5 w-5' />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Dropdown */}
			{mobileMenuOpen && (
				<div className='border-border bg-card border-b px-4 py-4 md:hidden'>
					<nav className='flex flex-col gap-3'>
						<a
							href='#features'
							onClick={() => setMobileMenuOpen(false)}
							className='text-muted-foreground hover:text-foreground text-sm font-medium'
						>
							Features
						</a>
						<a
							href='#cli'
							onClick={() => setMobileMenuOpen(false)}
							className='text-muted-foreground hover:text-foreground text-sm font-medium'
						>
							Developer CLI
						</a>
						<a
							href='#security'
							onClick={() => setMobileMenuOpen(false)}
							className='text-muted-foreground hover:text-foreground text-sm font-medium'
						>
							Security Architecture
						</a>
						<a
							href='#comparison'
							onClick={() => setMobileMenuOpen(false)}
							className='text-muted-foreground hover:text-foreground text-sm font-medium'
						>
							Comparison
						</a>
						<Link
							href='/dashboard/tools/secret-share'
							onClick={() => setMobileMenuOpen(false)}
							className='text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm font-medium'
						>
							<Flame className='h-4 w-4 text-amber-500' />
							<span>Ephemeral Secret Share</span>
						</Link>

						<div className='border-border mt-2 border-t pt-3'>
							{session?.user ? (
								<Link
									href='/dashboard'
									className='bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold'
								>
									<span>Dashboard</span>
									<ArrowRight className='h-4 w-4' />
								</Link>
							) : (
								<div className='grid grid-cols-2 gap-2'>
									<Link
										href='/auth/login'
										className='border-border text-foreground hover:bg-muted flex items-center justify-center rounded-lg border py-2 text-sm font-medium'
									>
										Sign In
									</Link>
									<Link
										href='/auth/signup'
										className='bg-primary text-primary-foreground flex items-center justify-center rounded-lg py-2 text-sm font-semibold'
									>
										Sign Up
									</Link>
								</div>
							)}
						</div>
					</nav>
				</div>
			)}
		</header>
	)
}
