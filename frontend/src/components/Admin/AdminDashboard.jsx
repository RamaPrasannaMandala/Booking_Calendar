import { useState, useEffect } from 'react'
import axios from 'axios'
import AdminAppointmentsList from './AdminAppointmentsList'
import AdminUsersList from './AdminUsersList'
import AdminWorkspacesList from './AdminWorkspacesList'
import AdminStatistics from './AdminStatistics'

const AdminDashboard = () => {
	const [activeTab, setActiveTab] = useState('statistics')
	const [statistics, setStatistics] = useState(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		loadStatistics()
	}, [])

	const loadStatistics = async () => {
		setLoading(true)
		try {
			const response = await axios.get('/admin/statistics')
			setStatistics(response.data.statistics)
		} catch (error) {
			console.error('Error loading statistics:', error)
		} finally {
			setLoading(false)
		}
	}

	const tabs = [
		{ id: 'statistics', label: 'Statistics', icon: '📊' },
		{ id: 'appointments', label: 'All Appointments', icon: '📅' },
		{ id: 'users', label: 'Users', icon: '👥' },
		{ id: 'workspaces', label: 'Workspaces', icon: '🏢' }
	]

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						🔧 Admin Dashboard
					</h1>
					<p className="text-gray-600">
						Manage all appointments, users, and workspaces across the system
					</p>
				</div>

				{/* Navigation Tabs */}
				<div className="bg-white rounded-lg shadow-lg mb-6">
					<div className="flex border-b">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
									activeTab === tab.id
										? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
										: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
								}`}
							>
								<span className="mr-2">{tab.icon}</span>
								{tab.label}
							</button>
						))}
					</div>
				</div>

				{/* Content */}
				<div className="bg-white rounded-lg shadow-lg p-6">
					{loading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
						</div>
					) : (
						<>
							{activeTab === 'statistics' && (
								<AdminStatistics statistics={statistics} />
							)}
							{activeTab === 'appointments' && (
								<AdminAppointmentsList />
							)}
							{activeTab === 'users' && (
								<AdminUsersList />
							)}
							{activeTab === 'workspaces' && (
								<AdminWorkspacesList />
							)}
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default AdminDashboard

