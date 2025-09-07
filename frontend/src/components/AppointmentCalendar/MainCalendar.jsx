import { useState, useEffect, useContext } from 'react'
import AuthContext from '../../contexts/AuthContext'
import CalendarHeader from './CalendarHeader'
import CalendarGrid from './CalendarGrid'
import AppointmentPanel from './AppointmentPanel'
import AppointmentsList from './AppointmentsList'
import ConfirmationModal from '../Modals/ConfirmationModal'
import ShareModal from '../Modals/ShareModal'
import DebugAuth from '../DebugAuth'
import { useAppointmentStore } from '../../stores/appointmentStore'

const MainCalendar = ({ isSharedView = false, shareId = null }) => {
	const { currentUser, logout } = useContext(AuthContext)
	const [currentDate, setCurrentDate] = useState(new Date())
	const [selectedDate, setSelectedDate] = useState(null)
	const [showConfirmationModal, setShowConfirmationModal] = useState(false)
	const [showShareModal, setShowShareModal] = useState(false)
	const [confirmationData, setConfirmationData] = useState(null)
	const [emailSent, setEmailSent] = useState(false)
	
	const { 
		appointments, 
		loadAppointments, 
		addAppointment, 
		deleteAppointment
	} = useAppointmentStore()

	useEffect(() => {
		// Pass shareId if in shared view
		loadAppointments(isSharedView ? shareId : null)
	}, [loadAppointments, isSharedView, shareId])

	const handleDateSelect = (date) => {
        console.log(date);
		setSelectedDate(date)
	}

	const handleMonthChange = (delta) => {
		const newDate = new Date(currentDate)
		newDate.setMonth(newDate.getMonth() + delta)
		setCurrentDate(newDate)
	}

	const handleLogout = () => {
		if (confirm('Are you sure you want to sign out?')) {
			logout()
		}
	}

	const handleBookingSubmit = async (bookingData) => {
		try {
			console.log(bookingData);
			
			// Check if user is authenticated (for non-shared view)
			if (!isSharedView && !currentUser) {
				alert('Please log in to book appointments.')
				return
			}
			
			// Check if token exists
			const token = localStorage.getItem('token')
			if (!isSharedView && !token) {
				alert('Authentication required. Please log in again.')
				// Force logout and reload
				logout()
				window.location.reload()
				return
			}
			
			// Pass shareId if in shared view
			const response = await addAppointment(bookingData, isSharedView ? shareId : null)
			setConfirmationData(bookingData)
			setEmailSent(response?.emailSent || false)
			setShowConfirmationModal(true)
			setSelectedDate(null) // Reset selected date
		} catch (error) {
			console.error('Error booking appointment:', error)
			
			// Check if it's an authentication error
			if (error.response?.status === 401) {
				alert('Authentication failed. Please log in again.')
				logout()
				window.location.reload()
			} else {
				alert('Failed to book appointment. Please try again.')
			}
		}
	}

	const handleDeleteAppointment = async (appointmentId) => {
		if (confirm('Are you sure you want to delete this appointment?')) {
			try {
				// Pass shareId if in shared view
				await deleteAppointment(appointmentId, isSharedView ? shareId : null)
			} catch (error) {
				console.error('Error deleting appointment:', error)
				alert('Failed to delete appointment. Please try again.')
			}
		}
	}

	const handleShareCalendar = () => {
		setShowShareModal(true)
	}

	return (
		<div className="container mx-auto p-5">
			{/* Debug component for troubleshooting */}
			<DebugAuth />
			
			<CalendarHeader
				currentDate={currentDate}
				currentUser={currentUser}
				isSharedView={isSharedView}
				onMonthChange={handleMonthChange}
				onLogout={handleLogout}
				onShare={handleShareCalendar}
			/>

			<main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<CalendarGrid
						currentDate={currentDate}
						selectedDate={selectedDate}
						appointments={appointments}
						onDateSelect={handleDateSelect}
					/>
				</div>

				<div className="space-y-6">
									<AppointmentPanel
					selectedDate={selectedDate}
					appointments={appointments}
					onBookingSubmit={handleBookingSubmit}
					onDeleteAppointment={handleDeleteAppointment}
					isSharedView={isSharedView}
					currentUser={currentUser}
				/>

					{!isSharedView && (
						<>
							<AppointmentsList
								title="Today's Appointments"
								appointments={appointments.filter(apt => {
									const today = new Date()
									const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
									return apt.date === todayString
								})}
								onDeleteAppointment={handleDeleteAppointment}
								currentUser={currentUser}
							/>

							<AppointmentsList
								title="All Appointments"
								appointments={appointments}
								onDeleteAppointment={handleDeleteAppointment}
								currentUser={currentUser}
							/>
						</>
					)}
				</div>
			</main>

			{/* Modals */}
			{showConfirmationModal && (
				<ConfirmationModal
					data={confirmationData}
					emailSent={emailSent}
					onClose={() => setShowConfirmationModal(false)}
				/>
			)}

			{showShareModal && (
				<ShareModal
					onClose={() => setShowShareModal(false)}
				/>
			)}
		</div>
	)
}

export default MainCalendar
