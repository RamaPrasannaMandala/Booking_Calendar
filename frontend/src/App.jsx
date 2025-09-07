import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import AuthContext from './contexts/AuthContext'
import AppointmentCalendar from './components/AppointmentCalendar/AppointmentCalendar'
import AdminDashboard from './components/Admin/AdminDashboard'
import WorkspaceManager from './components/Workspace/WorkspaceManager'

// Set base URL for backend API - backend runs on port 5000
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Add auth token to requests
axios.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => Promise.reject(error)
)

// Add response interceptor to handle errors
axios.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token expired or invalid, redirect to login
			localStorage.removeItem('token')
			localStorage.removeItem('currentUser')
			window.location.reload()
		}
		return Promise.reject(error)
	}
)

function App() {
	const [currentUser, setCurrentUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Check if user is already logged in
		const token = localStorage.getItem('token')
		const user = localStorage.getItem('currentUser')
		
		if (token && user) {
			try {
				setCurrentUser(JSON.parse(user))
			} catch (error) {
				console.error('Error parsing user data:', error)
				localStorage.removeItem('token')
				localStorage.removeItem('currentUser')
			}
		}
		setLoading(false)
	}, [])

	const login = (userData, token) => {
		setCurrentUser(userData)
		localStorage.setItem('token', token)
		localStorage.setItem('currentUser', JSON.stringify(userData))
	}

	const logout = () => {
		setCurrentUser(null)
		localStorage.removeItem('token')
		localStorage.removeItem('currentUser')
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
				<div className="text-white text-xl">Loading...</div>
			</div>
		)
	}

	return (
		<AuthContext.Provider value={{ currentUser, login, logout }}>
			<Router>
				<Routes>
					{/* Admin Routes */}
					{currentUser?.role === 'admin' && (
						<Route path="/admin" element={<AdminDashboard />} />
					)}
					
					{/* Workspace Routes */}
					{currentUser && (
						<Route path="/workspaces" element={<WorkspaceManager />} />
					)}
					
					{/* Main Calendar Route */}
					<Route path="/*" element={<AppointmentCalendar />} />
				</Routes>
			</Router>
		</AuthContext.Provider>
	)
}

export default App
