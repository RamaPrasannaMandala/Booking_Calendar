const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper function to generate time slots
const generateTimeSlots = (startTime = '09:00', endTime = '18:00', slotDuration = 30) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push(time);
    
    currentMinute += slotDuration;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  
  return slots;
};

// Helper function to add minutes to time
const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

// Helper function to check if time is in past
const isTimeInPast = (date, time) => {
  const now = new Date();
  const appointmentDate = new Date(date + 'T' + time);
  return appointmentDate < now;
};

// Get shared calendar by share ID (public endpoint)
router.get('/shared/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    const { date } = req.query;
    
    // Find user by share ID
    const user = await User.findOne({ calendarShareId: shareId, isActive: true });
    if (!user) {
      return res.status(404).json({ error: 'Calendar not found or inactive.' });
    }
    
    // Get appointments for the specified date
    const appointments = await Appointment.find({
      userId: user._id,
      date: date || new Date().toISOString().split('T')[0],
      status: { $ne: 'cancelled' }
    }).sort({ time: 1 });
    
    // Get availability for the date
    const availability = await Availability.findOne({
      userId: user._id,
      date: date || new Date().toISOString().split('T')[0]
    });
    
    // Generate available time slots
    let timeSlots = [];
    if (availability && availability.isCustomDay) {
      timeSlots = generateTimeSlots(
        availability.customStartTime,
        availability.customEndTime,
        availability.customSlotDuration
      );
    } else {
      timeSlots = generateTimeSlots(); // Default 9 AM to 6 PM, 30-min slots
    }
    
    // Filter out unavailable slots
    if (availability && availability.unavailableSlots.length > 0) {
      timeSlots = timeSlots.filter(slot => !availability.unavailableSlots.includes(slot));
    }
    
    // Mark booked slots
    const bookedSlots = appointments.map(apt => apt.time);
    const availableSlots = timeSlots.filter(slot => !bookedSlots.includes(slot));
    
    // Filter out past times for today
    const today = new Date().toISOString().split('T')[0];
    const currentDate = date || today;
    const currentTimeSlots = currentDate === today ? 
      availableSlots.filter(slot => !isTimeInPast(currentDate, slot)) : 
      availableSlots;
    
    res.json({
      user: {
        name: user.name,
        calendarShareId: user.calendarShareId
      },
      date: currentDate,
      appointments: appointments.map(apt => ({
        id: apt._id,
        title: apt.title,
        time: apt.time,
        duration: apt.duration,
        endTime: addMinutesToTime(apt.time, apt.duration)
      })),
      availableSlots: currentTimeSlots,
      bookedSlots,
      unavailableSlots: availability ? availability.unavailableSlots : []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared calendar.' });
  }
});

// Book appointment through shared calendar (public endpoint)
router.post('/shared/:shareId/book', async (req, res) => {
  try {
    const { shareId } = req.params;
    const {
      title,
      date,
      time,
      duration,
      customerName,
      customerEmail,
      notes
    } = req.body;
    
    // Find user by share ID
    const user = await User.findOne({ calendarShareId: shareId, isActive: true });
    if (!user) {
      return res.status(404).json({ error: 'Calendar not found or inactive.' });
    }
    
    // Check if time slot is available
    const appointments = await Appointment.find({
      userId: user._id,
      date,
      status: { $ne: 'cancelled' }
    });
    
    // Check for conflicts
    const endTime = addMinutesToTime(time, duration);
    const hasConflict = appointments.some(appointment => {
      const appointmentEndTime = addMinutesToTime(appointment.time, appointment.duration);
      return (time < appointmentEndTime && endTime > appointment.time);
    });
    
    if (hasConflict) {
      return res.status(400).json({ error: 'This time slot is already booked.' });
    }
    
    // Check if time slot is unavailable
    const availability = await Availability.findOne({ userId: user._id, date });
    if (availability && availability.unavailableSlots.includes(time)) {
      return res.status(400).json({ error: 'This time slot is unavailable.' });
    }
    
    // Check if time is in past
    if (isTimeInPast(date, time)) {
      return res.status(400).json({ error: 'Cannot book appointments in the past.' });
    }
    
    // Create appointment
    const appointment = new Appointment({
      userId: user._id,
      title,
      date,
      time,
      duration,
      customerName,
      customerEmail,
      notes,
      isSharedBooking: true
    });
    
    await appointment.save();
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: {
        id: appointment._id,
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        endTime: addMinutesToTime(appointment.time, appointment.duration),
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        notes: appointment.notes
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to book appointment.' });
  }
});

// Get availability for authenticated user
router.get('/availability', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const query = { userId: req.user._id };
    
    if (date) query.date = date;
    
    const availability = await Availability.find(query).sort({ date: 1 });
    res.json({ availability });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch availability.' });
  }
});

// Set or update availability for a specific date
router.post('/availability', auth, async (req, res) => {
  try {
    const { date, unavailableSlots, isCustomDay, customStartTime, customEndTime, customSlotDuration } = req.body;
    
    // Validate input
    if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    
    if (isCustomDay) {
      if (!customStartTime || !customEndTime || !customSlotDuration) {
        return res.status(400).json({ error: 'Custom day requires start time, end time, and slot duration.' });
      }
      if (!customStartTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) || 
          !customEndTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        return res.status(400).json({ error: 'Invalid time format. Use HH:MM.' });
      }
      if (customSlotDuration < 15 || customSlotDuration > 120) {
        return res.status(400).json({ error: 'Slot duration must be between 15 and 120 minutes.' });
      }
    }
    
    // Find existing availability or create new one
    let availability = await Availability.findOne({ userId: req.user._id, date });
    
    if (availability) {
      // Update existing availability
      if (unavailableSlots !== undefined) availability.unavailableSlots = unavailableSlots || [];
      if (isCustomDay !== undefined) availability.isCustomDay = isCustomDay;
      if (customStartTime !== undefined) availability.customStartTime = customStartTime;
      if (customEndTime !== undefined) availability.customEndTime = customEndTime;
      if (customSlotDuration !== undefined) availability.customSlotDuration = customSlotDuration;
    } else {
      // Create new availability
      availability = new Availability({
        userId: req.user._id,
        date,
        unavailableSlots: unavailableSlots || [],
        isCustomDay: isCustomDay || false,
        customStartTime: customStartTime || '09:00',
        customEndTime: customEndTime || '18:00',
        customSlotDuration: customSlotDuration || 30
      });
    }
    
    await availability.save();
    
    res.json({
      message: 'Availability updated successfully',
      availability
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to update availability.' });
  }
});

// Delete availability for a specific date
router.delete('/availability/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    
    const availability = await Availability.findOneAndDelete({
      userId: req.user._id,
      date
    });
    
    if (!availability) {
      return res.status(404).json({ error: 'Availability not found.' });
    }
    
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete availability.' });
  }
});

// Get user's share ID
router.get('/share-id', auth, async (req, res) => {
  try {
    res.json({
      shareId: req.user.calendarShareId,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}?share=${req.user.calendarShareId}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get share ID.' });
  }
});

module.exports = router;