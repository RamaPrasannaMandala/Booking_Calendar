const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  unavailableSlots: [{
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  }],
  isCustomDay: {
    type: Boolean,
    default: false
  },
  customStartTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  customEndTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format']
  },
  customSlotDuration: {
    type: Number,
    min: [15, 'Slot duration must be at least 15 minutes'],
    max: [120, 'Slot duration cannot exceed 2 hours'],
    default: 30
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
availabilitySchema.index({ userId: 1, date: 1 }, { unique: true });

// Method to check if a time slot is available
availabilitySchema.methods.isTimeSlotAvailable = function(time) {
  return !this.unavailableSlots.includes(time);
};

// Method to add unavailable time slot
availabilitySchema.methods.addUnavailableSlot = function(time) {
  if (!this.unavailableSlots.includes(time)) {
    this.unavailableSlots.push(time);
    this.unavailableSlots.sort();
  }
  return this;
};

// Method to remove unavailable time slot
availabilitySchema.methods.removeUnavailableSlot = function(time) {
  const index = this.unavailableSlots.indexOf(time);
  if (index > -1) {
    this.unavailableSlots.splice(index, 1);
  }
  return this;
};

module.exports = mongoose.model('Availability', availabilitySchema);
