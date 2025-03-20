import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import passport from "passport";
import User from "../models/user";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile: Profile, done) => {
      try {
        // Find if the user exists
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (user) {
          // Update googleId if not already set
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        } else {
          // Create a new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0].value,
            password: "", // No password needed for Google signup
            isVerified: true, // Mark as verified
          });
        }

        // Pass user to next middleware (where you'll generate JWT)
        return done(null, user);
      } catch (error) {
        console.error("Google Strategy Error", error);
        return done(error);
      }
    }
  )
);

export default passport;
