'use client'

import { useState, useEffect, useRef } from 'react'
import { Building2, ChevronDown, Check, User, Plus, Users } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog'

export interface WorkspaceItem {
	_id: string
	name: string
	slug: string
	role?: string
}

interface WorkspaceSwitcherProps {
	initialWorkspaces?: WorkspaceItem[]
}

export function WorkspaceSwitcher({
	initialWorkspaces = [],
}: WorkspaceSwitcherProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [workspaces, setWorkspaces] =
		useState<WorkspaceItem[]>(initialWorkspaces)
	const menuRef = useRef<HTMLDivElement>(null)
	const router = useRouter()
	const searchParams = useSearchParams()

	const currentWorkspaceId = searchParams.get('workspaceId') || 'personal'

	useEffect(() => {
		const fetchWorkspaces = async () => {
			try {
				const res = await fetch('/api/workspaces')
				if (res.ok) {
					const data = await res.json()
					setWorkspaces(data.workspaces || [])
				}
			} catch (e) {
				console.error('Failed to load workspaces', e)
			}
		}

		fetchWorkspaces()
	}, [])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const currentWorkspace = workspaces.find((w) => w._id === currentWorkspaceId)

	const handleSelectWorkspace = (id: string) => {
		const params = new URLSearchParams(searchParams.toString())
		if (id === 'personal') {
			params.delete('workspaceId')
		} else {
			params.set('workspaceId', id)
		}
		setIsOpen(false)
		router.push(`/dashboard?${params.toString()}`)
	}

	return (
		<div className='relative inline-block text-left' ref={menuRef}>
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className='border-border bg-card text-foreground hover:bg-muted/50 focus:ring-primary flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition focus:ring-1 focus:outline-none'
			>
				{currentWorkspaceId === 'personal' ? (
					<User className='text-primary h-3.5 w-3.5' />
				) : (
					<Building2 className='h-3.5 w-3.5 text-indigo-500' />
				)}
				<span className='max-w-35 truncate'>
					{currentWorkspaceId === 'personal'
						? 'Personal Vault'
						: currentWorkspace?.name || 'Workspace'}
				</span>
				<ChevronDown className='text-muted-foreground h-3.5 w-3.5' />
			</button>

			{isOpen && (
				<div className='border-border bg-card animate-in fade-in slide-in-from-top-1 absolute left-0 z-50 mt-2 w-64 rounded-xl border p-1.5 shadow-xl'>
					<div className='text-muted-foreground px-2 py-1.5 text-[11px] font-medium tracking-wider uppercase'>
						Workspaces
					</div>

					<button
						type='button'
						onClick={() => handleSelectWorkspace('personal')}
						className='text-foreground hover:bg-muted/70 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium'
					>
						<div className='flex items-center gap-2'>
							<User className='text-primary h-3.5 w-3.5' />
							<span>Personal Vault</span>
						</div>
						{currentWorkspaceId === 'personal' && (
							<Check className='text-primary h-3.5 w-3.5' />
						)}
					</button>

					{workspaces.map((ws) => (
						<div
							key={ws._id}
							className='group text-foreground hover:bg-muted/70 flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium'
						>
							<button
								type='button'
								onClick={() => handleSelectWorkspace(ws._id)}
								className='flex flex-1 items-center gap-2 truncate text-left'
							>
								<Building2 className='h-3.5 w-3.5 shrink-0 text-indigo-500' />
								<span className='truncate'>{ws.name}</span>
								{ws.role && (
									<span className='bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px] capitalize'>
										{ws.role}
									</span>
								)}
							</button>
							<div className='flex items-center gap-1 opacity-80 group-hover:opacity-100'>
								{currentWorkspaceId === ws._id && (
									<Check className='text-primary mr-1 h-3.5 w-3.5' />
								)}
								<Link
									href={`/dashboard/workspaces/${ws._id}/members`}
									onClick={() => setIsOpen(false)}
									title='Manage Workspace Team'
									className='hover:bg-background text-muted-foreground hover:text-foreground rounded p-1'
								>
									<Users className='h-3.5 w-3.5' />
								</Link>
							</div>
						</div>
					))}

					<div className='border-border my-1.5 border-t' />

					<CreateWorkspaceDialog
						onCreated={(newWs) => {
							setWorkspaces((prev) => [newWs, ...prev])
							handleSelectWorkspace(newWs._id)
						}}
						trigger={
							<button
								type='button'
								className='text-primary hover:bg-primary/10 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium'
							>
								<Plus className='h-3.5 w-3.5' />
								<span>Create New Workspace</span>
							</button>
						}
					/>
				</div>
			)}
		</div>
	)
}
