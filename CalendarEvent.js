const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['holiday', 'company_event', 'meeting', 'birthday', 'work_anniversary'],
      default: 'company_event',
    },
    date: { type: Date, required: true },
    endDate: Date,
    description: String,
    applicableTo: {
      type: String,
      enum: ['all', 'department', 'individual'],
      default: 'all',
    },
    department: String,
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
