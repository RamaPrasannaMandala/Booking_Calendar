const AdminStatistics = ({ statistics }) => {
	if (!statistics) {
		return (
			<div className="text-center py-8">
				<div className="text-gray-500">Loading statistics...</div>
			</div>
		)
	}

	const statCards = [
		{
			title: 'Total Appointments',
			value: statistics.totalAppointments,
			icon: '📅',
			color: 'bg-blue-500'
		},
		{
			title: 'Confirmed Appointments',
			value: statistics.confirmedAppointments,
			icon: '✅',
			color: 'bg-green-500'
		},
		{
			title: 'Cancelled Appointments',
			value: statistics.cancelledAppointments,
			icon: '❌',
			color: 'bg-red-500'
		},
		{
			title: 'Completed Appointments',
			value: statistics.completedAppointments,
			icon: '🎉',
			color: 'bg-purple-500'
		},
		{
			title: 'Total Users',
			value: statistics.totalUsers,
			icon: '👥',
			color: 'bg-indigo-500'
		},
		{
			title: 'Total Workspaces',
			value: statistics.totalWorkspaces,
			icon: '🏢',
			color: 'bg-yellow-500'
		},
		{
			title: 'Recent Appointments (30 days)',
			value: statistics.recentAppointments,
			icon: '📈',
			color: 'bg-pink-500'
		}
	]

	return (
		<div>
			<h2 className="text-2xl font-bold text-gray-800 mb-6">System Statistics</h2>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{statCards.map((stat, index) => (
					<div
						key={index}
						className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">{stat.title}</p>
								<p className="text-3xl font-bold text-gray-900 mt-2">
									{stat.value.toLocaleString()}
								</p>
							</div>
							<div className={`${stat.color} text-white p-3 rounded-full text-2xl`}>
								{stat.icon}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Additional Insights */}
			<div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
					<h3 className="text-xl font-bold mb-2">Appointment Status Distribution</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span>Confirmed:</span>
							<span className="font-bold">
								{statistics.totalAppointments > 0 
									? Math.round((statistics.confirmedAppointments / statistics.totalAppointments) * 100)
									: 0}%
							</span>
						</div>
						<div className="flex justify-between">
							<span>Cancelled:</span>
							<span className="font-bold">
								{statistics.totalAppointments > 0 
									? Math.round((statistics.cancelledAppointments / statistics.totalAppointments) * 100)
									: 0}%
							</span>
						</div>
						<div className="flex justify-between">
							<span>Completed:</span>
							<span className="font-bold">
								{statistics.totalAppointments > 0 
									? Math.round((statistics.completedAppointments / statistics.totalAppointments) * 100)
									: 0}%
							</span>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
					<h3 className="text-xl font-bold mb-2">System Overview</h3>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span>Active Users:</span>
							<span className="font-bold">{statistics.totalUsers}</span>
						</div>
						<div className="flex justify-between">
							<span>Active Workspaces:</span>
							<span className="font-bold">{statistics.totalWorkspaces}</span>
						</div>
						<div className="flex justify-between">
							<span>Recent Activity:</span>
							<span className="font-bold">{statistics.recentAppointments} appointments</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default AdminStatistics

