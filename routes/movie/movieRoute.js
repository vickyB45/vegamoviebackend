import express from "express"
import { handleAdminDashboard, handleCreateMovie, handleDeleteMovie, handleGetAllMovie, handleGetMovieById, handleNotification, handleUpdateMovie } from "../../controllers/movie/movieControllers.js";
import { requireAdmin } from "../../middleware/requireAdmin.js";

const router = express.Router()


router.get("/",handleGetAllMovie)
router.get("/dashboard",requireAdmin, handleAdminDashboard);
router.get("/notification", handleNotification);
router.get("/:id", handleGetMovieById)
router.post("/create",requireAdmin,handleCreateMovie)
router.delete("/delete",requireAdmin,handleDeleteMovie)
router.patch("/update/:id",requireAdmin, handleUpdateMovie);


export default router; 