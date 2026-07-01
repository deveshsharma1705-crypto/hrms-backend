const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    reviewCycle: { type: String, required: true }, // e.g. "Q1-2026", "H1-2026"
    goals: [
      {
        title: String,
        description: String,
        weight: Number, // percentage weight of this goal
        targetValue: String,
        achievedValue: String,
        selfRating: Number, // 1-5
        managerRating: Number, // 1-5
        managerComments: String,
      },
    ],
    overallSelfRating: Number,
    overallManagerRating: Number,
    status: {
      type: String,
      enum: ['draft', 'submitted', 'manager_review', 'finalized'],
      default: 'draft',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('KPI', kpiSchema);
