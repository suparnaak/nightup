import { Router } from "express";
import container from "../config/di/inversifyConfig";
import TYPES from "../config/di/types";
import passport from "passport";
import {UserController} from "../controllers/userController";
import {EventController} from "../controllers/eventController";
import {UserProfileController} from "../controllers/userProfileController"
import {WalletController} from "../controllers/walletController";
import {SavedEventController} from "../controllers/savedEventController";
import {BookingController} from "../controllers/bookingController";
import {CouponController} from "../controllers/CouponController";
import {CategoryController} from "../controllers/categoryController";
import {ReviewController} from "../controllers/reviewController";
import {ChatController} from "../controllers/chatController";
import { NotificationController } from "../controllers/notificationController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { blockCheckMiddleware } from "../middlewares/blockCheckMiddleware";
import { AuthController } from "../controllers/authController";


const router: Router = Router();

const authCtr = container.get<AuthController>(TYPES.AuthController);
const userCtr = container.get<UserController>(TYPES.UserController);
const userProfCtr = container.get<UserProfileController>(TYPES.UserProfileController);
const eveCtr = container.get<EventController>(TYPES.EventController);
const catCtr = container.get<CategoryController>(TYPES.CategoryController);
const bookCtr = container.get<BookingController>(TYPES.BookingController);
const walCtr = container.get<WalletController>(TYPES.WalletController);
const chatCtr = container.get<ChatController>(TYPES.ChatController);
const saveEveCtr = container.get<SavedEventController>(TYPES.SavedEventController);
const coupCtr = container.get<CouponController>(TYPES.CouponController);
const revCtr = container.get<ReviewController>(TYPES.ReviewController);
const notifCtr = container.get<NotificationController>(TYPES.NotificationController);



// User endpoints -auth
router.post("/signup", authCtr.signup.bind(authCtr));
router.post("/verify-otp", authCtr.verifyOtp.bind(authCtr));
router.post("/resend-otp", authCtr.resendOtp.bind(authCtr));
router.post("/login", authCtr.login.bind(authCtr));
router.post("/refresh-token", authCtr.refreshToken.bind(authCtr));
router.post("/logout", authCtr.logout.bind(authCtr));

router.post("/forgot-password", authCtr.forgotPassword.bind(authCtr));
router.post("/reset-password", authCtr.resetPassword.bind(authCtr));

// Google authentication endpoints
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// Google callback route
router.get("/auth/google/callback", 
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authCtr.googleCallback.bind(authCtr)
);

//user profile
router.patch("/profile/update", authMiddleware(["user"]),blockCheckMiddleware, userProfCtr.updateProfile.bind(userProfCtr));
router.post("/change-password", authMiddleware(["user"]), userProfCtr.changePassword.bind(userProfCtr));
//wallet end points
router.get("/wallet", authMiddleware(["user"]), blockCheckMiddleware, walCtr.getWallet.bind(walCtr));
router.post("/wallet/create-order", authMiddleware(["user"]), blockCheckMiddleware, walCtr.createOrder.bind(walCtr));
router.post("/wallet/verify-payment", authMiddleware(["user"]), blockCheckMiddleware, walCtr.verifyPayment.bind(walCtr));

// Public events endpoint
router.get("/events", eveCtr.getAllEvents.bind(eveCtr));
router.get("/:hostId/reviews", revCtr.getReviewsByHost.bind(revCtr));
router.get("/event/:eventId", eveCtr.getEventDetails.bind(eveCtr));
router.get("/event-types", catCtr.getAllCategories.bind(catCtr))

//saved events
router.get('/saved-events', authMiddleware(["user"]), blockCheckMiddleware, saveEveCtr.getSavedEvents.bind(saveEveCtr));
router.post('/saved-events', authMiddleware(["user"]), blockCheckMiddleware, saveEveCtr.saveEvent.bind(saveEveCtr));
router.delete('/saved-events/:eventId', authMiddleware(["user"]), blockCheckMiddleware, saveEveCtr.removeSavedEvent.bind(saveEveCtr));

router.get('/coupons', authMiddleware(["user"]),blockCheckMiddleware, coupCtr.getAvailableCoupons.bind(coupCtr));

router.get('/bookings', authMiddleware(["user"]), blockCheckMiddleware, bookCtr.getMyBookings.bind(bookCtr));

router.post('/bookings/create', authMiddleware(["user"]), blockCheckMiddleware, bookCtr.createBooking.bind(bookCtr));
router.post('/bookings/create-order', authMiddleware(["user"]), blockCheckMiddleware, bookCtr.createOrder.bind(bookCtr));
router.post('/bookings/verify', authMiddleware(["user"]), blockCheckMiddleware, bookCtr.verifyPayment.bind(bookCtr));
router.post('/bookings/:bookingId/cancel', authMiddleware(["user"]), blockCheckMiddleware, bookCtr.cancelBooking.bind(bookCtr));

router.post(
  "/bookings/:bookingId/review",
  authMiddleware(["user"]), blockCheckMiddleware,
  revCtr.createReview.bind(revCtr)
);

router.get(
  "/bookings/:bookingId/review",
  authMiddleware(["user"]), blockCheckMiddleware,
  revCtr.getReviewByBookingId.bind(revCtr)
);


router.get(
  "/events/:eventId/reviews",
  revCtr.getReviewsByEvent.bind(revCtr)
);

// Chat routes
router.get("/conversations", authMiddleware(["user"]), blockCheckMiddleware, chatCtr.listConversations.bind(chatCtr));
router.get("/chat/:otherId/event/:eventId",authMiddleware(["user"]), blockCheckMiddleware, chatCtr.fetchMessages.bind(chatCtr));
router.post("/chat/:otherId/event/:eventId",authMiddleware(["user"]), blockCheckMiddleware, chatCtr.sendMessage.bind(chatCtr));
router.patch("/chat/:otherId/event/:eventId/read", authMiddleware(["user"]), blockCheckMiddleware, chatCtr.markMessagesAsRead.bind(chatCtr));

//notificaitons
router.get(
  "/notifications",
  authMiddleware(["user"]),blockCheckMiddleware,
  notifCtr.list.bind(notifCtr)
);
router.get(
  "/notifications/count",
  authMiddleware(["user"]),blockCheckMiddleware,
  notifCtr.countUnread.bind(notifCtr)
);
router.put(
  "/notifications/:id/read",
  authMiddleware(["user"]),blockCheckMiddleware,
  notifCtr.markAsRead.bind(notifCtr)
);

export default router;