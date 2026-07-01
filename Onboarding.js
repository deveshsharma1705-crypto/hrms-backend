const mongoose = require('mongoose');

const onboardingChecklistSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    tasks: [
      {
        title: String, // e.g. "Submit ID proof", "IT asset allocation", "Induction session"
        category: {
          type: String,
          enum: ['documentation', 'induction', 'it_setup', 'hr_formality', 'other'],
          default: 'other',
        },
        assignedTo: { type: String, enum: ['employee', 'hr', 'it', 'manager'], default: 'employee' },
        dueDate: Date,
        status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
        completedAt: Date,
      },
    ],
    overallStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
  },
  { timestamps: true }
);

const documentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    docType: {
      type: String,
      enum: [
        'offer_letter',
        'appointment_letter',
        'id_proof',
        'address_proof',
        'education_certificate',
        'relieving_letter',
        'experience_letter',
        'other',
      ],
      required: true,
    },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = {
  OnboardingChecklist: mongoose.model('OnboardingChecklist', onboardingChecklistSchema),
  Document: mongoose.model('Document', documentSchema),
};
