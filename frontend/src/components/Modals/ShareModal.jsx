import { useState, useEffect } from 'react'

const ShareModal = ({ onClose }) => {
	const [shareUrl, setShareUrl] = useState('')
	const [copySuccess, setCopySuccess] = useState(false)

	useEffect(() => {
		// Generate share URL
		let shareId = localStorage.getItem('calendarShareId')
		if (!shareId) {
			shareId = 'cal_' + Date.now().toString(36) + Math.random().toString(36).substr(2)
			localStorage.setItem('calendarShareId', shareId)
		}
		
		const currentUrl = window.location.origin + window.location.pathname
		const fullShareUrl = `${currentUrl}?share=${shareId}`
		setShareUrl(fullShareUrl)
	}, [])

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl)
			setCopySuccess(true)
			setTimeout(() => setCopySuccess(false), 2000)
		} catch (err) {
			// Fallback for older browsers
			const textArea = document.createElement('textarea')
			textArea.value = shareUrl
			document.body.appendChild(textArea)
			textArea.select()
			document.execCommand('copy')
			document.body.removeChild(textArea)
			setCopySuccess(true)
			setTimeout(() => setCopySuccess(false), 2000)
		}
	}

	const handleShareWhatsApp = () => {
		const text = `Check out my appointment calendar and book a time that works for you: ${shareUrl}`
		const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
		window.open(whatsappUrl, '_blank')
	}

	const handleShareEmail = () => {
		const subject = 'Appointment Calendar - Book a Time'
		const body = `Hi there!

I'd like to share my appointment calendar with you. You can view my availability and book a time that works for you.

Calendar Link: ${shareUrl}

Best regards`
		
		const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
		window.open(mailtoUrl)
	}

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
				<div className="p-6">
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-2xl font-bold text-gray-800">Share Your Calendar</h3>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
						>
							×
						</button>
					</div>

					<div className="text-center mb-6">
						<p className="text-gray-600 mb-4">
							Share this link with others to let them view your availability and book appointments:
						</p>
						
						<div className="flex gap-2 mb-6">
							<input
								type="text"
								value={shareUrl}
								readOnly
								className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
							/>
							<button
								onClick={handleCopyLink}
								className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
									copySuccess 
										? 'bg-green-500 text-white' 
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
							>
								{copySuccess ? 'Copied!' : 'Copy'}
							</button>
						</div>

						<div className="flex gap-3 justify-center">
							<button
								onClick={handleShareWhatsApp}
								className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
									<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
								</svg>
								WhatsApp
							</button>
							
							<button
								onClick={handleShareEmail}
								className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
									<polyline points="22,6 12,13 2,6"></polyline>
								</svg>
								Email
							</button>
						</div>
					</div>

					<div className="text-center">
						<button
							onClick={onClose}
							className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all hover:transform hover:-translate-y-0.5 hover:shadow-lg"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ShareModal