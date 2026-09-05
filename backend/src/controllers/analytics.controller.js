// src/controllers/analyticsController.js
// Recruiter-only analytics aggregates from existing Candidate + Job data.
const mongoose = require('mongoose');
const Candidate = require('../models/candidate.model');
const { STAGES } = require('../models/candidate.model');
const Job = require('../models/job.model');

// GET /api/analytics/overview?from=&to=
async function overview(req, res) {
  try {
    const recruiterId = new mongoose.Types.ObjectId(String(req.user._id));

    // Default range: last 90 days.
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 90);

    const from = req.query.from ? new Date(req.query.from) : defaultFrom;
    const to = req.query.to ? new Date(req.query.to) : now;
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ message: 'from/to must be valid dates' });
    }

    const baseMatch = {
      recruiter: recruiterId,
      createdAt: { $gte: from, $lte: to },
    };

    // 1) Pipeline: candidates per stage.
    const pipelineAgg = await Candidate.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);
    const pipeline = STAGES.map((s) => {
      const row = pipelineAgg.find((r) => r._id === s);
      return { stage: s, count: row ? row.count : 0 };
    });

    // 2) Time in stage: avg days since each candidate's last update.
    const timeInStageAgg = await Candidate.aggregate([
      { $match: baseMatch },
      {
        $project: {
          stage: 1,
          days: {
            $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 86_400_000],
          },
        },
      },
      { $group: { _id: '$stage', avgDays: { $avg: '$days' } } },
    ]);
    const timeInStage = STAGES.map((s) => {
      const row = timeInStageAgg.find((r) => r._id === s);
      return {
        stage: s,
        avgDays: row ? Math.round((row.avgDays || 0) * 10) / 10 : 0,
      };
    });

    // 3) Source conversion: Hired / Rejected / Open.
    const sourceAgg = await Candidate.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$stage', 'Hired'] },
              'Hired',
              { $cond: [{ $eq: ['$stage', 'Rejected'] }, 'Rejected', 'Open'] },
            ],
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const sourceConversion = ['Hired', 'Rejected', 'Open'].map((label) => {
      const row = sourceAgg.find((r) => r._id === label);
      return { label, count: row ? row.count : 0 };
    });

    // 4) Avg days to hire (Hired candidates only).
    const hireAgg = await Candidate.aggregate([
      { $match: { ...baseMatch, stage: 'Hired' } },
      {
        $project: {
          days: {
            $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 86_400_000],
          },
        },
      },
      { $group: { _id: null, avg: { $avg: '$days' }, n: { $sum: 1 } } },
    ]);
    const avgDaysToHire = hireAgg[0]
      ? {
          avg: Math.round((hireAgg[0].avg || 0) * 10) / 10,
          n: hireAgg[0].n,
        }
      : { avg: 0, n: 0 };

    // 5) Top jobs by candidate count.
    const topJobsAgg = await Candidate.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$appliedJob', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job',
        },
      },
      { $unwind: { path: '$job', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          jobId: '$_id',
          title: { $ifNull: ['$job.title', '(deleted job)'] },
          department: { $ifNull: ['$job.department', ''] },
          count: 1,
        },
      },
    ]);

    // 6) Totals.
    const totalsAgg = await Candidate.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          candidates: { $sum: 1 },
          hired: { $sum: { $cond: [{ $eq: ['$stage', 'Hired'] }, 1, 0] } },
          open: {
            $sum: {
              $cond: [
                { $in: ['$stage', ['Hired', 'Rejected']] },
                0,
                1,
              ],
            },
          },
          jobs: { $addToSet: '$appliedJob' },
        },
      },
      {
        $project: {
          _id: 0,
          candidates: 1,
          hired: 1,
          open: 1,
          jobs: { $size: '$jobs' },
        },
      },
    ]);
    const totals = totalsAgg[0] || { candidates: 0, hired: 0, open: 0, jobs: 0 };

    res.json({
      totals,
      pipeline,
      timeInStage,
      sourceConversion,
      avgDaysToHire,
      topJobs: topJobsAgg,
      range: { from, to },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load analytics', error: err.message });
  }
}

module.exports = { overview };
