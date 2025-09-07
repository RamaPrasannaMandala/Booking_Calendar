import { useState, useContext } from 'react'
import AuthContext from '../../contexts/AuthContext'
import axios from 'axios'

const SignupForm = ({ onShowLogin }) => {
	const { login } = useContext(AuthContext)
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: ''
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		})
		setError('')
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match')
			setLoading(false)
			return
		}

		// Validate password length
		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters long')
			setLoading(false)
			return
		}

		try {
			const response = await axios.post('/auth/register', {
				name: formData.name,
				email: formData.email,
				password: formData.password
			})
			const { user, token } = response.data
			login(user, token)
		} catch (error) {
			console.error('Signup error:', error)
			setError(error.response?.data?.error || 'Signup failed. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div>
			<h2 className="text-gray-800 text-2xl font-semibold mb-6 text-center">Create Account</h2>
			
			{error && (
				<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			)}
			
			<form onSubmit={handleSubmit}>
				<div className="mb-5">
					<label htmlFor="name" className="block text-gray-700 font-medium text-sm mb-2">
						Full Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						value={formData.name}
						onChange={handleChange}
						className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
						placeholder="Enter your full name"
						required
					/>
				</div>
				
				<div className="mb-5">
					<label htmlFor="email" className="block text-gray-700 font-medium text-sm mb-2">
						Email
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
						placeholder="Enter your email"
						required
					/>
				</div>
				
				<div className="mb-5">
					<label htmlFor="password" className="block text-gray-700 font-medium text-sm mb-2">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						value={formData.password}
						onChange={handleChange}
						className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
						placeholder="Create a password"
						required
					/>
				</div>
				
				<div className="mb-5">
					<label htmlFor="confirmPassword" className="block text-gray-700 font-medium text-sm mb-2">
						Confirm Password
					</label>
					<input
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						value={formData.confirmPassword}
						onChange={handleChange}
						className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
						placeholder="Confirm your password"
						required
					/>
				</div>
				
				<div className="mb-5">
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-medium text-base transition-all hover:from-indigo-600 hover:to-purple-700 hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
					>
						{loading ? 'Creating Account...' : 'Create Account'}
					</button>
				</div>
			</form>
			
			<div className="text-center pt-6 border-t border-gray-200">
				<p className="text-gray-600 text-sm">
					Already have an account?{' '}
					<button
						type="button"
						onClick={onShowLogin}
						className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline transition-colors"
					>
						Sign in
					</button>
				</p>
			</div>
		</div>
	)
}

export default SignupForm
