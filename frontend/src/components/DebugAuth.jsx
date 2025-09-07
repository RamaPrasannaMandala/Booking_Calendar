import { useContext } from 'react'
import AuthContext from '../contexts/AuthContext'

const DebugAuth = () => {
	const { currentUser, logout } = useContext(AuthContext)

	const clearAuth = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('currentUser')
		window.location.reload()
	}

	const checkAuth = () => {
		const token = localStorage.getItem('token')
		const user = localStorage.getItem('currentUser')
		console.log('Token:', token)
		console.log('User:', user)
		console.log('CurrentUser from context:', currentUser)
	}

	return (
		<div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
			<h3 className="font-bold mb-2">Debug Auth</h3>
			<div className="space-y-2">
				<button 
					onClick={checkAuth}
					className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
				>
					Check Auth (see console)
				</button>
				<button 
					onClick={clearAuth}
					className="bg-red-500 text-white px-3 py-1 rounded text-sm"
				>
					Clear Auth & Reload
				</button>
				<button 
					onClick={logout}
					className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
				>
					Logout
				</button>
			</div>
			<div className="mt-2 text-xs">
				<p>Current User: {currentUser ? 'Logged In' : 'Not Logged In'}</p>
				<p>Token: {localStorage.getItem('token') ? 'Exists' : 'Missing'}</p>
			</div>
		</div>
	)
}

export default DebugAuth
