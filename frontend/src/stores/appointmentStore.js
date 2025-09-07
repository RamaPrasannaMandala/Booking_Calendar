import { create } from 'zustand'
import axios from 'axios'

export const useAppointmentStore = create((set, get) => ({
	appointments: [],
	loading: false,
	error: null,
	shareId: null,

	loadAppointments: async (shareId = null) => {
		set({ loading: true, error: null })
		try {
			let response
			if (shareId) {
				response = await axios.get(`/calendar/shared/${shareId}`)
			} else {
				// Load all appointments across all users by default
				response = await axios.get('/appointments?showAll=true')
			}
			set({ appointments: response.data.appointments, loading: false })
		} catch (error) {
			console.error('Error loading appointments:', error)
			set({ error: error.response?.data?.error || 'Failed to load appointments', loading: false })
		}
	},

	addAppointment: async (appointmentData, shareId = null) => {
		set({ loading: true, error: null })
		try {
			let response
			if (shareId) {
				response = await axios.post(`/calendar/shared/${shareId}/book`, appointmentData)
			} else {
				response = await axios.post('/appointments', appointmentData)
			}
			
			const newAppointment = response.data.appointment
			set(state => ({
				appointments: [...state.appointments, newAppointment],
				loading: false
			}))
			return response.data // Return the full response to access emailSent
		} catch (error) {
			console.error('Error adding appointment:', error)
			set({ error: error.response?.data?.error || 'Failed to add appointment', loading: false })
			throw error
		}
	},

	deleteAppointment: async (appointmentId, shareId = null) => {
		if (shareId) {
			set({ error: 'Cannot delete appointments in shared view' })
			return
		}
		
		set({ loading: true, error: null })
		try {
			await axios.delete(`/appointments/${appointmentId}`)
			set(state => ({
				appointments: state.appointments.filter(apt => apt._id !== appointmentId),
				loading: false
			}))
		} catch (error) {
			console.error('Error deleting appointment:', error)
			set({ error: error.response?.data?.error || 'Failed to delete appointment', loading: false })
			throw error
		}
	},

	updateAppointment: async (appointmentId, updateData, shareId = null) => {
		if (shareId) {
			set({ error: 'Cannot update appointments in shared view' })
			return
		}
		
		set({ loading: true, error: null })
		try {
			const response = await axios.put(`/appointments/${appointmentId}`, updateData)
			const updatedAppointment = response.data.appointment
			set(state => ({
				appointments: state.appointments.map(apt => 
					apt._id === appointmentId ? updatedAppointment : apt
				),
				loading: false
			}))
			return updatedAppointment
		} catch (error) {
			console.error('Error updating appointment:', error)
			set({ error: error.response?.data?.error || 'Failed to update appointment', loading: false })
			throw error
		}
	},

	setShareId: (shareId) => set({ shareId }),

	clearError: () => set({ error: null })
}))
