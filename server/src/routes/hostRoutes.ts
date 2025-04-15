import { Router } from "express";
import HostController from "../controllers/hostController";
import HostProfileController from "../controllers/hostProfileController";
import HostSubscriptionController from "../controllers/hostSubscriptionController";
import EventController from "../controllers/eventController";
import CategoryController from "../controllers/categoryController";
import BookingController from "../controllers/bookingController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router: Router = Router();

router.post("/signup", HostController.signup);
router.post("/login", HostController.login);
router.post("/verify-otp", HostController.verifyOtp);
router.post("/resend-otp", HostController.resendOtp);

router.get("/profile", authMiddleware(["host"]), HostProfileController.getHostProfile);
router.patch("/profile/update", authMiddleware(["host"]), HostProfileController.updateHostProfile);

router.get("/event-types",authMiddleware(["host"]), CategoryController.getAllCategories)
//event management routes
router.post("/events/add", authMiddleware(["host"]), EventController.addEvent);
router.get("/events", authMiddleware(["host"]), EventController.getEvents); //list all events host specific

router.put("/events/edit/:eventId", authMiddleware(["host"]), EventController.editEvent);
router.put(
  "/events/cancel/:eventId",
  authMiddleware(["host"]),
  EventController.deleteEvent
);

//subscription related
router
  .route("/subscription")
  .get(authMiddleware(["host"]), HostSubscriptionController.getHostSubscription);

router.get("/available-subscription", authMiddleware(["host"]), HostSubscriptionController.getAvailableSubscriptions);
router.post("/subscriptions/create-order", authMiddleware(["host"]), HostSubscriptionController.createOrder);
router.post("/subscriptions/verify-payment", authMiddleware(["host"]), HostSubscriptionController.verifyPayment);

router.post("/subscriptions/create-upgrade-order", authMiddleware(["host"]), HostSubscriptionController.createUpgradeOrder);
router.post("/subscriptions/verify-upgrade", authMiddleware(["host"]), HostSubscriptionController.verifyUpgradePayment);
//bookings
router.get("/events/:eventId/bookings", authMiddleware(["host"]), BookingController.getBookingsByEvent);



export default router;
