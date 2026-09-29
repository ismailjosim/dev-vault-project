import {
	CheckCircle2,
	Clock,
	Globe,
	RefreshCw,
	Trash2,
	Webhook,
	XCircle,
} from 'lucide-react'
import { GithubIcon } from './ConnectorsGrid'
import type { IntegrationItem } from './types'

interface IntegrationsTableProps {
	integrations: IntegrationItem[]
	syncingId: string | null
	onSync: (id: string) => void
	onDelete: (id: string) => void
}

export function IntegrationsTable({
	integrations,
	syncingId,
	onSync,
	onDelete,
}: IntegrationsTableProps) {
	return (
		<div>
			<h3 className='text-muted-foreground text-sm font-semibold tracking-wider uppercase'>
				Active Integrations ({integrations.length})
			</h3>

			<div className='border-border bg-card mt-4 overflow-hidden rounded-xl border shadow-sm'>
				<table className='w-full text-left text-sm'>
					<thead className='border-border bg-muted/40 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase'>
						<tr>
							<th className='px-4 py-3'>Integration</th>
							<th className='px-4 py-3'>Target Identifier</th>
							<th className='px-4 py-3'>Mappings</th>
							<th className='px-4 py-3'>Sync Status</th>
							<th className='px-4 py-3 text-right'>Actions</th>
						</tr>
					</thead>
					<tbody className='divide-border divide-y'>
						{integrations.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className='text-muted-foreground px-4 py-8 text-center text-sm'
								>
									No integrations connected yet. Choose a connector above to get
									started.
								</td>
							</tr>
						) : (
							integrations.map((item) => (
								<tr key={item._id} className='hover:bg-muted/30 transition'>
									<td className='text-foreground flex items-center gap-2 px-4 py-3 font-medium'>
										{item.provider === 'vercel' ? (
											<Globe className='h-4 w-4 text-indigo-500' />
										) : item.provider === 'github' ? (
											<GithubIcon className='text-foreground h-4 w-4' />
										) : (
											<Webhook className='h-4 w-4 text-emerald-500' />
										)}
										<div>
											<div>{item.name}</div>
											<div className='text-muted-foreground text-[10px] capitalize'>
												{item.provider}
											</div>
										</div>
									</td>
									<td className='text-muted-foreground max-w-45 truncate px-4 py-3 font-mono text-xs'>
										{item.targetIdentifier}
									</td>
									<td className='text-muted-foreground px-4 py-3 text-xs'>
										{item.environmentMapping?.length || 0} envs mapped
									</td>
									<td className='px-4 py-3 text-xs'>
										{item.lastSyncStatus === 'success' ? (
											<span className='inline-flex items-center gap-1 font-medium text-emerald-500'>
												<CheckCircle2 className='h-3.5 w-3.5' />
												Synced
											</span>
										) : item.lastSyncStatus === 'failed' ? (
											<span
												className='text-destructive inline-flex items-center gap-1 font-medium'
												title={item.lastSyncError}
											>
												<XCircle className='h-3.5 w-3.5' />
												Failed
											</span>
										) : (
											<span className='text-muted-foreground inline-flex items-center gap-1'>
												<Clock className='h-3.5 w-3.5' />
												Pending
											</span>
										)}
										{item.lastSyncAt && (
											<div className='text-muted-foreground text-[10px]'>
												{new Date(item.lastSyncAt).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit',
												})}
											</div>
										)}
									</td>
									<td className='px-4 py-3 text-right'>
										<div className='flex items-center justify-end gap-2'>
											<button
												type='button'
												onClick={() => onSync(item._id)}
												disabled={syncingId === item._id}
												className='bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold disabled:opacity-50'
												title='Sync Secrets Now'
											>
												<RefreshCw
													className={`h-3 w-3 ${syncingId === item._id ? 'animate-spin' : ''}`}
												/>
												Sync
											</button>
											<button
												type='button'
												onClick={() => onDelete(item._id)}
												className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1'
												title='Disconnect'
											>
												<Trash2 className='h-4 w-4' />
											</button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
