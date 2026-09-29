'use client'

import {
	SecretShareForm,
	SecretShareResult,
	SecretShareSecuritySidebar,
	useSecretShare,
} from './secret-share'

export function SecretShareTool() {
	const {
		secretText,
		setSecretText,
		ttlSeconds,
		setTtlSeconds,
		maxViews,
		setMaxViews,
		usePassphrase,
		setUsePassphrase,
		passphrase,
		setPassphrase,
		isMasked,
		setIsMasked,
		loading,
		error,
		shareUrl,
		copied,
		handleGenerateLink,
		handleCopy,
		handleReset,
	} = useSecretShare()

	return (
		<div className='grid gap-6 lg:grid-cols-[1fr_360px]'>
			<div className='border-border/60 bg-card rounded-2xl border p-6 shadow-sm'>
				{shareUrl ? (
					<SecretShareResult
						shareUrl={shareUrl}
						copied={copied}
						onCopy={handleCopy}
						onReset={handleReset}
					/>
				) : (
					<SecretShareForm
						secretText={secretText}
						setSecretText={setSecretText}
						isMasked={isMasked}
						setIsMasked={setIsMasked}
						ttlSeconds={ttlSeconds}
						setTtlSeconds={setTtlSeconds}
						maxViews={maxViews}
						setMaxViews={setMaxViews}
						usePassphrase={usePassphrase}
						setUsePassphrase={setUsePassphrase}
						passphrase={passphrase}
						setPassphrase={setPassphrase}
						loading={loading}
						error={error}
						onSubmit={handleGenerateLink}
					/>
				)}
			</div>

			<SecretShareSecuritySidebar />
		</div>
	)
}
