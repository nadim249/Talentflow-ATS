// backend/src/middleware/upload.middleware.js
const multer = require('multer');
const { uploadBuffer } = require('../config/cloudinary');

// Accept PDFs even when browsers send application/octet-stream.
function isPdfFile(file) {
  if (!file) return false;
  if (file.mimetype === 'application/pdf') return true;
  if (typeof file.originalname === 'string' && file.originalname.toLowerCase().endsWith('.pdf')) {
    return true;
  }
  return false;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB cap (raised to accommodate real resumes)
  fileFilter: (_req, file, cb) => {
    if (!isPdfFile(file)) {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
});


function uploadResumeToCloudinary(
  fieldName = 'resume',
  { required = true, maxMb = 10 } = {},
) {
  const single = upload.single(fieldName);
  return (req, res, next) => {
    single(req, res, async (err) => {
      if (err) {
        // Multer errors carry a .code (LIMIT_FILE_SIZE, etc.).
        const code = err.code || '';
        const msg =
          code === 'LIMIT_FILE_SIZE'
            ? `File too large (max ${maxMb}MB)`
            : err.message || 'Upload error';
        return res.status(400).json({ message: msg, code });
      }
      if (!req.file) {
        if (required) {
          return res.status(400).json({
            message: 'Resume file is required (PDF, max 10MB)',
            code: 'RESUME_REQUIRED',
          });
        }
        return next();
      }
      try {
        const { url, publicId } = await uploadBuffer(req.file.buffer);
        req.cloudinary = { url, publicId };
        next();
      } catch (cloudErr) {
        // Log full detail server-side; return a friendly message to the client.
        console.error('[cloudinary] upload failed:', cloudErr);
        const detail = cloudErr?.message || 'Unknown Cloudinary error';
        res.status(500).json({
          message: 'Upload failed — please verify your Cloudinary credentials',
          detail,
        });
      }
    });
  };
}

module.exports = { upload, uploadResumeToCloudinary };