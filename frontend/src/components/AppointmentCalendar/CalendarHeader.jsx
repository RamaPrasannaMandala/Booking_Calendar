import { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthContext from '../../contexts/AuthContext'

const CalendarHeader = ({ 
	currentDate, 
	currentUser, 
	isSharedView, 
	onMonthChange, 
	onLogout, 
	onShare 
}) => {
	const navigate = useNavigate()
	const location = useLocation()
	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	]

	const currentMonth = monthNames[currentDate.getMonth()]
	const currentYear = currentDate.getFullYear()

	const isAdmin = currentUser?.role === 'admin'
	const isAdminPage = location.pathname === '/admin'
	const isWorkspacePage = location.pathname === '/workspaces'

	return (
		<header className="bg-white/95 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-xl">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-gray-800 text-4xl font-bold">
					{isSharedView ? 'Book an Appointment' : 'Appointment Calendar'}
				</h1>
				
				{!isSharedView && (
					<div className="flex items-center gap-4">
						{/* Navigation Buttons */}
						<div className="flex items-center gap-2">
							{!isAdminPage && (
								<button
									onClick={() => navigate('/')}
									className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
									title="Go to Calendar"
								>
									📅 Calendar
								</button>
							)}
							
							{!isWorkspacePage && (
								<button
									onClick={() => navigate('/workspaces')}
									className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
									title="Manage Workspaces"
								>
									🏢 Workspaces
								</button>
							)}
							
							{isAdmin && !isAdminPage && (
								<button
									onClick={() => navigate('/admin')}
									className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
									title="Admin Dashboard"
								>
									🔧 Admin
								</button>
							)}
						</div>

						<div className="flex items-center gap-3">
							<div className="text-gray-600 font-medium text-sm">
								<div>{currentUser?.name || 'User'}</div>
								<div className="text-xs text-gray-500">{currentUser?.email}</div>
								{isAdmin && <span className="text-red-600">(Admin)</span>}
							</div>
							<button
								onClick={onLogout}
								className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
								title="Sign out"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
									<polyline points="16,17 21,12 16,7"></polyline>
									<line x1="21" y1="12" x2="9" y2="12"></line>
								</svg>
								Sign Out
							</button>
						</div>
						
						{!isAdminPage && !isWorkspacePage && (
							<button
								onClick={onShare}
								className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all hover:transform hover:-translate-y-0.5 hover:shadow-lg"
								title="Share your calendar"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
									<polyline points="16,6 12,2 8,6"></polyline>
									<line x1="12" y1="2" x2="12" y2="15"></line>
								</svg>
								Share Calendar
							</button>
						)}
					</div>
				)}
			</div>

			{isSharedView && (
				<div className="text-center text-gray-600 text-sm mb-4">
					This is a shared calendar view. You can see available times and book appointments.
				</div>
			)}

			{/* Only show calendar navigation on main calendar page */}
			{!isAdminPage && !isWorkspacePage && (
				<div className="flex items-center justify-center gap-6">
					<button
						onClick={() => onMonthChange(-1)}
						className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<polyline points="15,18 9,12 15,6"></polyline>
						</svg>
					</button>
					
					<h2 className="text-gray-600 text-2xl font-semibold min-w-[200px] text-center">
						{currentMonth} {currentYear}
					</h2>
					
					<button
						onClick={() => onMonthChange(1)}
						className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<polyline points="9,18 15,12 9,6"></polyline>
						</svg>
					</button>
				</div>
			)}
		</header>
	)
}

export default CalendarHeader

