
import { useState, useContext } from 'react'
import AuthContext from '../../contexts/AuthContext'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

const AuthContainer = () => {
	const [showSignup, setShowSignup] = useState(false)

	return (
		<div className="flex items-center justify-center min-h-screen p-5">
			<div className="bg-white/95 backdrop-blur-md rounded-2xl p-10 shadow-2xl max-w-md w-full">
				<div className="text-center mb-8">
					<h1 className="text-gray-800 text-3xl font-bold mb-2">Appointment Calendar</h1>
					<p className="text-gray-600">Sign in to manage your appointments</p>
				</div>
				
				{showSignup ? (
					<SignupForm onShowLogin={() => setShowSignup(false)} />
				) : (
					<LoginForm onShowSignup={() => setShowSignup(true)} />
				)}
			</div>
		</div>
	)
}

export default AuthContainer
