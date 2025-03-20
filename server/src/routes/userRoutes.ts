import { Router } from "express";
import passport from "passport";
import UserController from "../controllers/userController";
import EventController from "../controllers/eventController";

const router: Router = Router();

// User endpoints
router.post("/signup", UserController.signup);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/resend-otp", UserController.resendOtp);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);

// Google Authentication endpoints using Passport
/* router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
 */
/* router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  UserController.googleAuthCallback // This controller method will handle token generation & redirection.
); */

// Public events endpoint
router.get("/events", EventController.getAllEvents);

export default router;
