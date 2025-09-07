const nodemailer = require('nodemailer')

// Create transporter for sending emails
const createTransporter = () => {
  console.log('🔧 Creating email transporter with:', {
    user: process.env.EMAIL_USER,
    hasPassword: !!process.env.EMAIL_PASS
  })
  
  // For development, we'll use a test account
  // In production, you would use real SMTP credentials
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  })
}

// Send appointment confirmation email
const sendAppointmentConfirmation = async (appointmentData, userData) => {
  try {
    console.log('📧 Attempting to send email with data:', {
      to: appointmentData.customerEmail,
      from: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_PASS
    })
    
    const transporter = createTransporter()
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: appointmentData.customerEmail,
      subject: `Appointment Confirmation - ${appointmentData.title || 'Your Appointment'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Appointment Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your appointment has been successfully scheduled</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Appointment Details</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #667eea; margin-top: 0;">${appointmentData.title || 'Appointment'}</h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
                <div>
                  <strong style="color: #666;">Date:</strong><br>
                  <span style="color: #333;">${formatDate(appointmentData.date)}</span>
                </div>
                <div>
                  <strong style="color: #666;">Time:</strong><br>
                  <span style="color: #333;">${formatTime(appointmentData.time)} - ${formatTime(addMinutesToTime(appointmentData.time, appointmentData.duration || 30))}</span>
                </div>
                <div>
                  <strong style="color: #666;">Duration:</strong><br>
                  <span style="color: #333;">${appointmentData.duration || 30} minutes</span>
                </div>
                <div>
                  <strong style="color: #666;">Booked by:</strong><br>
                  <span style="color: #333;">${userData.name} (${userData.email})</span>
                </div>
              </div>
              
              ${appointmentData.customerName ? `
                <div style="margin-top: 15px;">
                  <strong style="color: #666;">Customer:</strong><br>
                  <span style="color: #333;">${appointmentData.customerName}</span>
                </div>
              ` : ''}
              
              ${appointmentData.notes ? `
                <div style="margin-top: 15px;">
                  <strong style="color: #666;">Notes:</strong><br>
                  <span style="color: #333; font-style: italic;">${appointmentData.notes}</span>
                </div>
              ` : ''}
            </div>
            
            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
              <p style="margin: 0; color: #155724;">
                <strong>✓ Your appointment is confirmed!</strong><br>
                Please arrive 5 minutes before your scheduled time.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
              <p style="margin: 0;">
                If you need to reschedule or cancel, please contact us as soon as possible.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">
                This is an automated confirmation email. Please do not reply to this message.
              </p>
            </div>
          </div>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully:', info.messageId)
    return true
  } catch (error) {
    console.error('❌ Error sending email:', error)
    return false
  }
}

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('en-US', options)
}

// Helper function to format time
const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

// Helper function to add minutes to time
const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}

module.exports = {
  sendAppointmentConfirmation
}
