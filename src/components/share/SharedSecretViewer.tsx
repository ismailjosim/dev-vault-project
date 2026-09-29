'use client'

import {
	SharedSecretBurned,
	SharedSecretDecrypted,
	SharedSecretLoading,
	SharedSecretUnlockForm,
	useSharedSecret,
	type SharedSecretViewerProps,
} from './index'

export function SharedSecretViewer({ shareId }: SharedSecretViewerProps) {
	const {
		key,
		setKey,
		meta,
		loading,
		notFound,
		passphrase,
		setPassphrase,
		decrypting,
		errorMessage,
		decryptedContent,
		isMasked,
		setIsMasked,
		copied,
		isBurned,
		remainingViews,
		handleReveal,
		handleCopy,
	} = useSharedSecret(shareId)

	if (loading) {
		return <SharedSecretLoading />
	}

	if (notFound) {
		return <SharedSecretBurned />
	}

	if (decryptedContent !== null) {
		return (
			<SharedSecretDecrypted
				decryptedContent={decryptedContent}
				isMasked={isMasked}
				setIsMasked={setIsMasked}
				copied={copied}
				onCopy={handleCopy}
				isBurned={isBurned}
				remainingViews={remainingViews}
			/>
		)
	}

	return (
		<SharedSecretUnlockForm
			secretKey={key}
			setSecretKey={setKey}
			meta={meta}
			passphrase={passphrase}
			setPassphrase={setPassphrase}
			errorMessage={errorMessage}
			decrypting={decrypting}
			onReveal={handleReveal}
		/>
	)
}
