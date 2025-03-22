import { Router } from "express";
import passport from "passport";
import AdminController from "../controllers/adminController";

const router: Router = Router();

router.post("/login", AdminController.login);
router.post("/refresh-token", AdminController.refreshToken);
router.post("/logout", AdminController.logout);


export default router;
