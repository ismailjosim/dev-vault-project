import { Flame } from 'lucide-react'

export function SharedSecretBurned() {
	return (
		<div className='border-destructive/30 bg-destructive/5 flex flex-col items-center justify-center rounded-2xl border p-10 text-center shadow-xl'>
			<div className='bg-destructive/10 text-destructive flex h-14 w-14 items-center justify-center rounded-full'>
				<Flame className='h-7 w-7' />
			</div>
			<h2 className='text-foreground mt-4 text-xl font-semibold'>
				Secret Burned or Expired
			</h2>
			<p className='text-muted-foreground mt-2 max-w-md text-sm leading-relaxed'>
				This ephemeral secret has reached its view limit, expired, or was
				already permanently destroyed from DevVault&apos;s servers.
			</p>
		</div>
	)
}
