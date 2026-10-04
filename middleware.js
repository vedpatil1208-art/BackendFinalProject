const jwt = require('jsonwebtoken');
const multer = require('multer');
const { User } = require('./models');

const { initializeApp, cert } = require('firebase-admin/app');

const SECRET = process.env.JWT_SECRET || 'gigconnect_secret';

let admin = null;

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin = initializeApp({
    credential: cert(serviceAccount)
  });

  console.log('Firebase connected');

} catch (e) {
  admin = null;
  console.log('Firebase not configured:', e.message);
}

exports.SECRET = SECRET;
exports.admin = admin;

exports.logger = (req, res, next) => {
  console.log(req.method, req.url);
  next();
};

exports.need = (...fields) => (req, res, next) => {
  const body = req.body || {};
  const missing = fields.filter(f => !body[f]);

  if (missing.length) {
    return res.status(400).json({
      message: 'Missing: ' + missing.join(', ')
    });
  }

  next();
};

exports.protect = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').split(' ')[1];

    const decoded = jwt.verify(token, SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        message: 'User not found'
      });
    }

    next();

  } catch {
    res.status(401).json({
      message: 'Invalid or missing token'
    });
  }
};

exports.only = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({
      message: 'Only ' + role + ' allowed'
    });
  }

  next();
};

exports.upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});