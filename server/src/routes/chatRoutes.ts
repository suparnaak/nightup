// routes/chatRoutes.ts
import { Router } from "express";
import ChatController from "../controllers/chatController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router: Router = Router();

router.use(authMiddleware(["user", "host"]));

router.get("chat/:hostId/event/:eventId", ChatController.fetchMessages);

router.post("chat/:hostId/event/:eventId", ChatController.sendMessage);

export default router;
