import express from "express";
import { requireAdmin } from "../../middleware/requireAdmin.js";
import { activateSiteSetting, createSiteSetting, deleteSiteSetting, getActiveSiteSetting, getAllSiteSettings, updateSiteSetting } from "../../controllers/setting/settingControllers.js";

const router = express.Router();

// PUBLIC
router.get("/active",  getActiveSiteSetting );

// ADMIN
router.get("/",requireAdmin, getAllSiteSettings );
router.post("/",requireAdmin,createSiteSetting);
router.put("/:id",requireAdmin,  updateSiteSetting );
router.put("/:id/activate",requireAdmin, activateSiteSetting);
router.delete("/:id",requireAdmin, deleteSiteSetting);

export default router;
