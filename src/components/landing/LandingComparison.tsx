import { Check, X, Shield, Minus } from 'lucide-react'

interface FeatureRow {
	feature: string
	devvault: string | boolean
	plainEnv: string | boolean
	genericVault: string | boolean
}

const comparisonData: FeatureRow[] = [
	{
		feature: 'In-Memory Process Injection (Zero Disk Leak)',
		devvault: true,
		plainEnv: false,
		genericVault: false,
	},
	{
		feature: 'AES-256 GCM Authenticated Field Encryption',
		devvault: true,
		plainEnv: false,
		genericVault: true,
	},
	{
		feature: 'Immutable Version History & Instant Rollback',
		devvault: true,
		plainEnv: false,
		genericVault: 'Limited',
	},
	{
		feature: 'Zero-Knowledge Ephemeral Link Sharing (#hash)',
		devvault: true,
		plainEnv: false,
		genericVault: false,
	},
	{
		feature: 'Cross-Variable Dynamic Interpolation (${VAR})',
		devvault: true,
		plainEnv: false,
		genericVault: false,
	},
	{
		feature: 'Automated Shannon Entropy Leak Detection',
		devvault: true,
		plainEnv: false,
		genericVault: false,
	},
	{
		feature: 'Full Team Audit Logs with Unified Diffs',
		devvault: true,
		plainEnv: false,
		genericVault: true,
	},
	{
		feature: 'Developer CLI (`devvault run`, `pull`)',
		devvault: true,
		plainEnv: false,
		genericVault: 'Complex Setup',
	},
]

export function LandingComparison() {
	return (
		<section id='comparison' className='py-24 sm:py-32'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				{/* Header */}
				<div className='mx-auto max-w-3xl text-center'>
					<div className='border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold'>
						<Shield className='h-3.5 w-3.5' />
						<span>Direct Comparison</span>
					</div>
					<h2 className='text-foreground mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl'>
						Why Developers Choose DevVault Over .env Files
					</h2>
					<p className='text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg'>
						Stop playing Slack ping-pong with unencrypted API keys. See how
						DevVault modernizes configuration management across your engineering
						organization.
					</p>
				</div>

				{/* Table Container */}
				<div className='border-border/60 bg-card mt-16 overflow-x-auto rounded-2xl border shadow-sm'>
					<table className='w-full border-collapse text-left'>
						<thead>
							<tr className='border-border/60 bg-muted/40 border-b'>
								<th className='text-foreground p-4 text-sm font-semibold sm:p-5'>
									Capability
								</th>
								<th className='border-border/60 bg-primary/10 text-primary border-x p-4 text-center text-sm font-bold sm:p-5'>
									DevVault
								</th>
								<th className='text-muted-foreground p-4 text-center text-sm font-medium sm:p-5'>
									Unencrypted .env Files
								</th>
								<th className='text-muted-foreground p-4 text-center text-sm font-medium sm:p-5'>
									Generic Password Managers
								</th>
							</tr>
						</thead>
						<tbody className='divide-border/40 divide-y'>
							{comparisonData.map((row, idx) => (
								<tr key={idx} className='hover:bg-muted/20 transition-colors'>
									<td className='text-foreground p-4 text-sm font-medium sm:p-5'>
										{row.feature}
									</td>
									<td className='border-border/60 bg-primary/5 border-x p-4 text-center sm:p-5'>
										{typeof row.devvault === 'boolean' ? (
											row.devvault ? (
												<div className='bg-primary/20 text-primary mx-auto flex h-7 w-7 items-center justify-center rounded-full'>
													<Check className='h-4 w-4 stroke-3' />
												</div>
											) : (
												<X className='text-muted-foreground/50 mx-auto h-5 w-5' />
											)
										) : (
											<span className='text-primary text-xs font-semibold'>
												{row.devvault}
											</span>
										)}
									</td>
									<td className='p-4 text-center sm:p-5'>
										{typeof row.plainEnv === 'boolean' ? (
											row.plainEnv ? (
												<Check className='mx-auto h-5 w-5 text-emerald-500' />
											) : (
												<div className='mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-500'>
													<X className='h-4 w-4 stroke-[2.5]' />
												</div>
											)
										) : (
											<span className='text-muted-foreground text-xs'>
												{row.plainEnv}
											</span>
										)}
									</td>
									<td className='p-4 text-center sm:p-5'>
										{typeof row.genericVault === 'boolean' ? (
											row.genericVault ? (
												<Check className='mx-auto h-5 w-5 text-emerald-500' />
											) : (
												<div className='bg-muted text-muted-foreground mx-auto flex h-7 w-7 items-center justify-center rounded-full'>
													<Minus className='h-4 w-4' />
												</div>
											)
										) : (
											<span className='text-muted-foreground bg-muted rounded-full px-2.5 py-1 text-xs font-medium'>
												{row.genericVault}
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	)
}
