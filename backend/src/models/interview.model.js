// src/models/Interview.js
// A scheduled interview linking a candidate to a job.
const mongoose = require('mongoose');

const MODES = ['Phone', 'Video', 'Onsite'];
const STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No-show'];

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 30,
      min: 5,
      max: 480,
    },
    mode: {
      type: String,
      enum: MODES,
      default: 'Video',
    },
    interviewer: {
      type: String,
      trim: true,
      default: '',
    },
    locationOrLink: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Scheduled',
    },
    notes: {
      type: String,
      default: '',
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Fast calendar queries by recruiter + time bucket.
interviewSchema.index({ recruiter: 1, scheduledAt: 1 });
interviewSchema.index({ candidate: 1, scheduledAt: -1 });
interviewSchema.index({ recruiter: 1, status: 1, scheduledAt: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
module.exports.MODES = MODES;
module.exports.STATUSES = STATUSES;
