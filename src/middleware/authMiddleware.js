// authMiddleware.js
const jwt = require("jsonwebtoken");

// Middleware untuk autentikasi
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Tidak ada token, akses ditolak" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token tidak valid" });
  }
};

// Middleware untuk otorisasi admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak, Anda bukan admin" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
