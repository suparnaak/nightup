import { Router } from "express";
import HostController from "../controllers/hostController";
import EventController from "../controllers/eventController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router: Router = Router();

router.post("/signup", HostController.signup);
router.post("/login", HostController.login);
router.post("/verify-otp", HostController.verifyOtp);
router.post("/resend-otp", HostController.resendOtp);

//event management routes
router.post("/events/add", authMiddleware, EventController.addEvent);
router.get("/events", authMiddleware, EventController.getEvents); //fetch all event - host specific

export default router;
