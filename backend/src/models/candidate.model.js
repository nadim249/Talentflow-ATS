const mongoose = require("mongoose");
const STAGES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    skills: [{ type: String, trim: true }],
    experience: { type: Number, default: 0 },
    education: { type: String, trim: true },
    resumeUrl: { type: String },
    resumePublicId: { type: String },
    appliedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    stage: {
      type: String,
      enum: STAGES,
      default: "Applied",
    },
    notes: [noteSchema],
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);


// Indexes for search and filter performance.
candidateSchema.index({ name: 'text', email: 'text' });
candidateSchema.index({ stage: 1 });
candidateSchema.index({ skills: 1 });

// One application per email per job (scoped by recruiter for safety).
candidateSchema.index(
  { recruiter: 1, appliedJob: 1, email: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

module.exports = mongoose.model('Candidate', candidateSchema);
module.exports.STAGES = STAGES;