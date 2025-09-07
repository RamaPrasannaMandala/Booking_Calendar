import { useState, useMemo } from 'react'
import TimeSlots from './TimeSlots'
import BookingForm from './BookingForm'

const AppointmentPanel = ({ selectedDate, appointments, onBookingSubmit, onDeleteAppointment, isSharedView = false, currentUser }) => {
	const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)

	const formatDate = (date) => {
		// Fix timezone issue by using local date formatting instead of UTC
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const dayAppointments = useMemo(() => {
		if (!selectedDate) return []
		const dateString = formatDate(selectedDate)
		return appointments.filter(apt => apt.date === dateString)
	}, [selectedDate, appointments])

	const handleTimeSlotSelect = (time) => {
		setSelectedTimeSlot(time)
	}

	const handleBookingSubmit = (formData) => {
		const bookingData = {
			...formData,
			date: formatDate(selectedDate),
			time: selectedTimeSlot
			// Don't set ID here, let the backend generate it
		}
		onBookingSubmit(bookingData)
		setSelectedTimeSlot(null)
	}

	const handleCancelBooking = () => {
		setSelectedTimeSlot(null)
	}

	if (!selectedDate) {
		return (
			<div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
				<h3 className="text-gray-800 text-xl font-semibold mb-4">Schedule Appointment</h3>
				<div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
					<p className="text-gray-600 font-medium">Select a date to view available times</p>
				</div>
			</div>
		)
	}

	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	const monthNames = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	]

	const formattedDate = `${dayNames[selectedDate.getDay()]}, ${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`

	return (
		<div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
			<h3 className="text-gray-800 text-xl font-semibold mb-4">Schedule Appointment</h3>
			
			<div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500 mb-4">
				<p className="text-gray-800 font-semibold">{formattedDate}</p>
				<p className="text-gray-600">{dayAppointments.length} appointment(s) scheduled</p>
			</div>

			<div className="mb-4">
				<h4 className="text-gray-700 font-semibold mb-3">Available Times</h4>
				<TimeSlots
					selectedDate={selectedDate}
					dayAppointments={dayAppointments}
					selectedTimeSlot={selectedTimeSlot}
					onTimeSlotSelect={handleTimeSlotSelect}
					onDeleteAppointment={onDeleteAppointment}
					isSharedView={isSharedView}
					currentUser={currentUser}
				/>
			</div>

			{selectedTimeSlot && (
				<BookingForm
					selectedDate={selectedDate}
					selectedTimeSlot={selectedTimeSlot}
					onSubmit={handleBookingSubmit}
					onCancel={handleCancelBooking}
				/>
			)}
		</div>
	)
}

export default AppointmentPanel
