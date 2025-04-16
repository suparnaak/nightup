import { Router } from "express";
import passport from "passport";
import AdminController from "../controllers/adminController";
import SubscriptionController from "../controllers/subscriptionController";
import CouponController from "../controllers/CouponController";
import CategoryController from "../controllers/categoryController";
import { authMiddleware } from "../middlewares/authMiddleware";
import EventController from "../controllers/eventController";


const router: Router = Router();

router.post("/login", AdminController.login);
router.post("/refresh-token", AdminController.refreshToken);
//router.post("/logout", AdminController.logout);
router.get("/hosts", authMiddleware(["admin"]), AdminController.getHosts);
router.post("/hosts/verify-document", authMiddleware(["admin"]), AdminController.verifyDocument)
router.post("/hosts/toggle-block", authMiddleware(["admin"]), AdminController.hostToggleStatus)
router.get("/users", authMiddleware(["admin"]), AdminController.getUsers);
router.post("/users/toggle-block", authMiddleware(["admin"]), AdminController.userToggleStatus)
//subscription management
router
  .route("/subscriptions")
  .get(authMiddleware(["admin"]), SubscriptionController.getSubscriptions)
  .post(authMiddleware(["admin"]), SubscriptionController.createSubscription);
  router
  .route("/subscriptions/:id")
  .put(authMiddleware(["admin"]), SubscriptionController.updateSubscription)
  .delete(authMiddleware(["admin"]), SubscriptionController.deleteSubscription);
//coupoon management
router
  .route("/coupons")
  .get(authMiddleware(["admin"]), CouponController.getCoupons) 
  .post(authMiddleware(["admin"]), CouponController.createCoupon); 

router
  .route("/coupons/:id")
  .put(authMiddleware(["admin"]), CouponController.updateCoupon) 
  .delete(authMiddleware(["admin"]), CouponController.deleteCoupon); 
//event type management
router
  .route("/event-types")
  .get(authMiddleware(["admin"]), CategoryController.getAllCategories)
  .post(authMiddleware(["admin"]), CategoryController.createCategory);

router
  .route("/event-types/:id")
  .put(authMiddleware(["admin"]), CategoryController.updateCategory);

router.get('/events',authMiddleware(["admin"]),EventController.getAllEventsForAdmin)
export default router;
