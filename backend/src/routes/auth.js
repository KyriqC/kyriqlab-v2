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
    // Force lowercase and trim spaces to avoid mismatch errors
    const email = user.emails[0].value.toLowerCase().trim();

    console.log('------------------------------------------------');
    console.log('LOGIN ATTEMPT:', email);
    console.log('ADMIN KEY STATUS:', process.env.ADMIN_API_KEY ? 'Loaded' : 'MISSING!');
    console.log('------------------------------------------------');

    // LIST YOUR ADMIN EMAILS HERE (All Lowercase!)
    const ADMIN_EMAILS = [
        'kyriqc@gmail.com', 
        'kecole2@cougarnet.uh.edu'
    ]; 
    
    let token;
    let isAdmin = false;

    if (ADMIN_EMAILS.includes(email)) {
      console.log('SUCCESS: Admin User Identified');
      token = process.env.ADMIN_API_KEY; 
      isAdmin = true;
    } else {
      console.log('NOTICE: User treated as Visitor');
      // It's a visitor. Generate a simple "Visitor Token"
      token = jwt.sign({ name: user.displayName, email: email, role: 'visitor' }, 'SECRET_VISITOR_KEY');
    }

    res.redirect(`https://kyriqlab.com/login/callback?token=${token}&admin=${isAdmin}&name=${encodeURIComponent(user.displayName)}`);
  }
);
module.exports = router
