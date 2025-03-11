import { Router } from "express";
import UserController from "../controllers/userController";

const router: Router = Router();

  router.post("/signup", UserController.signup);
  

export default router;
