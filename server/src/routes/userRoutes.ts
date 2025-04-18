import { Router } from "express";
import passport from "passport";
import UserController from "../controllers/userController";
import EventController from "../controllers/eventController";
import UserProfileController from "../controllers/userProfileController"
import WalletController from "../controllers/walletController";
import SavedEventController from "../controllers/savedEventController";
import BookingController from "../controllers/bookingController";
import { authMiddleware } from "../middlewares/authMiddleware";
import CouponController from "../controllers/CouponController";
import categoryController from "../controllers/categoryController";

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
router.get("/event-types", categoryController.getAllCategories)

//saved events
router.get('/saved-events', authMiddleware(["user"]), SavedEventController.getSavedEvents);
router.post('/saved-events', authMiddleware(["user"]), SavedEventController.saveEvent);
router.delete('/saved-events/:eventId', authMiddleware(["user"]), SavedEventController.removeSavedEvent);

router.get('/coupons', authMiddleware(["user"]), CouponController.getAvailableCoupons);

router.get('/bookings', authMiddleware(["user"]), BookingController.getMyBookings);
router.post('/bookings/create', authMiddleware(["user"]), BookingController.createBooking);
router.post('/bookings/create-order', authMiddleware(["user"]), BookingController.createOrder);
router.post('/bookings/verify', authMiddleware(["user"]), BookingController.verifyPayment);
router.post('/bookings/:bookingId/cancel', authMiddleware(["user"]), BookingController.cancelBooking);



export default router;
