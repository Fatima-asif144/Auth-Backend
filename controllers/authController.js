const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// The user data we send to the frontend (never includes the password)
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLogin: user.lastLogin,
  loginCount: user.loginCount,
});

// One place to turn errors into friendly responses
const handleError = (res, error) => {
  if (error.name === "ValidationError") {
    const firstMessage = Object.values(error.errors)[0].message;
    return res.status(400).json({ message: firstMessage });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }
  console.error(error);
  return res.status(500).json({ message: "Something went wrong on the server. Please try again." });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      lastLogin: new Date(),
      loginCount: 1,
    });

    res.status(201).json({ token: createToken(user._id), user: formatUser(user) });
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user || !(await user.comparePassword(String(password)))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    res.json({ token: createToken(user._id), user: formatUser(user) });
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res) => {
  res.json({ user: formatUser(req.user) });
};

// PUT /api/auth/profile  (protected)
const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: "Name cannot be empty." });
      }
      req.user.name = name;
    }
    if (bio !== undefined) req.user.bio = bio;

    await req.user.save();
    res.json({ user: formatUser(req.user) });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = { register, login, getMe, updateProfile };
