const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
require('dotenv').config(); 
// Auth Rout 

const GOOGLE_CLIENT_USER_ID= process.env.GOOGLE_CLIENT_USER_ID
const GOOGLE_CLIENT_USER_SECRET= process.env.GOOGLE_CLIENT_USER_SECRET

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_USER_ID,
      clientSecret: GOOGLE_CLIENT_USER_SECRET,
      callbackURL: `${process.env.REDIRECT_URL}/v1/auth/google/callback`,
    },
    function (accessToken, refreshToken, profile, done) {
      done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user); 
});

passport.deserializeUser((user, done) => {
  done(null, user); 
});