'use client'

import { parseEnvText, ParsedEnvVariable } from '@/utils/env-parser'
import { hasInterpolation, resolvePreview } from '@/utils/interpolation'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'

export function useEnvVariableForm(projectId: string) {
	const router = useRouter()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [open, setOpen] = useState(false)
	const [key, setKey] = useState('')
	const [value, setValue] = useState('')
	const [existingVariables, setExistingVariables] = useState<
		Record<string, string>
	>({})
	const [note, setNote] = useState('')
	const [expiryDate, setExpiryDate] = useState('')
	const [type, setType] = useState('other')
	const [isSensitive, setIsSensitive] = useState(true)
	const [isValueVisible, setIsValueVisible] = useState(false)
	const [selectedEnvironments, setSelectedEnvironments] = useState(['prod'])
	const [importedVariables, setImportedVariables] = useState<
		ParsedEnvVariable[]
	>([])
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (!open) return
		let isMounted = true
		async function fetchExisting() {
			try {
				const res = await fetch(`/api/projects/${projectId}/env?reveal=true`)
				if (res.ok && isMounted) {
					const data = await res.json()
					const map: Record<string, string> = {}
					for (const v of data.variables || []) {
						if (v.key) {
							map[v.key] = v.value || ''
						}
					}
					setExistingVariables(map)
				}
			} catch {
				// Ignore
			}
		}
		void fetchExisting()
		return () => {
			isMounted = false
		}
	}, [open, projectId])

	const interpolationPreview = useMemo(() => {
		if (!value || !hasInterpolation(value)) return null
		return resolvePreview(key.trim(), value, existingVariables)
	}, [key, value, existingVariables])

	const variablesToSave = useMemo(() => {
		if (importedVariables.length > 0) return importedVariables
		if (!key.trim() || !value) return []
		return [{ key: key.trim(), value }]
	}, [importedVariables, key, value])

	const applyEnvText = (text: string) => {
		const parsed = parseEnvText(text)

		if (parsed.variables.length === 0) {
			setError('No environment variables were detected.')
			return
		}

		setImportedVariables(parsed.variables)
		setKey('')
		setValue('')
		setError(null)
	}

	const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) return

		applyEnvText(await file.text())
		event.target.value = ''
	}

	const onKeyChange = (nextValue: string) => {
		setKey(nextValue)
		setError(null)

		if (nextValue.includes('\n') || nextValue.includes('=')) {
			const parsed = parseEnvText(nextValue)
			if (parsed.variables.length > 0) {
				setImportedVariables(parsed.variables)
				setKey('')
				setValue('')
			}
		}
	}

	const toggleEnvironment = (environment: string) => {
		setSelectedEnvironments((current) => {
			if (current.includes(environment)) {
				return current.length === 1
					? current
					: current.filter((item) => item !== environment)
			}

			return [...current, environment]
		})
	}

	const resetForm = () => {
		setKey('')
		setValue('')
		setNote('')
		setExpiryDate('')
		setType('other')
		setIsSensitive(true)
		setIsValueVisible(false)
		setSelectedEnvironments(['prod'])
		setImportedVariables([])
		setError(null)
	}

	const saveVariables = async () => {
		setIsSubmitting(true)
		setError(null)

		const payload = selectedEnvironments.flatMap((environment) =>
			variablesToSave.map((variable) => ({
				...variable,
				type,
				isPublic: !isSensitive,
				note,
				expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
				environment,
			})),
		)

		const response = await fetch(`/api/projects/${projectId}/env/import`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ variables: payload }),
		})

		setIsSubmitting(false)

		if (!response.ok) {
			const result = (await response.json()) as { message?: string }
			setError(result.message || 'Could not save environment variables.')
			return
		}

		resetForm()
		setOpen(false)
		router.refresh()
	}

	return {
		fileInputRef,
		open,
		setOpen,
		key,
		onKeyChange,
		value,
		setValue,
		existingVariables,
		note,
		setNote,
		expiryDate,
		setExpiryDate,
		type,
		setType,
		isSensitive,
		setIsSensitive,
		isValueVisible,
		setIsValueVisible,
		selectedEnvironments,
		toggleEnvironment,
		importedVariables,
		setImportedVariables,
		error,
		isSubmitting,
		interpolationPreview,
		variablesToSave,
		onFileChange,
		saveVariables,
		resetForm,
	}
}
