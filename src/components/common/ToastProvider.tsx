'use client'

import { ToastContainer } from 'react-toastify'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

function useMounted() {
	return useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const { theme } = useTheme()
	const mounted = useMounted()

	if (!mounted) {
		return <>{children}</>
	}

	return (
		<>
			{children}
			<ToastContainer
				position='top-right'
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme={theme === 'dark' ? 'dark' : 'light'}
				limit={3}
			/>
		</>
	)
}
