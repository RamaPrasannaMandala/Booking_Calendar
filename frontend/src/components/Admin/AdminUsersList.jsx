import { useState, useEffect } from 'react'
import axios from 'axios'

const AdminUsersList = () => {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	const [filters, setFilters] = useState({
		role: '',
		isActive: ''
	})

	useEffect(() => {
		loadUsers()
	}, [filters])

	const loadUsers = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams()
			Object.entries(filters).forEach(([key, value]) => {
				if (value !== '') params.append(key, value)
			})
			
			const response = await axios.get(`/admin/users?${params}`)
			setUsers(response.data.users)
		} catch (error) {
			console.error('Error loading users:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleRoleChange = async (userId, newRole) => {
		try {
			await axios.put(`/admin/users/${userId}/role`, { role: newRole })
			loadUsers()
		} catch (error) {
			console.error('Error updating user role:', error)
			alert('Failed to update user role')
		}
	}

	const getRoleColor = (role) => {
		switch (role) {
			case 'admin': return 'bg-red-100 text-red-800'
			case 'user': return 'bg-blue-100 text-blue-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	const getStatusColor = (isActive) => {
		return isActive 
			? 'bg-green-100 text-green-800' 
			: 'bg-red-100 text-red-800'
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-800">User Management</h2>
				<div className="text-sm text-gray-600">
					Total: {users.length} users
				</div>
			</div>

			{/* Filters */}
			<div className="bg-gray-50 rounded-lg p-4 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Role
						</label>
						<select
							value={filters.role}
							onChange={(e) => setFilters({ ...filters, role: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="">All Roles</option>
							<option value="user">User</option>
							<option value="admin">Admin</option>
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Status
						</label>
						<select
							value={filters.isActive}
							onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						>
							<option value="">All Status</option>
							<option value="true">Active</option>
							<option value="false">Inactive</option>
						</select>
					</div>
				</div>
			</div>

			{/* Users List */}
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
									User
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Role
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Workspace
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Last Login
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{users.map((user) => (
								<tr key={user._id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div>
											<div className="text-sm font-medium text-gray-900">
												{user.name}
											</div>
											<div className="text-sm text-gray-500">
												{user.email}
											</div>
											<div className="text-xs text-gray-400">
												Joined: {new Date(user.createdAt).toLocaleDateString()}
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<select
											value={user.role}
											onChange={(e) => handleRoleChange(user._id, e.target.value)}
											className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleColor(user.role)}`}
										>
											<option value="user">User</option>
											<option value="admin">Admin</option>
										</select>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
											{user.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{user.workspaceId ? (
											<span className="text-sm text-gray-900">
												{user.workspaceId.name}
											</span>
										) : (
											<span className="text-gray-400">No workspace</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{user.lastLogin 
											? new Date(user.lastLogin).toLocaleDateString()
											: 'Never'
										}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
										<div className="flex space-x-2">
											<button
												onClick={() => handleRoleChange(user._id, user.role === 'admin' ? 'user' : 'admin')}
												className="text-indigo-600 hover:text-indigo-900"
											>
												{user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{users.length === 0 && !loading && (
				<div className="text-center py-12">
					<div className="text-gray-500">No users found</div>
				</div>
			)}
		</div>
	)
}

export default AdminUsersList

