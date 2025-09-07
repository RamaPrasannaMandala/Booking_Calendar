import { useEffect } from 'react'

const ConfirmationModal = ({ data, onClose, type = 'confirmation', emailSent = false }) => {
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}

		document.addEventListener('keydown', handleEscape)
		return () => document.removeEventListener('keydown', handleEscape)
	}, [onClose])

	const formatTime = (time) => {
		const [hours, minutes] = time.split(':')
		const hour = parseInt(hours)
		const ampm = hour >= 12 ? 'PM' : 'AM'
		const displayHour = hour % 12 || 12
		return `${displayHour}:${minutes} ${ampm}`
	}

	const addMinutesToTime = (time, minutes) => {
		const [hours, mins] = time.split(':').map(Number)
		const durationMinutes = parseInt(minutes) || 30
		const totalMinutes = hours * 60 + mins + durationMinutes
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

	const isConfirmation = type === 'confirmation'
	const endTime = data ? addMinutesToTime(data.time, data.duration || 30) : null
	const hasCustomerEmail = data?.email || data?.customerEmail
	
	// Debug logging
	console.log('ConfirmationModal data:', {
		time: data?.time,
		duration: data?.duration,
		endTime: endTime,
		calculatedEndTime: data ? addMinutesToTime(data.time, data.duration || 30) : null
	})

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
				<div className="p-6">
					<div className="text-center mb-6">
						<div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
							isConfirmation ? 'bg-green-500' : 'bg-red-500'
						}`}>
							{isConfirmation ? (
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
									<polyline points="20,6 9,17 4,12"></polyline>
								</svg>
							) : (
								<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
									<path d="M3 6h18"></path>
									<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
									<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
								</svg>
							)}
						</div>
						<h3 className="text-2xl font-bold text-gray-800 mb-2">
							{isConfirmation ? 'Appointment Confirmed!' : 'Appointment Deleted!'}
						</h3>
					</div>

					{data && (
						<div className={`p-4 rounded-lg mb-6 ${
							isConfirmation ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
						}`}>
							<p className="font-semibold text-gray-800 mb-2">Title: {data.title || 'Appointment'}</p>
							<p className="font-semibold text-gray-800 mb-2">Date: {formatDate(data.date)}</p>
							<p className="font-semibold text-gray-800 mb-2">
								Time: {formatTime(data.time)} - {formatTime(endTime)} ({data.duration || 30} minutes)
							</p>
							<p className="font-semibold text-gray-800 mb-2">
								Name: {data.name || data.customerName}
							</p>
							<p className="font-semibold text-gray-800 mb-2">
								Email: {data.email || data.customerEmail}
							</p>
							{data.notes && (
								<p className="font-semibold text-gray-800">Notes: {data.notes}</p>
							)}
						</div>
					)}

					{/* Email Status */}
					{isConfirmation && hasCustomerEmail && (
						<div className={`p-4 rounded-lg mb-6 ${
							emailSent 
								? 'bg-green-50 border border-green-200' 
								: 'bg-yellow-50 border border-yellow-200'
						}`}>
							<div className="flex items-center">
								{emailSent ? (
									<svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
								) : (
									<svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									</svg>
								)}
								<div>
									<p className={`font-medium ${
										emailSent ? 'text-green-800' : 'text-yellow-800'
									}`}>
										{emailSent 
											? '✓ Confirmation email sent successfully!'
											: '⚠ Email configuration required'
										}
									</p>
									<p className={`text-sm ${
										emailSent ? 'text-green-600' : 'text-yellow-600'
									}`}>
										{emailSent 
											? `Email sent to ${data?.email || data?.customerEmail}`
											: 'Please configure email settings in the backend to send confirmation emails.'
										}
									</p>
								</div>
							</div>
						</div>
					)}

					{!hasCustomerEmail && isConfirmation && (
						<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
							<div className="flex items-center">
								<svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
								</svg>
								<div>
									<p className="font-medium text-blue-800">No email address provided</p>
									<p className="text-sm text-blue-600">
										Add a customer email address to receive confirmation emails.
									</p>
								</div>
							</div>
						</div>
					)}

					<p className="text-gray-600 text-sm text-center mb-6">
						{isConfirmation 
							? 'Your appointment has been successfully scheduled!'
							: 'The appointment has been successfully deleted and the time slot is now available.'
						}
					</p>

					<div className="text-center">
						<button
							onClick={onClose}
							className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all hover:transform hover:-translate-y-0.5 hover:shadow-lg"
						>
							OK
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ConfirmationModal