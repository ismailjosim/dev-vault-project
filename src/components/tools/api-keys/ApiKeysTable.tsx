import { Clock, Key, Trash2 } from 'lucide-react'
import type { ApiKeyItem } from './types'

interface ApiKeysTableProps {
	keys: ApiKeyItem[]
	onRevoke: (id: string) => void
}

export function ApiKeysTable({ keys, onRevoke }: ApiKeysTableProps) {
	return (
		<div className='border-border bg-card overflow-hidden rounded-xl border shadow-sm'>
			<table className='w-full text-left text-sm'>
				<thead className='border-border bg-muted/40 text-muted-foreground border-b text-xs font-medium tracking-wider uppercase'>
					<tr>
						<th className='px-4 py-3'>Token Name</th>
						<th className='px-4 py-3'>Key Prefix</th>
						<th className='px-4 py-3'>Last Used</th>
						<th className='px-4 py-3'>Expires</th>
						<th className='px-4 py-3 text-right'>Action</th>
					</tr>
				</thead>
				<tbody className='divide-border divide-y'>
					{keys.length === 0 ? (
						<tr>
							<td
								colSpan={5}
								className='text-muted-foreground px-4 py-8 text-center text-sm'
							>
								No active API tokens found. Generate one to use the CLI.
							</td>
						</tr>
					) : (
						keys.map((k) => (
							<tr key={k._id} className='hover:bg-muted/30 transition'>
								<td className='text-foreground flex items-center gap-2 px-4 py-3 font-medium'>
									<Key className='text-primary h-4 w-4 shrink-0' />
									<span>{k.name}</span>
								</td>
								<td className='text-muted-foreground px-4 py-3 font-mono text-xs'>
									{k.keyPrefix}
								</td>
								<td className='text-muted-foreground px-4 py-3 text-xs'>
									{k.lastUsedAt
										? new Date(k.lastUsedAt).toLocaleDateString()
										: 'Never'}
								</td>
								<td className='text-muted-foreground px-4 py-3 text-xs'>
									{k.expiresAt ? (
										<span className='flex items-center gap-1'>
											<Clock className='text-muted-foreground h-3 w-3' />
											{new Date(k.expiresAt).toLocaleDateString()}
										</span>
									) : (
										<span className='font-medium text-emerald-500'>
											No expiry
										</span>
									)}
								</td>
								<td className='px-4 py-3 text-right'>
									<button
										type='button'
										onClick={() => onRevoke(k._id)}
										className='text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded p-1'
										title='Revoke token'
									>
										<Trash2 className='h-4 w-4' />
									</button>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}
