const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protects a route: the request must carry "Authorization: Bearer <token>"
const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "This account no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
};

module.exports = { protect };
