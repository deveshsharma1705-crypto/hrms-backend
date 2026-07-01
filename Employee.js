const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, required: true }, // e.g. EMP-0001
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed
    phone: String,
    role: {
      type: String,
      enum: ['employee', 'manager', 'hr_admin'],
      default: 'employee',
    },
    department: String,
    designation: String,
    dateOfJoining: Date,
    reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    status: {
      type: String,
      enum: ['onboarding', 'active', 'notice_period', 'exited'],
      default: 'onboarding',
    },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'intern'],
      default: 'full_time',
    },
    dateOfBirth: Date,
    address: String,
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    profilePhotoUrl: String,
    exitDetails: {
      resignationDate: Date,
      lastWorkingDay: Date,
      clearanceStatus: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
      },
      fnfStatus: {
        type: String,
        enum: ['pending', 'processed'],
      },
      reasonForLeaving: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
