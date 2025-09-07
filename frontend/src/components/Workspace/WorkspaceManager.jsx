import { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import AuthContext from '../../contexts/AuthContext'

const WorkspaceManager = () => {
	const { currentUser } = useContext(AuthContext)
	const [workspaces, setWorkspaces] = useState([])
	const [loading, setLoading] = useState(true)
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [showAddMemberForm, setShowAddMemberForm] = useState(false)
	const [selectedWorkspace, setSelectedWorkspace] = useState(null)
	const [formData, setFormData] = useState({
		name: '',
		description: ''
	})
	const [memberData, setMemberData] = useState({
		email: '',
		role: 'member'
	})

	useEffect(() => {
		loadWorkspaces()
	}, [])

	const loadWorkspaces = async () => {
		setLoading(true)
		try {
			const response = await axios.get('/workspaces')
			setWorkspaces(response.data.workspaces)
		} catch (error) {
			console.error('Error loading workspaces:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleCreateWorkspace = async (e) => {
		e.preventDefault()
		try {
			await axios.post('/workspaces', formData)
			setFormData({ name: '', description: '' })
			setShowCreateForm(false)
			loadWorkspaces()
		} catch (error) {
			console.error('Error creating workspace:', error)
			alert('Failed to create workspace')
		}
	}

	const handleAddMember = async (e) => {
		e.preventDefault()
		try {
			await axios.post(`/workspaces/${selectedWorkspace._id}/members`, memberData)
			setMemberData({ email: '', role: 'member' })
			setShowAddMemberForm(false)
			setSelectedWorkspace(null)
			loadWorkspaces()
		} catch (error) {
			console.error('Error adding member:', error)
			alert(error.response?.data?.error || 'Failed to add member')
		}
	}

	const handleRemoveMember = async (workspaceId, userId) => {
		if (confirm('Are you sure you want to remove this member?')) {
			try {
				await axios.delete(`/workspaces/${workspaceId}/members/${userId}`)
				loadWorkspaces()
			} catch (error) {
				console.error('Error removing member:', error)
				alert('Failed to remove member')
			}
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
		<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-gray-800 mb-2">
								🏢 Workspace Manager
							</h1>
							<p className="text-gray-600">
								Manage your workspaces and collaborate with team members
							</p>
						</div>
						<button
							onClick={() => setShowCreateForm(true)}
							className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
						>
							Create Workspace
						</button>
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
								className="bg-white rounded-lg shadow-lg p-6"
							>
								<div className="flex justify-between items-start mb-4">
									<div>
										<h3 className="text-xl font-semibold text-gray-900 mb-1">
											{workspace.name}
										</h3>
										{workspace.description && (
											<p className="text-gray-600 mb-2">
												{workspace.description}
											</p>
										)}
										<div className="flex items-center space-x-2 text-sm text-gray-500">
											<span>Created: {new Date(workspace.createdAt).toLocaleDateString()}</span>
											<span>• {workspace.memberCount} members</span>
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
									<div className="mb-4">
										<div className="flex justify-between items-center mb-2">
											<h4 className="text-sm font-medium text-gray-700">
												Members ({workspace.members.length})
											</h4>
											{(workspace.ownerId._id === currentUser._id || 
											  workspace.members.find(m => m.userId._id === currentUser._id && m.role === 'admin')) && (
												<button
													onClick={() => {
														setSelectedWorkspace(workspace)
														setShowAddMemberForm(true)
													}}
													className="text-indigo-600 hover:text-indigo-800 text-sm"
												>
													Add Member
												</button>
											)}
										</div>
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
													<div className="flex items-center space-x-2">
														<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
															{member.role}
														</span>
														{workspace.ownerId._id === currentUser._id && (
															<button
																onClick={() => handleRemoveMember(workspace._id, member.userId._id)}
																className="text-red-600 hover:text-red-800 text-xs"
															>
																Remove
															</button>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								)}

								{/* Settings */}
								<div className="pt-4 border-t border-gray-200">
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
						<div className="text-gray-500 mb-4">No workspaces found</div>
						<button
							onClick={() => setShowCreateForm(true)}
							className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
						>
							Create Your First Workspace
						</button>
					</div>
				)}
			</div>

			{/* Create Workspace Modal */}
			{showCreateForm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-bold text-gray-800 mb-4">Create Workspace</h2>
						<form onSubmit={handleCreateWorkspace}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Workspace Name
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									required
								/>
							</div>
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Description (Optional)
								</label>
								<textarea
									value={formData.description}
									onChange={(e) => setFormData({ ...formData, description: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									rows="3"
								/>
							</div>
							<div className="flex space-x-3">
								<button
									type="submit"
									className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
								>
									Create
								</button>
								<button
									type="button"
									onClick={() => setShowCreateForm(false)}
									className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Add Member Modal */}
			{showAddMemberForm && selectedWorkspace && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-bold text-gray-800 mb-4">
							Add Member to {selectedWorkspace.name}
						</h2>
						<form onSubmit={handleAddMember}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email Address
								</label>
								<input
									type="email"
									value={memberData.email}
									onChange={(e) => setMemberData({ ...memberData, email: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									required
								/>
							</div>
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Role
								</label>
								<select
									value={memberData.role}
									onChange={(e) => setMemberData({ ...memberData, role: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
								>
									<option value="member">Member</option>
									<option value="admin">Admin</option>
									<option value="viewer">Viewer</option>
								</select>
							</div>
							<div className="flex space-x-3">
								<button
									type="submit"
									className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
								>
									Add Member
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddMemberForm(false)
										setSelectedWorkspace(null)
									}}
									className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default WorkspaceManager

