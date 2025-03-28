import { Router } from "express";
import passport from "passport";
import UserController from "../controllers/userController";
import EventController from "../controllers/eventController";
import UserProfileController from "../controllers/userProfileController"
import { authMiddleware } from "../middlewares/authMiddleware";

const router: Router = Router();

// User endpoints -auth
router.post("/signup", UserController.signup);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/resend-otp", UserController.resendOtp);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);

// Google authentication endpoints
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// Google callback route
router.get("/auth/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  UserController.googleCallback
);

//user profile
router.patch("/profile/update", authMiddleware(["user"]), UserProfileController.updateProfile);

router.post("/change-password", authMiddleware(["user"]), UserProfileController.changePassword);

// Public events endpoint
router.get("/events", EventController.getAllEvents);


export default router;
