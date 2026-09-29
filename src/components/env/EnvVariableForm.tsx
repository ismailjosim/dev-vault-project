'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Eye, EyeOff, Plus, Upload, X } from 'lucide-react'
import {
	EnvironmentSelector,
	ImportedVariablesList,
	InterpolationHelper,
	useEnvVariableForm,
} from './form'

export function EnvVariableForm({ projectId }: { projectId: string }) {
	const {
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
	} = useEnvVariableForm(projectId)

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen)
				if (!nextOpen) resetForm()
			}}
		>
			<Dialog.Trigger asChild>
				<button className='bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90'>
					Add environment variable
				</button>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className='fixed inset-0 z-40 bg-black/60' />
				<Dialog.Content className='border-border bg-card text-card-foreground fixed top-1/2 left-1/2 z-50 w-[calc(100vw-32px)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border shadow-2xl'>
					<div className='border-border flex items-center justify-between border-b px-5 py-4'>
						<Dialog.Title className='text-base font-semibold'>
							Add Environment Variable
						</Dialog.Title>
						<Dialog.Close className='text-muted-foreground hover:text-foreground rounded p-1'>
							<X className='h-4 w-4' />
						</Dialog.Close>
					</div>

					<div className='max-h-[75vh] overflow-y-auto px-5 py-4'>
						{error && (
							<div className='border-danger/30 bg-danger-foreground text-danger mb-4 rounded-md border px-3 py-2 text-sm'>
								{error}
							</div>
						)}

						<div className='space-y-4'>
							<label className='block'>
								<span className='text-muted-foreground text-xs font-medium'>
									Key
								</span>
								<input
									value={key}
									onChange={(event) => onKeyChange(event.target.value)}
									disabled={importedVariables.length > 0}
									className='border-border bg-background text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-60'
									placeholder='API_KEY'
								/>
							</label>

							<label className='block'>
								<span className='text-muted-foreground text-xs font-medium'>
									Value
								</span>
								<div className='border-border bg-background focus-within:border-muted-foreground mt-1 flex rounded-md border'>
									<input
										value={value}
										onChange={(event) => setValue(event.target.value)}
										disabled={importedVariables.length > 0}
										type={isValueVisible ? 'text' : 'password'}
										className='text-foreground min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-60'
										placeholder='secret value'
									/>
									<button
										type='button'
										onClick={() => setIsValueVisible(!isValueVisible)}
										className='text-muted-foreground hover:text-foreground px-3'
									>
										{isValueVisible ? (
											<EyeOff className='h-4 w-4' />
										) : (
											<Eye className='h-4 w-4' />
										)}
									</button>
								</div>

								<InterpolationHelper
									existingVariables={existingVariables}
									onInsertReference={(k) =>
										setValue((prev) => `${prev}\${${k}}`)
									}
									interpolationPreview={interpolationPreview}
								/>
							</label>

							<label className='block'>
								<span className='text-muted-foreground text-xs font-medium'>
									Note (Optional)
								</span>
								<input
									value={note}
									onChange={(event) => setNote(event.target.value)}
									className='border-border bg-background text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none'
									placeholder='Where to rotate, or who to contact'
								/>
							</label>

							<label className='block'>
								<span className='text-muted-foreground text-xs font-medium'>
									Expiry date (Optional)
								</span>
								<input
									type='date'
									value={expiryDate}
									onChange={(event) => setExpiryDate(event.target.value)}
									className='border-border bg-background text-foreground focus:border-muted-foreground mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none'
								/>
							</label>
						</div>

						<ImportedVariablesList
							variables={importedVariables}
							onClear={() => setImportedVariables([])}
						/>

						<EnvironmentSelector
							isSensitive={isSensitive}
							onToggleSensitive={() => setIsSensitive(!isSensitive)}
							type={type}
							onTypeChange={setType}
							selectedEnvironments={selectedEnvironments}
							onToggleEnvironment={toggleEnvironment}
						/>
					</div>

					<div className='border-border flex items-center justify-between gap-3 border-t px-5 py-4'>
						<div className='text-muted-foreground flex flex-wrap items-center gap-2 text-xs'>
							<input
								ref={fileInputRef}
								type='file'
								accept='.env,.txt'
								onChange={onFileChange}
								className='hidden'
							/>
							<button
								type='button'
								onClick={() => fileInputRef.current?.click()}
								className='border-border text-foreground hover:bg-hover inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm'
							>
								<Upload className='h-4 w-4' />
								Import .env
							</button>
							<span>or paste .env contents in Key input</span>
						</div>

						<button
							type='button'
							onClick={saveVariables}
							disabled={variablesToSave.length === 0 || isSubmitting}
							className='bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-60'
						>
							{importedVariables.length === 0 && <Plus className='h-4 w-4' />}
							{isSubmitting ? 'Saving...' : 'Save'}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
