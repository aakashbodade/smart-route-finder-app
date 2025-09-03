import { Router } from "express";
import {
  createHub, listHubs, getHub, connectHubs, disconnectHubs
} from "../controllers/hubController.js";

const router = Router();

router.get("/", listHubs);
router.post("/", createHub);
router.post("/connect", connectHubs);
router.post("/disconnect", disconnectHubs);
router.get("/:hubId", getHub);

export default router;
