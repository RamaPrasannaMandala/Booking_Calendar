import { useState, useEffect } from 'react'
import axios from 'axios'

const AdminWorkspacesList = () => {
	const [workspaces, setWorkspaces] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadWorkspaces()
	}, [])

	const loadWorkspaces = async () => {
		setLoading(true)
		try {
			const response = await axios.get('/admin/workspaces')
			setWorkspaces(response.data.workspaces)
		} catch (error) {
			console.error('Error loading workspaces:', error)
		} finally {
			setLoading(false)
		}
	}

	const getRoleColor = (role) => {
		switch (role) {
			case 'owner': return 'bg-purple-100 text-purple-800'
			case 'admin': return 'bg-red-100 text-red-800'
			case 'member': return 'bg-blue-100 text-blue-800'
			case 'viewer': return 'bg-gray-100 text-gray-800'
			default: return 'bg-gray-100 text-gray-800'
		}
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-800">Workspace Management</h2>
				<div className="text-sm text-gray-600">
					Total: {workspaces.length} workspaces
				</div>
			</div>

			{/* Workspaces List */}
			{loading ? (
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{workspaces.map((workspace) => (
						<div
							key={workspace._id}
							className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-1">
										{workspace.name}
									</h3>
									{workspace.description && (
										<p className="text-sm text-gray-600 mb-2">
											{workspace.description}
										</p>
									)}
									<div className="flex items-center space-x-2">
										<span className="text-xs text-gray-500">
											Created: {new Date(workspace.createdAt).toLocaleDateString()}
										</span>
										<span className="text-xs text-gray-500">
											• {workspace.memberCount} members
										</span>
									</div>
								</div>
								<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${workspace.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
									{workspace.isActive ? 'Active' : 'Inactive'}
								</span>
							</div>

							{/* Owner */}
							<div className="mb-4">
								<h4 className="text-sm font-medium text-gray-700 mb-2">Owner</h4>
								<div className="flex items-center space-x-2">
									<div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
										<span className="text-sm font-medium text-indigo-600">
											{workspace.ownerId.name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<div className="text-sm font-medium text-gray-900">
											{workspace.ownerId.name}
										</div>
										<div className="text-xs text-gray-500">
											{workspace.ownerId.email}
										</div>
									</div>
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor('owner')}`}>
										Owner
									</span>
								</div>
							</div>

							{/* Members */}
							{workspace.members.length > 0 && (
								<div>
									<h4 className="text-sm font-medium text-gray-700 mb-2">
										Members ({workspace.members.length})
									</h4>
									<div className="space-y-2">
										{workspace.members.map((member) => (
											<div key={member.userId._id} className="flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
														<span className="text-xs font-medium text-gray-600">
															{member.userId.name.charAt(0).toUpperCase()}
														</span>
													</div>
													<div>
														<div className="text-sm font-medium text-gray-900">
															{member.userId.name}
														</div>
														<div className="text-xs text-gray-500">
															{member.userId.email}
														</div>
													</div>
												</div>
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
													{member.role}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Settings */}
							<div className="mt-4 pt-4 border-t border-gray-200">
								<h4 className="text-sm font-medium text-gray-700 mb-2">Settings</h4>
								<div className="grid grid-cols-1 gap-2 text-xs">
									<div className="flex justify-between">
										<span className="text-gray-600">Allow Member Booking:</span>
										<span className={workspace.settings.allowMemberBooking ? 'text-green-600' : 'text-red-600'}>
											{workspace.settings.allowMemberBooking ? 'Yes' : 'No'}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Allow Member Editing:</span>
										<span className={workspace.settings.allowMemberEditing ? 'text-green-600' : 'text-red-600'}>
											{workspace.settings.allowMemberEditing ? 'Yes' : 'No'}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Allow Member Deletion:</span>
										<span className={workspace.settings.allowMemberDeletion ? 'text-green-600' : 'text-red-600'}>
											{workspace.settings.allowMemberDeletion ? 'Yes' : 'No'}
										</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{workspaces.length === 0 && !loading && (
				<div className="text-center py-12">
					<div className="text-gray-500">No workspaces found</div>
				</div>
			)}
		</div>
	)
}

export default AdminWorkspacesList

