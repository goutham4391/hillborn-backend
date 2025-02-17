// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');

// Google login

// Google login
exports.googleLogin = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Google login callback
exports.googleCallback = async (req, res) => {
  passport.authenticate('google', { failureRedirect: '/login' }, async (err, user, info) => {
    if (err) {
      console.error("Google authentication error:", err);
      return res.status(500).json({ error: err.message });
    }

    if (!user) {
      return res.status(400).json({ message: 'Google authentication failed!' });
    }

    // Generate a JWT token for the authenticated user
    const token = jwt.sign(
      {
        id: user._id,
        roles: Array.isArray(user.roles) ? user.roles : [user.roles],
        templates: user.orders,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
console.log(token)

    // Send token as a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
 path: "/",
      maxAge: 60 * 60 * 1000 * 24, // 1 hour
    });
    
    // Redirect or respond with success
    return res.redirect(`${process.env.FRONTENDURL}?status=success`);
    // res.status(200).json({ message: "Logged in successfully!", redirect: process.env.FRONTENDURL, status: 'ok' });
    // res.status(200).json({ message: "Logged in successfully!" });
    // res.redirect(process.env.FRONTENDURL); // Change this to the route you'd like to redirect to after login
  })(req, res);
};

// Google login callback


// Logout User
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,  // If using HTTPS, set to true
    sameSite: 'none',
    path: "/", // ✅ Ensure this matches the path used in `res.cookie`
  });
console.log("Cookies after clearing:", req.cookies);
  res.status(200).json({ message: "Logged out successfully!" });
};



// Register User
exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
console.log(existingUser)
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    let hashedPassword = "";
    if (password && password !== "") {
      hashedPassword = await bcrypt.hash(password, 10); // Hash password only if provided
    }

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
console.error("❌ Error saving user:", error);
    res.status(400).json({ error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Step 2: Check if password exists and is valid
    if (!user.password) {
      return res.status(400).json({ message: "Password not set for this user" });
    }

    // Step 3: Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Step 4: Generate token with phone field
    const token = jwt.sign(
      {
        id: user._id,
        roles: Array.isArray(user.roles) ? user.roles : [user.roles],
        templates: user.orders,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
console.log(token)
    // Step 5: Send token as a cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
path: "/",
      maxAge: 60 * 60 * 1000 * 24, // 1 hour
    });

    res.status(200).json({ message: "Logged in successfully!" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.updateUser = async (req, res) => {
  const { name, phone, password } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.status(200).json({ message: "User details updated successfully!" });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: error.message });
  }
};
