'use client'

import {
	ApiKeysHeader,
	ApiKeysTable,
	CliQuickstartGuide,
	CreateApiKeyModal,
	useApiKeysManager,
	type ApiKeysManagerProps,
} from './api-keys'

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
	const {
		keys,
		isOpen,
		name,
		setName,
		expiresInDays,
		setExpiresInDays,
		isLoading,
		createdToken,
		hasCopied,
		error,
		openModal,
		closeModal,
		handleCreate,
		handleRevoke,
		copyToClipboard,
	} = useApiKeysManager(initialKeys)

	return (
		<div className='space-y-8'>
			<ApiKeysHeader onOpenCreateModal={openModal} />

			<CreateApiKeyModal
				isOpen={isOpen}
				name={name}
				setName={setName}
				expiresInDays={expiresInDays}
				setExpiresInDays={setExpiresInDays}
				isLoading={isLoading}
				createdToken={createdToken}
				hasCopied={hasCopied}
				error={error}
				onClose={closeModal}
				onCreate={handleCreate}
				onCopy={copyToClipboard}
			/>

			<ApiKeysTable keys={keys} onRevoke={handleRevoke} />

			<CliQuickstartGuide />
		</div>
	)
}
