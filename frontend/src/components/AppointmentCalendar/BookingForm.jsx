import { useState } from 'react'

const BookingForm = ({ selectedDate, selectedTimeSlot, onSubmit, onCancel }) => {
	const [formData, setFormData] = useState({
		title: '',
		duration: '30',
		customerName: '',
		customerEmail: '',
		notes: ''
	})
	const [loading, setLoading] = useState(false)

	const formatTime = (time) => {
		const [hours, minutes] = time.split(':')
		const hour = parseInt(hours)
		const ampm = hour >= 12 ? 'PM' : 'AM'
		const displayHour = hour % 12 || 12
		return `${displayHour}:${minutes} ${ampm}`
	}

	const formatDate = (date) => {
		const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
		const monthNames = [
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		]
		return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
	}

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)

		try {
            console.log(formData);
			await onSubmit(formData)
		} catch (error) {
			console.error('Error submitting booking:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="mt-6 pt-6 border-t border-gray-200">
			<h4 className="text-gray-700 font-semibold mb-4">Book Appointment</h4>
			
			<form onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div>
						<label htmlFor="title" className="block text-gray-700 font-medium text-sm mb-2">
							Title
						</label>
						<input
							type="text"
							id="title"
							name="title"
							value={formData.title}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
							placeholder="Meeting with John Doe"
							required
						/>
					</div>

					<div>
						<label htmlFor="appointmentTime" className="block text-gray-700 font-medium text-sm mb-2">
							Time
						</label>
						<input
							type="text"
							id="appointmentTime"
							value={`${formatDate(selectedDate)} at ${formatTime(selectedTimeSlot)}`}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
							readOnly
						/>
					</div>

					<div>
						<label htmlFor="duration" className="block text-gray-700 font-medium text-sm mb-2">
							Duration
						</label>
						<select
							id="duration"
							name="duration"
							value={formData.duration}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
							required
						>
							<option value="30">30 minutes</option>
							<option value="60">1 hour</option>
							<option value="90">1 hour 30 minutes</option>
							<option value="120">2 hours</option>
						</select>
					</div>

					<div>
						<label htmlFor="name" className="block text-gray-700 font-medium text-sm mb-2">
							Your Name
						</label>
						<input
							type="text"
							id="customerName"
							name="customerName"
							value={formData.customerName}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
							placeholder="Your Name"
							required
						/>
					</div>

					<div>
						<label htmlFor="email" className="block text-gray-700 font-medium text-sm mb-2">
							Your Email
						</label>
						<input
							type="email"
							id="customerEmail"
							name="customerEmail"
							value={formData.customerEmail}
							onChange={handleChange}
							className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
							placeholder="your.email@example.com"
							required
						/>
					</div>

					<div>
						<label htmlFor="notes" className="block text-gray-700 font-medium text-sm mb-2">
							Notes (Optional)
						</label>
						<textarea
							id="notes"
							name="notes"
							value={formData.notes}
							onChange={handleChange}
							rows="3"
							className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
							placeholder="Any specific details or requests"
						/>
					</div>
				</div>

				<div className="flex gap-3 mt-6">
					<button
						type="submit"
						disabled={loading}
						className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg font-medium text-sm transition-all hover:from-indigo-600 hover:to-purple-700 hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
					>
						{loading ? 'Booking...' : 'Book Now'}
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	)
}

export default BookingForm
