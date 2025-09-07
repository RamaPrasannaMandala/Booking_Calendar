import { useMemo } from 'react'

const TimeSlots = ({ selectedDate, dayAppointments, selectedTimeSlot, onTimeSlotSelect, onDeleteAppointment, isSharedView = false, currentUser }) => {
	const timeSlots = useMemo(() => {
		const slots = []
		for (let hour = 9; hour <= 17; hour++) {
			for (let minute = 0; minute < 60; minute += 30) {
				if (hour === 17 && minute === 30) break // Stop at 5:30 PM
				const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
				slots.push(time)
			}
		}
		return slots
	}, [])

	const isToday = (date) => {
		const today = new Date()
		return date.getDate() === today.getDate() &&
			   date.getMonth() === today.getMonth() &&
			   date.getFullYear() === today.getFullYear()
	}

	const isTimeInPast = (time) => {
		if (!isToday(selectedDate)) {
			return false
		}
		
		const now = new Date()
		const currentHour = now.getHours()
		const currentMinute = now.getMinutes()
		
		const [slotHour, slotMinute] = time.split(':').map(Number)
		
		return slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)
	}

	const addMinutesToTime = (time, minutes) => {
		const [hours, mins] = time.split(':').map(Number)
		const totalMinutes = hours * 60 + mins + minutes
		const newHours = Math.floor(totalMinutes / 60)
		const newMins = totalMinutes % 60
		return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
	}

	const isTimeInRange = (time, startTime, endTime) => {
		return time >= startTime && time < endTime
	}

	const isTimeSlotBooked = (time) => {
		return dayAppointments.some(appointment => {
			const startTime = appointment.time
			const duration = appointment.duration || 30
			const endTime = addMinutesToTime(startTime, duration)
			return isTimeInRange(time, startTime, endTime)
		})
	}

	const findAppointmentForTimeSlot = (time) => {
		return dayAppointments.find(appointment => {
			const startTime = appointment.time
			const duration = appointment.duration || 30
			const endTime = addMinutesToTime(startTime, duration)
			return isTimeInRange(time, startTime, endTime)
		})
	}

	const formatTime = (time) => {
		const [hours, minutes] = time.split(':')
		const hour = parseInt(hours)
		const ampm = hour >= 12 ? 'PM' : 'AM'
		const displayHour = hour % 12 || 12
		return `${displayHour}:${minutes} ${ampm}`
	}

	const handleTimeSlotClick = (time) => {
		const isBooked = isTimeSlotBooked(time)
		const isPast = isTimeInPast(time)
		
		if (!isBooked && !isPast) {
			onTimeSlotSelect(time)
		}
	}

	const handleDeleteAppointment = (e, appointmentId) => {
		e.stopPropagation()
		onDeleteAppointment(appointmentId)
	}

	return (
		<div className="grid gap-2">
			{timeSlots.map(time => {
				const isBooked = isTimeSlotBooked(time)
				const isPast = isTimeInPast(time)
				const isSelected = selectedTimeSlot === time
				const appointment = isBooked ? findAppointmentForTimeSlot(time) : null

				let className = "p-3 border border-gray-200 rounded-lg cursor-pointer transition-all flex justify-between items-center relative bg-white hover:bg-gray-50 hover:border-gray-300 hover:transform hover:translate-x-1"

				if (isBooked) {
					className = "p-3 border border-red-200 rounded-lg cursor-not-allowed transition-all flex justify-between items-center relative bg-red-50 opacity-70"
				} else if (isPast) {
					className = "p-3 border border-gray-200 rounded-lg cursor-not-allowed transition-all flex justify-between items-center relative bg-gray-50 opacity-70"
				} else if (isSelected) {
					className = "p-3 border border-green-500 rounded-lg cursor-pointer transition-all flex justify-between items-center relative bg-green-500 text-white"
				} else {
					className += " border-green-300 bg-green-50"
				}

				return (
					<div
						key={time}
						className={className}
						onClick={() => handleTimeSlotClick(time)}
						title={isBooked ? `${appointment?.title || 'Appointment'} (${formatTime(appointment?.time)} - ${formatTime(addMinutesToTime(appointment?.time, appointment?.duration || 30))}) - ${appointment?.customerName || appointment?.name} (${appointment?.customerEmail || appointment?.email})` : ''}
					>
						<span className="font-medium">{formatTime(time)}</span>
						<span className="text-sm opacity-80">
							{isBooked ? 'Booked' : isPast ? 'Past' : 'Available'}
						</span>
						
						{isBooked && !isSharedView && (() => {
							const isOwnAppointment = currentUser && appointment.user && appointment.user._id === currentUser._id
							const isAdmin = currentUser && currentUser.email === 'ramaprasanna2709@gmail.com'
							const canDelete = isAdmin || isOwnAppointment
							
							return canDelete ? (
								<button
									onClick={(e) => handleDeleteAppointment(e, appointment._id)}
									className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-colors ${
										isAdmin 
											? 'bg-purple-500 hover:bg-purple-600 text-white' 
											: 'bg-red-500 hover:bg-red-600 text-white'
									}`}
									title={isAdmin ? 'Delete appointment (Admin)' : 'Delete appointment'}
								>
									×
								</button>
							) : null
						})()}
					</div>
				)
			})}
		</div>
	)
}

export default TimeSlots
