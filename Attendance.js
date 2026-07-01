const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    date: { type: Date, required: true },
    clockIn: Date,
    clockOut: Date,
    status: {
      type: String,
      enum: ['present', 'absent', 'half_day', 'wfh', 'on_duty', 'week_off', 'holiday'],
      default: 'present',
    },
    halfDaySession: {
      type: String,
      enum: ['first_half', 'second_half', null],
      default: null,
    },
    workedHours: Number,
    source: {
      type: String,
      enum: ['web', 'mobile', 'biometric', 'manual', 'regularization'],
      default: 'web',
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
