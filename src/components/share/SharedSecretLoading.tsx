export function SharedSecretLoading() {
	return (
		<div className='border-border/60 bg-card/60 flex flex-col items-center justify-center rounded-2xl border p-12 text-center shadow-lg backdrop-blur-md'>
			<div className='border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent' />
			<p className='text-muted-foreground mt-4 text-sm font-medium'>
				Verifying secure link...
			</p>
		</div>
	)
}
