import { useMemo } from 'react'

const AppointmentsList = ({ title, appointments, onDeleteAppointment, currentUser }) => {
	const sortedAppointments = useMemo(() => {
		return appointments.sort((a, b) => {
			// Sort by date first, then by time
			const dateComparison = a.date.localeCompare(b.date)
			if (dateComparison !== 0) return dateComparison
			return a.time.localeCompare(b.time)
		})
	}, [appointments])

	const formatTime = (time) => {
		const [hours, minutes] = time.split(':')
		const hour = parseInt(hours)
		const ampm = hour >= 12 ? 'PM' : 'AM'
		const displayHour = hour % 12 || 12
		return `${displayHour}:${minutes} ${ampm}`
	}

	const addMinutesToTime = (time, minutes) => {
		const [hours, mins] = time.split(':').map(Number)
		const totalMinutes = hours * 60 + mins + minutes
		const newHours = Math.floor(totalMinutes / 60)
		const newMins = totalMinutes % 60
		return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
	}

	const formatDate = (dateString) => {
		const date = new Date(dateString)
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		const monthNames = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		]
		return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
	}

	const handleDeleteAppointment = (appointmentId) => {
		onDeleteAppointment(appointmentId)
	}

	if (sortedAppointments.length === 0) {
		return (
			<div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
				<h3 className="text-gray-800 text-xl font-semibold mb-4">{title}</h3>
				<p className="text-gray-500 text-center">No appointments scheduled</p>
			</div>
		)
	}

	return (
		<div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
			<h3 className="text-gray-800 text-xl font-semibold mb-4">{title}</h3>
			
			<div className="space-y-3">
				{sortedAppointments.map(appointment => {
					const endTime = addMinutesToTime(appointment.time, appointment.duration || 30)
					const isOwnAppointment = currentUser && appointment.user && appointment.user._id === currentUser._id
					const isAdmin = currentUser && currentUser.email === 'ramaprasanna2709@gmail.com'
					const canDelete = isAdmin || isOwnAppointment
					
					// Debug for all appointments
					console.log(`🔍 Debug - Appointment ${appointment.title}:`, {
						appointmentId: appointment._id,
						appointmentUserId: appointment.user?._id,
						currentUserId: currentUser?._id,
						appointmentUserEmail: appointment.user?.email,
						currentUserEmail: currentUser?.email,
						isOwnAppointment,
						isAdmin,
						canDelete,
						userIdsMatch: appointment.user?._id === currentUser?._id,
						hasUserData: !!appointment.user,
						hasCurrentUser: !!currentUser
					})
					

					
					return (
						<div key={appointment._id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500 relative">
							<div className="flex justify-between items-start mb-2">
								<div className="flex-1">
									<h4 className="text-gray-800 font-semibold text-base">
										{appointment.title || 'Appointment'}
									</h4>
									{/* Show who created the appointment */}
									{appointment.user && (
										<div className="flex items-center mt-1">
											<span className="text-xs text-gray-500">Booked by:</span>
											<span className={`text-xs ml-1 px-2 py-1 rounded-full ${
												isOwnAppointment 
													? 'bg-green-100 text-green-800' 
													: 'bg-blue-100 text-blue-800'
											}`}>
												{appointment.user.name} ({appointment.user.email})
												{isOwnAppointment && ' (You)'}
											</span>
										</div>
									)}
								</div>
								{canDelete && (
									<button
										onClick={() => handleDeleteAppointment(appointment._id)}
										className={`rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors ${
											isAdmin 
												? 'bg-purple-500 hover:bg-purple-600 text-white' 
												: 'bg-red-500 hover:bg-red-600 text-white'
										}`}
										title={isAdmin ? 'Delete appointment (Admin)' : 'Delete appointment'}
									>
										×
									</button>
								)}
							</div>
							
							<p className="text-indigo-600 font-semibold text-sm mb-1">
								{formatDate(appointment.date)}
							</p>
							
							<p className="text-indigo-600 font-semibold text-sm mb-2">
								{formatTime(appointment.time)} - {formatTime(endTime)} ({appointment.duration || 30} min)
							</p>
							
							<p className="text-gray-700 text-sm mb-1">
								<strong>{appointment.customerName || appointment.name}</strong> - {appointment.customerEmail || appointment.email}
							</p>
							
							{appointment.notes && (
								<p className="text-gray-600 text-sm italic">
									{appointment.notes}
								</p>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default AppointmentsList
