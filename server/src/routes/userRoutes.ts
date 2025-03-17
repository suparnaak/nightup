import { Router } from "express";
import UserController from "../controllers/userController";
import EventController from "../controllers/eventController"

const router: Router = Router();

router.post("/signup", UserController.signup);
router.post("/verify-otp", UserController.verifyOtp);
router.post("/resend-otp", UserController.resendOtp);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);

router.get('/events', EventController.getAllEvents); // get all events - not host specific(it will be for the home page)



export default router;
