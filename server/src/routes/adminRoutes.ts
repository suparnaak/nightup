import { Router } from "express";
import passport from "passport";
import AdminController from "../controllers/adminController";
import { authMiddleware } from "../middlewares/authMiddleware";


const router: Router = Router();

router.post("/login", AdminController.login);
router.post("/refresh-token", AdminController.refreshToken);
//router.post("/logout", AdminController.logout);
router.get("/hosts", authMiddleware(["admin"]), AdminController.getHosts);
router.post("/hosts/verify-document", authMiddleware(["admin"]), AdminController.verifyDocument)
router.post("/hosts/toggle-block", authMiddleware(["admin"]), AdminController.hostToggleStatus)
router.get("/users", authMiddleware(["admin"]), AdminController.getUsers);
router.post("/users/toggle-block", authMiddleware(["admin"]), AdminController.userToggleStatus)


export default router;
