import { verifyAdminToken } from "../utils/jwt.js";

/* =========================================================
   REQUIRE ADMIN (COOKIE BASED)
========================================================= */
export const requireAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin token missing",
      });
    }

    const decoded = verifyAdminToken(token);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    req.admin = decoded; // attach admin info
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};
