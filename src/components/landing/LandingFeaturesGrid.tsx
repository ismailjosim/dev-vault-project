import {
	Shield,
	History,
	Flame,
	Variable,
	Terminal,
	AlertTriangle,
	CheckCircle2,
	Lock,
	ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'

interface FeatureCardProps {
	icon: React.ReactNode
	badge: string
	title: string
	description: string
	codeSnippet?: string
	highlights: string[]
}

const features: FeatureCardProps[] = [
	{
		icon: <Lock className='text-primary h-6 w-6' />,
		badge: 'Zero-Knowledge At Rest',
		title: 'Authenticated AES-256 GCM Encryption',
		description:
			'All secrets, values, and environment variables are encrypted at rest with industry-standard AES-256 GCM. Each record gets a unique cryptographically secure initialization vector (IV) and authentication tag.',
		highlights: [
			'Cryptographic integrity verification',
			'Per-record unique random IVs',
			'Encrypted in-transit & at rest',
		],
	},
	{
		icon: <History className='h-6 w-6 text-indigo-500' />,
		badge: 'Point-In-Time Recovery',
		title: 'Secret History & 1-Click Rollback',
		description:
			'Every modification, update, and deletion is recorded as an immutable version. Review unified diffs across timestamps and restore previous secret states instantly if a deployment goes bad.',
		highlights: [
			'Visual side-by-side diff viewer',
			'Full attribution & modification reason',
			'Zero-downtime instant restoration',
		],
	},
	{
		icon: <Flame className='h-6 w-6 text-rose-500' />,
		badge: 'Self-Destructing Links',
		title: 'Zero-Knowledge Ephemeral Sharing',
		description:
			'Share sensitive credentials or SSH keys with clients and external teammates. Keys reside solely in the URL hash fragment (#key)—the DevVault server never sees or stores the decryption key.',
		highlights: [
			'Burn-on-first-read option',
			'Custom TTL expiration (10m to 7 days)',
			'Passphrase protection with PBKDF2',
		],
	},
	{
		icon: <Variable className='h-6 w-6 text-cyan-500' />,
		badge: 'DRY Configuration',
		title: 'Dynamic Variable Interpolation',
		description:
			'Eliminate duplicate hostnames and ports. Compose composite strings like DATABASE_URL="${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}" with automatic cycle detection.',
		highlights: [
			'Recursive cross-variable expansion',
			'Cycle detection with helpful error alerts',
			'Cross-environment consistency',
		],
	},
	{
		icon: <Terminal className='h-6 w-6 text-amber-500' />,
		badge: 'Developer Native CLI',
		title: 'In-Memory Process Injection',
		description:
			'Never leave unencrypted .env files on developer laptops or CI servers. The DevVault CLI pulls credentials and injects them straight into your application process in memory.',
		highlights: [
			'Zero plaintext files saved to disk',
			'Scoped API tokens with role restrictions',
			'Cross-platform (macOS, Linux, Windows)',
		],
	},
	{
		icon: <AlertTriangle className='h-6 w-6 text-emerald-500' />,
		badge: 'Entropy Detection',
		title: 'Security & Secret Leak Scanner',
		description:
			'Continuous Shannon entropy evaluation flags accidental leaks of raw AWS keys, high-entropy tokens, JWTs, and weak placeholder passwords before they hit staging or production.',
		highlights: [
			'Shannon entropy calculation score',
			'Weak password & placeholder warnings',
			'Upcoming secret expiration alerts',
		],
	},
]

export function LandingFeaturesGrid() {
	return (
		<section id='features' className='relative py-24 sm:py-32'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				{/* Section Header */}
				<div className='mx-auto max-w-2xl text-center'>
					<div className='border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold'>
						<Shield className='h-3.5 w-3.5' />
						<span>Enterprise-Grade Secrets Management</span>
					</div>
					<h2 className='text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl'>
						Everything Modern Engineering Teams Need
					</h2>
					<p className='text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg'>
						Built specifically for developers who care about security without
						sacrificing developer velocity or pipeline simplicity.
					</p>
				</div>

				{/* Features 3x2 Grid */}
				<div className='mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
					{features.map((feature, idx) => (
						<div
							key={idx}
							className='border-border/60 bg-card hover:border-primary/40 hover:shadow-primary/5 group relative flex flex-col justify-between rounded-2xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
						>
							<div>
								{/* Icon & Badge */}
								<div className='flex items-center justify-between'>
									<div className='bg-primary/10 group-hover:bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl transition-colors'>
										{feature.icon}
									</div>
									<span className='bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium'>
										{feature.badge}
									</span>
								</div>

								{/* Title & Description */}
								<h3 className='text-foreground mt-6 text-xl font-bold tracking-tight'>
									{feature.title}
								</h3>
								<p className='text-muted-foreground mt-3 text-sm leading-relaxed'>
									{feature.description}
								</p>
							</div>

							{/* Checklist highlights */}
							<div className='border-border/40 mt-6 border-t pt-5'>
								<ul className='space-y-2'>
									{feature.highlights.map((item, hIdx) => (
										<li
											key={hIdx}
											className='text-muted-foreground flex items-center gap-2 text-xs'
										>
											<CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-emerald-500' />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>

				{/* Bottom Action Note */}
				<div className='border-border/60 bg-muted/40 mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border p-6 sm:flex-row sm:px-8'>
					<div className='text-center sm:text-left'>
						<h4 className='text-foreground text-sm font-semibold sm:text-base'>
							Ready to test DevVault in your workflow?
						</h4>
						<p className='text-muted-foreground mt-0.5 text-xs sm:text-sm'>
							Spin up a project in under 60 seconds with zero credit card
							required.
						</p>
					</div>
					<Link
						href='/register'
						className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow transition-all hover:scale-105'
					>
						<span>Get Started Free</span>
						<ArrowUpRight className='h-4 w-4' />
					</Link>
				</div>
			</div>
		</section>
	)
}
