# Appointment Calendar Backend

A Node.js/Express backend for the Appointment Calendar application with MongoDB database, JWT authentication, and shared calendar functionality.

## 🚀 Features

- **User Authentication**: Register, login, and profile management
- **Appointment Management**: Create, read, update, delete appointments
- **Availability Management**: Set custom availability for specific dates
- **Shared Calendar**: Public endpoints for sharing calendar and booking appointments
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: Persistent data storage
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Proper error responses and logging

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/)

### 2. Install MongoDB

#### Windows:
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install MongoDB as a service
3. MongoDB will run on `mongodb://localhost:27017`

#### macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu):
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 3. Clone and Setup Project

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp config.env .env
```

### 4. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/appointment-calendar

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/today` - Get today's appointments
- `GET /api/appointments/date/:date` - Get appointments for specific date
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/:id` - Get single appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Calendar & Availability
- `GET /api/calendar/availability` - Get user availability
- `POST /api/calendar/availability` - Set availability for date
- `DELETE /api/calendar/availability/:date` - Delete availability for date
- `GET /api/calendar/share-id` - Get user's share ID

### Shared Calendar (Public)
- `GET /api/calendar/shared/:shareId` - Get shared calendar data
- `POST /api/calendar/shared/:shareId/book` - Book appointment through shared calendar

## 🔧 Frontend Integration

To connect your frontend to this backend:

1. **Update API Base URL**: Change your frontend API calls to point to `http://localhost:5000/api`

2. **Authentication Flow**:
   ```javascript
   // Login
   const response = await fetch('http://localhost:5000/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, password })
   });
   const { token, user } = await response.json();
   
   // Store token
   localStorage.setItem('token', token);
   ```

3. **Authenticated Requests**:
   ```javascript
   // Include token in headers
   const response = await fetch('http://localhost:5000/api/appointments', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`,
       'Content-Type': 'application/json'
     }
   });
   ```

## 🗄️ Database Schema

### User
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `calendarShareId` (String, unique)
- `isActive` (Boolean, default: true)
- `lastLogin` (Date)

### Appointment
- `userId` (ObjectId, ref: User)
- `title` (String, required)
- `date` (String, YYYY-MM-DD format)
- `time` (String, HH:MM format)
- `duration` (Number, minutes)
- `customerName` (String, required)
- `customerEmail` (String, required)
- `notes` (String, optional)
- `status` (String, enum: confirmed/cancelled/completed)
- `isSharedBooking` (Boolean, default: false)

### Availability
- `userId` (ObjectId, ref: User)
- `date` (String, YYYY-MM-DD format)
- `unavailableSlots` (Array of Strings, HH:MM format)
- `isCustomDay` (Boolean, default: false)
- `customStartTime` (String, HH:MM format)
- `customEndTime` (String, HH:MM format)
- `customSlotDuration` (Number, minutes)

## 🔒 Security Features

- **Password Hashing**: Using bcryptjs
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Comprehensive validation
- **Rate Limiting**: Prevents abuse
- **CORS Protection**: Configured for frontend
- **Helmet**: Security headers

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/api/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/appointment-calendar
JWT_SECRET=your-very-secure-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

### PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name "appointment-calendar"
pm2 save
pm2 startup
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
