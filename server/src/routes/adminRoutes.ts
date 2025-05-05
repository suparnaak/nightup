import { Router } from "express";
import container from "../config/di/inversifyConfig";
import TYPES from "../config/di/types";
import passport from "passport";
import {AdminController} from "../controllers/adminController";
import {SubscriptionController} from "../controllers/subscriptionController";
import {CouponController} from "../controllers/CouponController";
import {CategoryController} from "../controllers/categoryController";
import { authMiddleware } from "../middlewares/authMiddleware";
import {EventController} from "../controllers/eventController";
import {BookingController} from "../controllers/bookingController";
import {RevenueController} from "../controllers/revenueController";


const router: Router = Router();
const adCtr = container.get<AdminController>(TYPES.AdminController);
const subCtr = container.get<SubscriptionController>(TYPES.SubscriptionController)
const coupCtr = container.get<CouponController>(TYPES.CouponController)
const catCtr = container.get<CategoryController>(TYPES.CategoryController)
const eveCtr = container.get<EventController>(TYPES.EventController)
const bookCtr = container.get<BookingController>(TYPES.BookingController)
const revCtr = container.get<RevenueController>(TYPES.RevenueController)

router.post("/login", adCtr.login.bind(adCtr));
router.post("/refresh-token", adCtr.refreshToken.bind(adCtr));
//router.post("/logout", AdminController.logout);
router.get("/hosts", authMiddleware(["admin"]), adCtr.getHosts.bind(adCtr));
router.post("/hosts/verify-document", authMiddleware(["admin"]), adCtr.verifyDocument.bind(adCtr))
router.post("/hosts/toggle-block", authMiddleware(["admin"]), adCtr.hostToggleStatus.bind(adCtr))
router.get("/users", authMiddleware(["admin"]), adCtr.getUsers.bind(adCtr));
router.post("/users/toggle-block", authMiddleware(["admin"]), adCtr.userToggleStatus.bind(adCtr))
//subscription management
router
  .route("/subscriptions")
  .get(authMiddleware(["admin"]), subCtr.getSubscriptions.bind(subCtr))
  .post(authMiddleware(["admin"]), subCtr.createSubscription.bind(subCtr));
  router
  .route("/subscriptions/:id")
  .put(authMiddleware(["admin"]), subCtr.updateSubscription.bind(subCtr))
  .delete(authMiddleware(["admin"]), subCtr.deleteSubscription.bind(subCtr));
//coupoon management
router
  .route("/coupons")
  .get(authMiddleware(["admin"]), coupCtr.getCoupons.bind(coupCtr)) 
  .post(authMiddleware(["admin"]), coupCtr.createCoupon.bind(coupCtr)); 

router
  .route("/coupons/:id")
  .put(authMiddleware(["admin"]), coupCtr.updateCoupon.bind(coupCtr)) 
  .delete(authMiddleware(["admin"]), coupCtr.deleteCoupon.bind(coupCtr)); 
//event type management
router
  .route("/event-types")
  .get(authMiddleware(["admin"]), catCtr.getAllCategories.bind(catCtr))
  .post(authMiddleware(["admin"]), catCtr.createCategory.bind(catCtr));

router
  .route("/event-types/:id")
  .put(authMiddleware(["admin"]), catCtr.updateCategory.bind(catCtr));

router.get('/events',authMiddleware(["admin"]),eveCtr.getAllEventsForAdmin.bind(eveCtr))
router.get("/events/:eventId/bookings", authMiddleware(["admin"]), bookCtr.getBookingsByEventAdmin.bind(bookCtr));

router.get("/revenue", authMiddleware(["admin"]), revCtr.getRevenueData.bind(revCtr));
router.get("/revenue/report", authMiddleware(["admin"]), revCtr.generateRevenueReport.bind(revCtr));
export default router;
