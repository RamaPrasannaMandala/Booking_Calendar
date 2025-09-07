const nodemailer = require('nodemailer')
require('dotenv').config()

console.log('🔧 Testing email configuration...')
console.log('Email User:', process.env.EMAIL_USER)
console.log('Has Password:', !!process.env.EMAIL_PASS)

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

// Test email sending
const testEmail = async () => {
  try {
    console.log('📧 Creating transporter...')
    const transporter = createTransporter()
    
    console.log('📧 Verifying transporter...')
    await transporter.verify()
    console.log('✅ Transporter verified successfully!')
    
    console.log('📧 Sending test email...')
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email - Appointment Calendar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">Test Email</h1>
          <p>This is a test email to verify that the email configuration is working correctly.</p>
          <p>If you receive this email, the email service is properly configured!</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Test email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Response:', info.response)
    
  } catch (error) {
    console.error('❌ Error testing email:', error.message)
    console.error('Full error:', error)
    
    // Provide specific troubleshooting advice
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Authentication Error - Possible solutions:')
      console.log('1. Check if 2-Step Verification is enabled on your Gmail account')
      console.log('2. Generate a new App Password:')
      console.log('   - Go to Google Account settings > Security')
      console.log('   - Find "App passwords" and generate a new one')
      console.log('   - Update EMAIL_PASS in your .env file')
      console.log('3. Make sure you\'re using the App Password, not your regular Gmail password')
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 Connection Error - Possible solutions:')
      console.log('1. Check your internet connection')
      console.log('2. Try using a different email service (Outlook, Yahoo, etc.)')
      console.log('3. Check if Gmail SMTP is blocked by your network')
    }
  }
}

testEmail()
