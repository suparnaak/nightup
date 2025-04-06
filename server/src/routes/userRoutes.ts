import { Router } from "express";
import passport from "passport";
import UserController from "../controllers/userController";
import EventController from "../controllers/eventController";
import UserProfileController from "../controllers/userProfileController"
import WalletController from "../controllers/walletController";
import SavedEventController from "../controllers/savedEventController";
//import BookingController from "../controllers/bookingController";
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
//wallet end points
router.get("/wallet", authMiddleware(["user"]), WalletController.getWallet);
router.post("/wallet/create-order", authMiddleware(["user"]), WalletController.createOrder);
router.post("/wallet/verify-payment", authMiddleware(["user"]), WalletController.verifyPayment);
// Public events endpoint
router.get("/events", EventController.getAllEvents);
router.get("/event/:eventId", EventController.getEventDetails);

//saved events
router.get('/saved-events', authMiddleware(["user"]), SavedEventController.getSavedEvents);
router.post('/saved-events', authMiddleware(["user"]), SavedEventController.saveEvent);
router.delete('/saved-events/:eventId', authMiddleware(["user"]), SavedEventController.removeSavedEvent);


//router.post("/bookings", authMiddleware(["user"]), BookingController.create);
//router.get("/coupons", BookingController.getCoupons);

export default router;
