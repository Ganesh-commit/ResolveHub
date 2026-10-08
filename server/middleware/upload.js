const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const identifier = req.user?.id || req.body?.userId || req.body?.regNo || 'user';
    const uniqueName = `avatar-${identifier}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (allowedTypes.includes(file.mimetype.toLowerCase()) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const err = new Error('Invalid image type. Only JPEG, PNG, and WebP formats are allowed.');
    err.status = 400;
    cb(err, false);
  }
};

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max size as specified in Problem 4
  fileFilter
});

module.exports = { uploadAvatar };
