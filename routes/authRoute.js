// routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const { login, register, googleCallback, logout, googleLogin, updateUser } = require('../controllers/authController');
const User = require('../models/User');
const verifyToken = require('../middleware/authmiddleware');
// const { register, login } = require('../controllers/authController');
const router = express.Router();

// Route to register user
router.post('/register', register);
router.put('/update', updateUser);

// Route to login user
router.post('/login', login);
router.post('/logout', logout);

// Route to start Google authentication
router.get('/google',googleLogin)

router.get('/google/callback', googleCallback);

router.get("/profile", verifyToken(["user", "admin"]), async (req, res) => {
    try {
        console.log(req.user);
        
      const user = await User.findById(req.user.id).select("-password"); // Exclude password
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching profile", error });
    }
  });
  


module.exports = router;
