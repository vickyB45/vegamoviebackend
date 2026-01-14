import { signAdminToken } from "../../utils/jwt.js";



/* =========================================================
   ADMIN LOGIN
========================================================= */
export const handleAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    // Check against .env credentials
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    // Create token
    const token = signAdminToken({
      role: "admin",
      email,
    });

    // Set cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",      
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* =========================================================
   ADMIN ME
========================================================= */
export const handleAdminMe = async (req, res) => {
  try {
    // req.admin middleware se aata hai
    return res.status(200).json({
      success: true,
      admin: {
        email: req.admin.email,
        role: req.admin.role,
      },
    });
  } catch (error) {
    console.error("ADMIN ME ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin info",
    });
  }
};


/* =========================================================
   ADMIN LOGOUT
========================================================= */
export const handleAdminLogout = async (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    console.error("ADMIN LOGOUT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
