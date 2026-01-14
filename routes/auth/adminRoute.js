import express from "express"
import { handleAdminLogin, handleAdminLogout, handleAdminMe } from "../../controllers/auth/adminControllers.js"
import { requireAdmin } from "../../middleware/requireAdmin.js"

const router = express.Router()


router.post("/login",handleAdminLogin)
router.get("/me",requireAdmin,handleAdminMe)
router.post("/logout",requireAdmin,handleAdminLogout)


export default router; 