'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import type { AuditLogItem } from './types'

export function useAuditLogs(projectId: string) {
	const [logs, setLogs] = useState<AuditLogItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)

	const [actionFilter, setActionFilter] = useState('ALL')
	const [envFilter, setEnvFilter] = useState('all')
	const [searchQuery, setSearchQuery] = useState('')
	const [refreshTrigger, setRefreshTrigger] = useState(0)

	useEffect(() => {
		let ignore = false

		async function load() {
			try {
				const params = new URLSearchParams({
					page: String(page),
					limit: '25',
				})

				if (actionFilter !== 'ALL') params.set('action', actionFilter)
				if (envFilter !== 'all') params.set('environment', envFilter)
				if (searchQuery.trim()) params.set('search', searchQuery.trim())

				const res = await fetch(`/api/projects/${projectId}/audit?${params}`)
				if (!res.ok) throw new Error('Failed to load audit logs')
				const data = await res.json()

				if (!ignore) {
					setLogs(data.logs || [])
					setTotal(data.total || 0)
					setPage(data.page || 1)
					setTotalPages(data.totalPages || 1)
					setIsLoading(false)
				}
			} catch {
				if (!ignore) {
					toast.error('Failed to load audit trail')
					setIsLoading(false)
				}
			}
		}

		void load()

		return () => {
			ignore = true
		}
	}, [projectId, page, actionFilter, envFilter, searchQuery, refreshTrigger])

	const handleExportCsv = () => {
		const params = new URLSearchParams({ format: 'csv' })
		if (actionFilter !== 'ALL') params.set('action', actionFilter)
		if (envFilter !== 'all') params.set('environment', envFilter)
		if (searchQuery.trim()) params.set('search', searchQuery.trim())

		window.open(
			`/api/projects/${projectId}/audit?${params.toString()}`,
			'_blank',
		)
	}

	const handleFilterChange = (
		type: 'action' | 'env' | 'search',
		value: string,
	) => {
		setIsLoading(true)
		setPage(1)
		if (type === 'action') setActionFilter(value)
		if (type === 'env') setEnvFilter(value)
		if (type === 'search') setSearchQuery(value)
	}

	const refresh = () => {
		setIsLoading(true)
		setRefreshTrigger((prev) => prev + 1)
	}

	return {
		logs,
		isLoading,
		total,
		page,
		setPage,
		totalPages,
		actionFilter,
		envFilter,
		searchQuery,
		handleFilterChange,
		handleExportCsv,
		refresh,
	}
}
