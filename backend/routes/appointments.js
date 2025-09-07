const express = require('express');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');
const { sendAppointmentConfirmation } = require('../utils/emailService');

const router = express.Router();

// Helper function to add minutes to time
const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

// Helper function to check if time ranges overlap
const doTimeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

// Helper function to check time conflicts
const checkTimeConflict = async (userId, date, time, duration, excludeId = null) => {
  const endTime = addMinutesToTime(time, duration);
  
  const query = {
    userId,
    date,
    status: { $ne: 'cancelled' }
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const existingAppointments = await Appointment.find(query);
  
  return existingAppointments.some(appointment => {
    const appointmentEndTime = addMinutesToTime(appointment.time, appointment.duration);
    return doTimeRangesOverlap(time, endTime, appointment.time, appointmentEndTime);
  });
};

// Get all appointments for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { date, status, includeWorkspace, showAll } = req.query;
    let query = {};
    
    if (date) query.date = date;
    if (status) query.status = status;
    
    // If showAll is true, show all appointments across all users
    if (showAll === 'true') {
      // Don't filter by userId - show all appointments
      // For now, let's show user's own appointments even with showAll=true
      query.userId = req.user._id;
    } else {
      // Default behavior: show user's own appointments
      query.userId = req.user._id;
      
      // If user wants to include workspace appointments
      if (includeWorkspace === 'true' && req.user.workspaceId) {
        query.$or = [
          { userId: req.user._id },
          { workspaceId: req.user.workspaceId }
        ];
        delete query.userId; // Remove userId since we're using $or
      }
    }
    
    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .populate('workspaceId', 'name')
      .sort({ date: 1, time: 1 });
    
    res.json({ 
      appointments: appointments.map(apt => ({
        _id: apt._id,
        title: apt.title,
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        endTime: apt.endTime,
        customerName: apt.customerName,
        customerEmail: apt.customerEmail,
        notes: apt.notes,
        status: apt.status,
        user: apt.userId,
        workspace: apt.workspaceId
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

// Get appointments for a specific date
router.get('/date/:date', auth, async (req, res) => {
  try {
    const { date } = req.params;
    const appointments = await Appointment.find({
      userId: req.user._id,
      date,
      status: { $ne: 'cancelled' }
    }).sort({ time: 1 });
    
    res.json({ 
      appointments: appointments.map(apt => ({
        _id: apt._id,
        title: apt.title,
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        endTime: apt.endTime,
        customerName: apt.customerName,
        customerEmail: apt.customerEmail,
        notes: apt.notes,
        status: apt.status
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments for date.' });
  }
});

// Create new appointment
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      date,
      time,
      duration,
      customerName,
      customerEmail,
      notes
    } = req.body;

    // Check for time conflicts
    const hasConflict = await checkTimeConflict(req.user._id, date, time, duration);
    if (hasConflict) {
      return res.status(400).json({ error: 'This time slot conflicts with an existing appointment.' });
    }

    // Check if time slot is unavailable
    const availability = await Availability.findOne({ userId: req.user._id, date });
    if (availability && availability.unavailableSlots.includes(time)) {
      return res.status(400).json({ error: 'This time slot is unavailable.' });
    }

    const appointment = new Appointment({
      userId: req.user._id,
      title,
      date,
      time,
      duration,
      customerName,
      customerEmail,
      notes
    });

    await appointment.save();

    // Send confirmation email if customer email is provided
    let emailSent = false;
    if (customerEmail) {
      try {
        emailSent = await sendAppointmentConfirmation(
          {
            title,
            date,
            time,
            duration,
            customerName,
            customerEmail,
            notes
          },
          {
            name: req.user.name,
            email: req.user.email
          }
        );
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the appointment creation if email fails
      }
    }

    res.status(201).json({
      message: 'Appointment created successfully',
      emailSent: emailSent,
      appointment: {
        _id: appointment._id,
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        endTime: appointment.endTime,
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        notes: appointment.notes,
        status: appointment.status,
        user: {
          _id: req.user._id,
          name: req.user.name,
          email: req.user.email
        }
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to create appointment.' });
  }
});

router.get('/today', auth, async (req, res) => {
  try {
    console.log("today's appointments")
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching appointments for user:', req.user._id, 'on date:', today); // Debug
    const appointments = await Appointment.find({
      userId: req.user._id,
      date: today,
      status: { $ne: 'cancelled' }
    }).sort({ time: 1 });
    console.log('Appointments found:', appointments); // Debug
    res.json({ 
      appointments: appointments.map(apt => {
        console.log('Mapping appointment:', apt); // Debug
        return {
          _id: apt._id,
          title: apt.title,
          date: apt.date,
          time: apt.time,
          duration: apt.duration,
          endTime: apt.endTime, // Virtual field
          customerName: apt.customerName,
          customerEmail: apt.customerEmail,
          notes: apt.notes,
          status: apt.status
        };
      })
    });
  } catch (error) {
    console.error('Error in /appointments/today:', error); // Debug
    res.status(500).json({ error: 'Failed to fetch today\'s appointments.' });
  }
});

// Get single appointment
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.json({ 
      appointment: {
        _id: appointment._id,
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        endTime: appointment.endTime,
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        notes: appointment.notes,
        status: appointment.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointment.' });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    // First, find the appointment to check permissions
    const appointment = await Appointment.findById(req.params.id).populate('userId', 'email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    // Check if user has permission to update this appointment
    const isAdmin = req.user.email === 'ramaprasanna2709@gmail.com';
    const isOwner = appointment.userId._id.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        error: 'Access denied. You can only update your own appointments.' 
      });
    }

    const {
      title,
      date,
      time,
      duration,
      customerName,
      customerEmail,
      notes,
      status
    } = req.body;

    // Check for time conflicts if time/date/duration changed
    if ((date && date !== appointment.date) || 
        (time && time !== appointment.time) || 
        (duration && duration !== appointment.duration)) {
      const hasConflict = await checkTimeConflict(
        req.user._id, 
        date || appointment.date, 
        time || appointment.time, 
        duration || appointment.duration,
        appointment._id
      );
      
      if (hasConflict) {
        return res.status(400).json({ error: 'This time slot conflicts with an existing appointment.' });
      }
    }

    // Update fields
    if (title !== undefined) appointment.title = title;
    if (date !== undefined) appointment.date = date;
    if (time !== undefined) appointment.time = time;
    if (duration !== undefined) appointment.duration = duration;
    if (customerName !== undefined) appointment.customerName = customerName;
    if (customerEmail !== undefined) appointment.customerEmail = customerEmail;
    if (notes !== undefined) appointment.notes = notes;
    if (status !== undefined) appointment.status = status;

    await appointment.save();

    res.json({
      message: 'Appointment updated successfully',
      appointment: {
        _id: appointment._id,
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        endTime: appointment.endTime,
        customerName: appointment.customerName,
        customerEmail: appointment.customerEmail,
        notes: appointment.notes,
        status: appointment.status
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to update appointment.' });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    // First, find the appointment to check permissions
    const appointment = await Appointment.findById(req.params.id).populate('userId', 'email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    // Check if user has permission to delete this appointment
    const isAdmin = req.user.email === 'ramaprasanna2709@gmail.com';
    const isOwner = appointment.userId._id.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        error: 'Access denied. You can only delete your own appointments.' 
      });
    }

    // Delete the appointment
    await Appointment.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Appointment deleted successfully',
      deletedBy: isAdmin ? 'admin' : 'owner'
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment.' });
  }
});

// Get today's appointments
// router.get('/today', auth, async (req, res) => {
//   try {
//     const today = new Date().toISOString().split('T')[0];
//     const appointments = await Appointment.find({
//       userId: req.user._id,
//       date: today,
//       status: { $ne: 'cancelled' }
//     }).sort({ time: 1 });

//     res.json({ 
//       appointments: appointments.map(apt => ({
//         _id: apt._id,
//         title: apt.title,
//         date: apt.date,
//         time: apt.time,
//         duration: apt.duration,
//         endTime: apt.endTime,
//         customerName: apt.customerName,
//         customerEmail: apt.customerEmail,
//         notes: apt.notes,
//         status: apt.status
//       }))
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch today\'s appointments.' });
//   }
// });

module.exports = router;