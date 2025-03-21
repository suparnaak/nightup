import { Router } from "express";
import HostController from "../controllers/hostController";
import HostProfileController from "../controllers/hostProfileController";
import EventController from "../controllers/eventController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router: Router = Router();

router.post("/signup", HostController.signup);
router.post("/login", HostController.login);
router.post("/verify-otp", HostController.verifyOtp);
router.post("/resend-otp", HostController.resendOtp);

router.get("/profile", authMiddleware(["host"]), HostProfileController.getHostProfile);
router.post("/profile/update", authMiddleware(["host"]), HostProfileController.updateHostProfile);


//event management routes
router.post("/events/add", authMiddleware(["host"]), EventController.addEvent);
router.get("/events", authMiddleware(["host"]), EventController.getEvents); //list all events host specific


export default router;
