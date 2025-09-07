import { useState, useEffect, useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import AuthContext from '../../contexts/AuthContext'
import AuthContainer from '../Auth/AuthContainer'
import MainCalendar from './MainCalendar'
import ConfirmationModal from '../Modals/ConfirmationModal'
import ShareModal from '../Modals/ShareModal'

const AppointmentCalendar = () => {
	const { currentUser } = useContext(AuthContext)
	const [searchParams] = useSearchParams()
	const [isSharedView, setIsSharedView] = useState(false)
	const [shareId, setShareId] = useState(null)

	useEffect(() => {
		// Check if this is a shared view
		const shareParam = searchParams.get('share')
		if (shareParam) {
			setIsSharedView(true)
			setShareId(shareParam)
		}
	}, [searchParams])

	// If it's a shared view, show the main calendar without authentication
	if (isSharedView) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
				<MainCalendar isSharedView={true} shareId={shareId} />
			</div>
		)
	}

	// If user is not authenticated, show auth container
	if (!currentUser) {
		// Also check if token exists in localStorage
		const token = localStorage.getItem('token')
		if (!token) {
			return (
				<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
					<AuthContainer />
				</div>
			)
		}
	}

	// Show main calendar for authenticated users
	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
			<MainCalendar isSharedView={false} />
		</div>
	)
}

export default AppointmentCalendar

