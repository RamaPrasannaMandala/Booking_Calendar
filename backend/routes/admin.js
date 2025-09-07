const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(adminAuth);

// Get all appointments across all users
router.get('/appointments', async (req, res) => {
  try {
    const { date, status, userId, workspaceId } = req.query;
    const query = {};
    
    if (date) query.date = date;
    if (status) query.status = status;
    if (userId) query.userId = userId;
    if (workspaceId) query.workspaceId = workspaceId;
    
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
        workspace: apt.workspaceId,
        createdAt: apt.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

// Get appointment statistics
router.get('/statistics', async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    
    const totalUsers = await User.countDocuments();
    const totalWorkspaces = await Workspace.countDocuments();
    
    // Get appointments by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAppointments = await Appointment.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).countDocuments();
    
    res.json({
      statistics: {
        totalAppointments,
        confirmedAppointments,
        cancelledAppointments,
        completedAppointments,
        totalUsers,
        totalWorkspaces,
        recentAppointments
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { role, isActive } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const users = await User.find(query)
      .select('-password')
      .populate('workspaceId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Update user role
router.put('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'User role updated successfully',
      user 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// Get all workspaces
router.get('/workspaces', async (req, res) => {
  try {
    const workspaces = await Workspace.find()
      .populate('ownerId', 'name email')
      .populate('members.userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ workspaces });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspaces.' });
  }
});

// Delete appointment (admin can delete any appointment)
router.delete('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete appointment.' });
  }
});

// Update appointment (admin can update any appointment)
router.put('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
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

module.exports = router;

