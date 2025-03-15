import { Router } from "express";
import UserController from "../controllers/userController";

const router: Router = Router();

  router.post("/signup", UserController.signup);
  router.post("/verify-otp", UserController.verifyOtp);
router.post("/resend-otp", UserController.resendOtp);
router.post("/login", UserController.login);
router.post("/logout", UserController.logout);


  

export default router;
