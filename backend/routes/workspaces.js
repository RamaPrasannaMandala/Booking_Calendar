const express = require('express');
const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const workspaceAuth = require('../middleware/workspaceAuth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get user's workspaces
router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { ownerId: req.user._id },
        { 'members.userId': req.user._id }
      ]
    })
    .populate('ownerId', 'name email')
    .populate('members.userId', 'name email')
    .sort({ updatedAt: -1 });
    
    res.json({ workspaces });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspaces.' });
  }
});

// Create new workspace
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const workspace = new Workspace({
      name,
      description,
      ownerId: req.user._id,
      members: []
    });
    
    await workspace.save();
    
    // Update user's workspaceId
    await User.findByIdAndUpdate(req.user._id, { workspaceId: workspace._id });
    
    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('ownerId', 'name email')
      .populate('members.userId', 'name email');
    
    res.status(201).json({
      message: 'Workspace created successfully',
      workspace: populatedWorkspace
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to create workspace.' });
  }
});

// Get workspace details
router.get('/:workspaceId', workspaceAuth, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId)
      .populate('ownerId', 'name email')
      .populate('members.userId', 'name email');
    
    res.json({ workspace });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspace.' });
  }
});

// Update workspace
router.put('/:workspaceId', workspaceAuth, async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    
    // Only owner can update workspace details
    if (req.workspaceRole !== 'owner') {
      return res.status(403).json({ error: 'Only workspace owner can update workspace details.' });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (settings !== undefined) updateData.settings = settings;
    
    const workspace = await Workspace.findByIdAndUpdate(
      req.params.workspaceId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('ownerId', 'name email')
    .populate('members.userId', 'name email');
    
    res.json({
      message: 'Workspace updated successfully',
      workspace
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Failed to update workspace.' });
  }
});

// Add member to workspace
router.post('/:workspaceId/members', workspaceAuth, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;
    
    // Only owner and admins can add members
    if (!['owner', 'admin'].includes(req.workspaceRole)) {
      return res.status(403).json({ error: 'Insufficient permissions to add members.' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Check if user is already a member
    const isAlreadyMember = req.workspace.members.some(
      member => member.userId.toString() === user._id.toString()
    );
    
    if (isAlreadyMember) {
      return res.status(400).json({ error: 'User is already a member of this workspace.' });
    }
    
    // Add member
    req.workspace.members.push({
      userId: user._id,
      role
    });
    
    await req.workspace.save();
    
    // Update user's workspaceId if they don't have one
    if (!user.workspaceId) {
      await User.findByIdAndUpdate(user._id, { workspaceId: req.workspace._id });
    }
    
    const updatedWorkspace = await Workspace.findById(req.workspace._id)
      .populate('ownerId', 'name email')
      .populate('members.userId', 'name email');
    
    res.json({
      message: 'Member added successfully',
      workspace: updatedWorkspace
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member.' });
  }
});

// Remove member from workspace
router.delete('/:workspaceId/members/:userId', workspaceAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only owner can remove members
    if (req.workspaceRole !== 'owner') {
      return res.status(403).json({ error: 'Only workspace owner can remove members.' });
    }
    
    // Cannot remove owner
    if (req.workspace.ownerId.toString() === userId) {
      return res.status(400).json({ error: 'Cannot remove workspace owner.' });
    }
    
    req.workspace.members = req.workspace.members.filter(
      member => member.userId.toString() !== userId
    );
    
    await req.workspace.save();
    
    const updatedWorkspace = await Workspace.findById(req.workspace._id)
      .populate('ownerId', 'name email')
      .populate('members.userId', 'name email');
    
    res.json({
      message: 'Member removed successfully',
      workspace: updatedWorkspace
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member.' });
  }
});

// Get workspace appointments
router.get('/:workspaceId/appointments', workspaceAuth, async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = { workspaceId: req.params.workspaceId };
    
    if (date) query.date = date;
    if (status) query.status = status;
    
    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
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
        user: apt.userId
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspace appointments.' });
  }
});

// Create workspace appointment
router.post('/:workspaceId/appointments', workspaceAuth, async (req, res) => {
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
    
    // Check permissions
    if (!req.workspace.settings.allowMemberBooking && req.workspaceRole === 'viewer') {
      return res.status(403).json({ error: 'Viewers cannot create appointments.' });
    }
    
    // Check for time conflicts
    const endTime = addMinutesToTime(time, duration);
    const existingAppointments = await Appointment.find({
      workspaceId: req.params.workspaceId,
      date,
      status: { $ne: 'cancelled' }
    });
    
    const hasConflict = existingAppointments.some(appointment => {
      const appointmentEndTime = addMinutesToTime(appointment.time, appointment.duration);
      return doTimeRangesOverlap(time, endTime, appointment.time, appointmentEndTime);
    });
    
    if (hasConflict) {
      return res.status(400).json({ error: 'This time slot conflicts with an existing appointment.' });
    }
    
    const appointment = new Appointment({
      userId: req.user._id,
      workspaceId: req.params.workspaceId,
      title,
      date,
      time,
      duration,
      customerName,
      customerEmail,
      notes
    });
    
    await appointment.save();
    
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('userId', 'name email');
    
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: {
        _id: populatedAppointment._id,
        title: populatedAppointment.title,
        date: populatedAppointment.date,
        time: populatedAppointment.time,
        duration: populatedAppointment.duration,
        endTime: populatedAppointment.endTime,
        customerName: populatedAppointment.customerName,
        customerEmail: populatedAppointment.customerEmail,
        notes: populatedAppointment.notes,
        status: populatedAppointment.status,
        user: populatedAppointment.userId
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

// Helper functions
const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

const doTimeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

module.exports = router;

