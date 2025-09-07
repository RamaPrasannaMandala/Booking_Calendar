# Email Setup Guide

This guide will help you configure email functionality for appointment confirmations.

## Gmail Setup (Recommended for Development)

### 1. Enable 2-Step Verification
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

### 2. Generate App Password
1. In Security settings, find "App passwords"
2. Click "Generate" for a new app password
3. Select "Mail" as the app type
4. Copy the generated 16-character password

### 3. Update Environment Variables
Edit `backend/config.env`:
```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## Other Email Services

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom SMTP Server
```env
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
EMAIL_SECURE=false
```

## Testing Email Functionality

1. Start the backend server
2. Book an appointment with a customer email address
3. Check the console for email sending status
4. Check the customer's email inbox for the confirmation

## Troubleshooting

### Common Issues:
- **"Invalid login"**: Check your email and password
- **"Less secure app access"**: Use App Passwords instead of regular passwords
- **"Authentication failed"**: Ensure 2-Step Verification is enabled for Gmail

### For Production:
- Use a dedicated email service like SendGrid, Mailgun, or AWS SES
- Set up proper SPF, DKIM, and DMARC records
- Use environment variables for sensitive credentials

## Email Template Customization

The email template is located in `backend/utils/emailService.js`. You can customize:
- Email subject line
- HTML template design
- Email content and styling
- Company branding and colors

