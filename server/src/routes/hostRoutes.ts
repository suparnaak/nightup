import { Router } from "express";
import container from "../config/di/inversifyConfig";
import TYPES from "../config/di/types";
import {HostController} from "../controllers/hostController";
import {HostProfileController} from "../controllers/hostProfileController";
import {HostSubscriptionController} from "../controllers/hostSubscriptionController";
import {EventController} from "../controllers/eventController";
import {CategoryController} from "../controllers/categoryController";
import {BookingController} from "../controllers/bookingController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {HostRevenueController} from "../controllers/hostRevenueController"
import {ChatController} from "../controllers/chatController";
import CloudinaryController from "../controllers/cloudinaryController";
import { blockCheckMiddleware } from "../middlewares/blockCheckMiddleware";

const router: Router = Router();

const hostCtr = container.get<HostController>(TYPES.HostController);
const hostProfCtr = container.get<HostProfileController>(TYPES.HostProfileController);
const hostSubCtr = container.get<HostSubscriptionController>(TYPES.HostSubscriptionController);
const eveCtr = container.get<EventController>(TYPES.EventController);
const catCtr = container.get<CategoryController>(TYPES.CategoryController);
const bookCtr = container.get<BookingController>(TYPES.BookingController);
const hostRevCtr = container.get<HostRevenueController>(TYPES.HostRevenueController);
const chatCtr = container.get<ChatController>(TYPES.ChatController);


router.post("/signup", hostCtr.signup.bind(hostCtr));
router.post("/login", hostCtr.login.bind(hostCtr));
router.post("/verify-otp", hostCtr.verifyOtp.bind(hostCtr));
router.post("/resend-otp", hostCtr.resendOtp.bind(hostCtr));
router.post("/refresh-token", hostCtr.refreshToken.bind(hostCtr));

router.get("/profile", authMiddleware(["host"]), blockCheckMiddleware, hostProfCtr.getHostProfile.bind(hostProfCtr));
router.patch("/profile/update", authMiddleware(["host"]), blockCheckMiddleware, hostProfCtr.updateHostProfile.bind(hostProfCtr));

router.get("/event-types",authMiddleware(["host"]),  blockCheckMiddleware, catCtr.getAllCategories.bind(catCtr))
//event management routes
router.post("/events/add", authMiddleware(["host"]), blockCheckMiddleware, eveCtr.addEvent.bind(eveCtr));
router.get("/events", authMiddleware(["host"]), blockCheckMiddleware, eveCtr.getEvents.bind(eveCtr)); //list all events host specific

router.put("/events/edit/:eventId", authMiddleware(["host"]), blockCheckMiddleware, eveCtr.editEvent.bind(eveCtr));
router.put(
  "/events/cancel/:eventId",
  authMiddleware(["host"]), blockCheckMiddleware,
  eveCtr.deleteEvent.bind(eveCtr)
);

//subscription related
router
  .route("/subscription")
  .get(authMiddleware(["host"]), blockCheckMiddleware, hostSubCtr.getHostSubscription.bind(hostSubCtr));

router.get("/available-subscription", authMiddleware(["host"]), blockCheckMiddleware, hostSubCtr.getAvailableSubscriptions.bind(hostSubCtr));
router.post("/subscriptions/create-order", authMiddleware(["host"]), blockCheckMiddleware, hostSubCtr.createOrder.bind(hostSubCtr));
router.post("/subscriptions/verify-payment", authMiddleware(["host"]), blockCheckMiddleware, hostSubCtr.verifyPayment.bind(hostSubCtr));

router.post("/subscriptions/create-upgrade-order", authMiddleware(["host"]), blockCheckMiddleware, hostSubCtr.createUpgradeOrder.bind(hostSubCtr));
router.post("/subscriptions/verify-upgrade", authMiddleware(["host"]), blockCheckMiddleware, hostSubCtr.verifyUpgradePayment.bind(hostSubCtr));
//bookings
router.get("/events/:eventId/bookings", authMiddleware(["host"]), blockCheckMiddleware, bookCtr.getBookingsByEvent.bind(bookCtr));

router.get(
  "/revenue",
  authMiddleware(["host"]), blockCheckMiddleware,
  hostRevCtr.getHostRevenueData.bind(hostRevCtr)
);

// Generate revenue report PDF for a host
router.get(
  "/revenue/report",
  authMiddleware(["host"]), blockCheckMiddleware,
  hostRevCtr.generateHostRevenueReport.bind(hostRevCtr)
);

// Chat routes
router.get("/conversations", authMiddleware(["host"]), blockCheckMiddleware, chatCtr.listConversations.bind(chatCtr));

router.get("/chat/:otherId/event/:eventId",authMiddleware(["host"]), blockCheckMiddleware, chatCtr.fetchMessages.bind(chatCtr));
router.post("/chat/:otherId/event/:eventId",authMiddleware(["host"]), blockCheckMiddleware, chatCtr.sendMessage.bind(chatCtr));
router.patch("/chat/:otherId/event/:eventId/read", authMiddleware(["host"]), blockCheckMiddleware, chatCtr.markMessagesAsRead.bind(chatCtr));

//cloudinary
router.get(
  "/cloudinary/signature", 
  authMiddleware(["host"]), blockCheckMiddleware,
  CloudinaryController.generateSignature
);

export default router;