'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import type { EnvVariableSummary } from '@/components/env/EnvVariableItem'
import type { EnvComparisonResult } from './types'

export function useEnvironmentCompare({
	projectId,
	environments,
	isOpen,
	onClonedSuccess,
}: {
	projectId: string
	environments: string[]
	isOpen: boolean
	onClonedSuccess?: () => void
}) {
	const [allVariables, setAllVariables] = useState<EnvVariableSummary[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [isCloning, setIsCloning] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [successMsg, setSuccessMsg] = useState<string | null>(null)

	const [sourceEnv, setSourceEnv] = useState<string>(environments[0] || 'dev')
	const [targetEnv, setTargetEnv] = useState<string>(
		environments[1] || (environments[0] === 'prod' ? 'staging' : 'prod'),
	)
	const [copyValues, setCopyValues] = useState<boolean>(false)

	const fetchVariables = useCallback(async () => {
		if (!projectId) return
		setIsLoading(true)
		setError(null)
		try {
			const res = await fetch(`/api/projects/${projectId}/env`)
			if (!res.ok) throw new Error('Failed to load project variables')
			const data = await res.json()
			setAllVariables(data.variables || [])
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Error fetching variables')
		} finally {
			setIsLoading(false)
		}
	}, [projectId])

	useEffect(() => {
		if (!isOpen || !projectId) return
		let cancelled = false

		const load = async () => {
			try {
				const res = await fetch(`/api/projects/${projectId}/env`)
				if (!res.ok) throw new Error('Failed to load project variables')
				const data = await res.json()
				if (!cancelled) {
					setAllVariables(data.variables || [])
					setSuccessMsg(null)
				}
			} catch (err: unknown) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : 'Error fetching variables',
					)
				}
			}
		}

		void load()

		return () => {
			cancelled = true
		}
	}, [isOpen, projectId])

	const comparison: EnvComparisonResult = useMemo(() => {
		const sourceVars = allVariables.filter((v) => v.environment === sourceEnv)
		const targetVars = allVariables.filter((v) => v.environment === targetEnv)

		const targetMap = new Map(targetVars.map((v) => [v.key, v]))
		const sourceMap = new Map(sourceVars.map((v) => [v.key, v]))

		const missingInTarget: EnvVariableSummary[] = []
		const presentInBoth: EnvComparisonResult['presentInBoth'] = []

		for (const sVar of sourceVars) {
			const tVar = targetMap.get(sVar.key)
			if (!tVar) {
				missingInTarget.push(sVar)
			} else {
				presentInBoth.push({
					key: sVar.key,
					sourceVar: sVar,
					targetVar: tVar,
				})
			}
		}

		const missingInSource: EnvVariableSummary[] = []
		for (const tVar of targetVars) {
			if (!sourceMap.has(tVar.key)) {
				missingInSource.push(tVar)
			}
		}

		return {
			sourceEnv,
			targetEnv,
			missingInTarget,
			missingInSource,
			presentInBoth,
		}
	}, [allVariables, sourceEnv, targetEnv])

	const cloneMissingToTarget = async () => {
		if (comparison.missingInTarget.length === 0) return
		setIsCloning(true)
		setError(null)
		setSuccessMsg(null)

		try {
			const res = await fetch(`/api/projects/${projectId}/env/clone`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sourceEnvironment: sourceEnv,
					targetEnvironment: targetEnv,
					copyValues,
					keys: comparison.missingInTarget.map((v) => v.key),
				}),
			})

			const data = await res.json()
			if (!res.ok) throw new Error(data.message || 'Clone failed')

			setSuccessMsg(data.message || 'Cloned successfully')
			await fetchVariables()
			if (onClonedSuccess) onClonedSuccess()
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Error cloning variables')
		} finally {
			setIsCloning(false)
		}
	}

	return {
		isLoading,
		isCloning,
		error,
		successMsg,
		sourceEnv,
		setSourceEnv,
		targetEnv,
		setTargetEnv,
		copyValues,
		setCopyValues,
		comparison,
		cloneMissingToTarget,
		refresh: fetchVariables,
	}
}
