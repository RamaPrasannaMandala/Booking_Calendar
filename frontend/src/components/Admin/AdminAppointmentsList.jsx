import { useState, useEffect } from 'react'
import axios from 'axios'

const AdminAppointmentsList = () => {
	const [appointments, setAppointments] = useState([])
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState({
		date: '',
		status: '',
		userId: '',
		workspaceId: ''
	})
	const [users, setUsers] = useState([])
	const [workspaces, setWorkspaces] = useState([])

	useEffect(() => {
		loadAppointments()
		loadUsers()
		loadWorkspaces()
	}, [filters])

	const loadAppointments = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams()
			Object.entries(filters).forEach(([key, value]) => {
				if (value) params.append(key, value)
			})
			
			const response = await axios.get(`/admin/appointments?${params}`)
			setAppointments(response.data.appointments)
		} catch (error) {
			console.error('Error loading appointments:', error)
		} finally {
			setLoading(false)
		}
	}

	const loadUsers = async () => {
		try {
			const response = await axios.get('/admin/users')
			setUsers(response.data.users)
		} catch (error) {
			console.error('Error loading users:', error)
		}
	}

	const loadWorkspaces = async () => {
		try {
			const response = await axios.get('/admin/workspaces')
			setWorkspaces(response.data.workspaces)
		} catch (error) {
			console.error('Error loading workspaces:', error)
		}
	}

	const handleDeleteAppointment = async (appointmentId) => {
		if (confirm('Are you sure you want to delete this appointment?')) {
			try {
				await axios.delete(`/admin/appointments/${appointmentId}`)
				loadAppointments()
			} catch (error) {
				console.error('Error deleting appointment:', error)
				alert('Failed to delete appointment')
			}
		}
	}

	const handleStatusChange = async (appointmentId, newStatus) => {
		try {
			await axios.put(`/admin/appointments/${appointmentId}`, { status: newStatus })
			loadAppointments()
		} catch (error) {
			console.error('Error updating appointment:', error)
			alert('Failed to update appointment')
		}
	}

	const getStatusColor = (status) => {
		switch (status) {
			case 'confirmed': return 'bg-green-100 text-green-800'
			case 'cancelled': return 'bg-red-100 text-red-800'
			case 'completed': return 'bg-blue-100 text-blue-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-800">All Appointments</h2>
				<div className="text-sm text-gray-600">
					Total: {appointments.length} appointments
				</div>
			</div>

			{/* Filters */}
			<div className="bg-gray-50 rounded-lg p-4 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Date
						</label>
						<input
							type="date"
							value={filters.date}
							onChange={(e) => setFilters({ ...filters, date: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Status
						</label>
						<select
							value={filters.status}
							onChange={(e) => setFilters({ ...filters, status: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="">All Status</option>
							<option value="confirmed">Confirmed</option>
							<option value="cancelled">Cancelled</option>
							<option value="completed">Completed</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							User
						</label>
						<select
							value={filters.userId}
							onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="">All Users</option>
							{users.map((user) => (
								<option key={user._id} value={user._id}>
									{user.name} ({user.email})
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Workspace
						</label>
						<select
							value={filters.workspaceId}
							onChange={(e) => setFilters({ ...filters, workspaceId: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="">All Workspaces</option>
							{workspaces.map((workspace) => (
								<option key={workspace._id} value={workspace._id}>
									{workspace.name}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Appointments List */}
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border border-gray-200 rounded-lg">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Appointment
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Customer
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									User
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Workspace
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{appointments.map((appointment) => (
								<tr key={appointment._id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div>
											<div className="text-sm font-medium text-gray-900">
												{appointment.title}
											</div>
											<div className="text-sm text-gray-500">
												{appointment.date} at {appointment.time} ({appointment.duration}min)
											</div>
											{appointment.notes && (
												<div className="text-xs text-gray-400 mt-1">
													{appointment.notes}
												</div>
											)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div>
											<div className="text-sm font-medium text-gray-900">
												{appointment.customerName}
											</div>
											<div className="text-sm text-gray-500">
												{appointment.customerEmail}
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{appointment.user ? (
											<div>
												<div className="text-sm font-medium text-gray-900">
													{appointment.user.name}
												</div>
												<div className="text-sm text-gray-500">
													{appointment.user.email}
												</div>
											</div>
										) : (
											<span className="text-gray-400">N/A</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{appointment.workspace ? (
											<span className="text-sm text-gray-900">
												{appointment.workspace.name}
											</span>
										) : (
											<span className="text-gray-400">Personal</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<select
											value={appointment.status}
											onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
											className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(appointment.status)}`}
										>
											<option value="confirmed">Confirmed</option>
											<option value="cancelled">Cancelled</option>
											<option value="completed">Completed</option>
										</select>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<button
											onClick={() => handleDeleteAppointment(appointment._id)}
											className="text-red-600 hover:text-red-900"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{appointments.length === 0 && !loading && (
				<div className="text-center py-12">
					<div className="text-gray-500">No appointments found</div>
				</div>
			)}
		</div>
	)
}

export default AdminAppointmentsList

