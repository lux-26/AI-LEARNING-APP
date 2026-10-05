import express from "express";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "../controllers/notification.Controller.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsAsRead);

export default router;
