import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditLogPaginationProps {
	currentCount: number
	total: number
	page: number
	totalPages: number
	isLoading: boolean
	onPageChange: (newPage: number) => void
}

export function AuditLogPagination({
	currentCount,
	total,
	page,
	totalPages,
	isLoading,
	onPageChange,
}: AuditLogPaginationProps) {
	return (
		<div className='border-border bg-muted/20 flex items-center justify-between border-t px-4 py-3'>
			<span className='text-muted-foreground text-xs'>
				Showing {currentCount} of {total} events
			</span>
			<div className='flex items-center gap-2'>
				<button
					type='button'
					disabled={page <= 1 || isLoading}
					onClick={() => onPageChange(page - 1)}
					className='border-border text-foreground hover:bg-hover inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs disabled:opacity-40'
				>
					<ChevronLeft className='h-3.5 w-3.5' />
					Previous
				</button>
				<span className='text-muted-foreground text-xs font-medium'>
					Page {page} of {totalPages}
				</span>
				<button
					type='button'
					disabled={page >= totalPages || isLoading}
					onClick={() => onPageChange(page + 1)}
					className='border-border text-foreground hover:bg-hover inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs disabled:opacity-40'
				>
					Next
					<ChevronRight className='h-3.5 w-3.5' />
				</button>
			</div>
		</div>
	)
}
