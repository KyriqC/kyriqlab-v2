const express = require('express')
const requireAdminKey = require('../middleware/requireAdminKey')
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const router = express.Router()

// Verifies the provided x-admin-key header
router.get('/verify', requireAdminKey, (req, res) => {
  res.json({ ok: true })
})

// 1. Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    // This runs when Google sends the user back
    return done(null, profile);
  }
));

// 2. Start Login (Redirects to Google)
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// 3. Google Callback (Where Google sends the user back)
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=failed' }),
  (req, res) => {
    const user = req.user;
    const email = user.emails[0].value;

    // --- ADMIN CHECK ---
    // Replace 'YOUR_REAL_EMAIL@gmail.com' with your actual email
    // If the email matches, we send the ADMIN KEY to the frontend
    const ADMIN_EMAIL = 'kyriqc@gmail.com'; // CHANGE THIS TO YOUR EMAIL!
    
    let token;
    let isAdmin = false;

    if (email === ADMIN_EMAIL) {
      // It's YOU! Send the Admin API Key
      token = process.env.ADMIN_API_KEY; 
      isAdmin = true;
    } else {
      // It's a visitor. Generate a simple "Visitor Token" (just a placeholder for now)
      token = jwt.sign({ name: user.displayName, email: email, role: 'visitor' }, 'SECRET_VISITOR_KEY');
    }

    // Redirect back to frontend with the token
    // We encode it in the URL so the frontend can grab it
    res.redirect(`https://kyriqlab.com/login/callback?token=${token}&admin=${isAdmin}&name=${encodeURIComponent(user.displayName)}`);
  }
);

module.exports = router
