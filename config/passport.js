const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://api.hillbornsolutions.com/api/auth/google/callback",
  scope: ["profile", "email"],
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const existingUser = await User.findOne({ email: profile.emails[0].value });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    console.error("Google OAuth Error:", error);
    return done(error, false);
  }
}));

// Serialize and deserialize user (for session management)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
