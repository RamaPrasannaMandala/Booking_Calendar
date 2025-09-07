import { useMemo } from 'react'

const CalendarGrid = ({ currentDate, selectedDate, appointments, onDateSelect }) => {
	const calendarDays = useMemo(() => {
		const year = currentDate.getFullYear()
		const month = currentDate.getMonth()
		
		// Get first day of month and number of days
		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const startDate = new Date(firstDay)
		startDate.setDate(startDate.getDate() - firstDay.getDay())

		const days = []
		for (let i = 0; i < 42; i++) {
			const date = new Date(startDate)
			date.setDate(startDate.getDate() + i)
			days.push(date)
		}
		
		return days
	}, [currentDate])

	const isToday = (date) => {
		const today = new Date()
		return date.getDate() === today.getDate() &&
			   date.getMonth() === today.getMonth() &&
			   date.getFullYear() === today.getFullYear()
	}

	const isPastDate = (date) => {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		date.setHours(0, 0, 0, 0)
		return date < today
	}

	const isSameDate = (date1, date2) => {
		return date1.getDate() === date2.getDate() &&
			   date1.getMonth() === date2.getMonth() &&
			   date1.getFullYear() === date2.getFullYear()
	}

	const formatDate = (date) => {
		// Fix timezone issue by using local date formatting instead of UTC
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	const getAppointmentsForDate = (dateString) => {
		return appointments.filter(apt => apt.date === dateString)
	}

	const handleDateClick = (date) => {
		const isOtherMonth = date.getMonth() !== currentDate.getMonth()
		const isPast = isPastDate(date)
		
		if (!isOtherMonth && !isPast) {
			onDateSelect(date)
		}
	}

	return (
		<div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
			{/* Calendar Header */}
			<div className="grid grid-cols-7 gap-2 mb-4">
				{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
					<div key={day} className="text-center font-semibold text-gray-600 py-3 text-sm">
						{day}
					</div>
				))}
			</div>

			{/* Calendar Grid */}
			<div className="grid grid-cols-7 gap-2">
				{calendarDays.map((date, index) => {
					const isOtherMonth = date.getMonth() !== currentDate.getMonth()
					const isPast = isPastDate(date)
					const isTodayDate = isToday(date)
					const isSelected = selectedDate && isSameDate(date, selectedDate)
					const dateString = formatDate(date)
					const dayAppointments = getAppointmentsForDate(dateString)
					const hasAppointments = dayAppointments.length > 0

					let className = "aspect-square border border-gray-200 rounded-lg p-2 cursor-pointer transition-all relative bg-white hover:bg-gray-50 hover:border-gray-300 hover:transform hover:-translate-y-0.5 hover:shadow-md"

					if (isOtherMonth) className += " text-gray-400 bg-gray-50"
					if (isPast) className += " text-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
					if (isTodayDate) className += " bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-500"
					if (isSelected) className += " bg-green-500 text-white border-green-500"
					if (hasAppointments && !isTodayDate && !isSelected) className += " bg-red-100 border-red-200"

					return (
						<div
							key={index}
							className={className}
							onClick={() => handleDateClick(date)}
						>
							<div className="font-semibold text-sm">
								{date.getDate()}
							</div>
							
							{hasAppointments && (
								<div className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-bold">
									{dayAppointments.length}
								</div>
							)}
							
							{hasAppointments && !isTodayDate && !isSelected && (
								<div className="absolute bottom-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default CalendarGrid
