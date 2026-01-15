import siteSettings from "../../model/siteSettings.js";


export const createSiteSetting = async (req, res) => {
  try {
    const {
      siteTitle,
      siteSubtitle,
      siteHeading,
      avatarUrl,
      rememberWebsiteName,
      currentDomain,
    } = req.body;

    // 1️⃣ Basic validation
    if (!siteTitle) {
      return res.status(400).json({
        message: "siteTitle is required",
      });
    }

    // 2️⃣ Create new site setting (NOT ACTIVE)
    const newSetting = await siteSettings.create({
      siteTitle,
      siteSubtitle,
      siteHeading,
      avatarUrl,
      rememberWebsiteName,
      currentDomain,
      isActive: false, // 👈 ALWAYS FALSE on create
      lastUpdatedBy: req.user?.email || "admin",
    });

    // 3️⃣ Success response
    res.status(201).json({
      message: "Site setting created successfully",
      data: newSetting,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create site setting",
      error: error.message,
    });
  }
};

export const getActiveSiteSetting = async (req, res) => {
  try {
    const activeSetting = await siteSettings.findOne({ isActive: true });

    if (!activeSetting) {
      return res.status(404).json({
        message: "No active site setting found",
      });
    }

    res.status(200).json(activeSetting);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch active site setting",
      error: error.message,
    });
  }
};

export const activateSiteSetting = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Check: config exists?
    const setting = await siteSettings.findById(id);
    if (!setting) {
      return res.status(404).json({
        message: "Site setting not found",
      });
    }

    // 2️⃣ Deactivate all active configs
    await siteSettings.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );

    // 3️⃣ Activate selected config
    setting.isActive = true;
    await setting.save();

    // 4️⃣ Success
    res.status(200).json({
      message: "Site setting activated successfully",
      data: setting,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to activate site setting",
      error: error.message,
    });
  }
};

export const getAllSiteSettings = async (req, res) => {
  try {
    const settings = await siteSettings
      .find({})
      .sort({ createdAt: -1 }); // latest upar

    res.status(200).json({
      success: true,
      count: settings.length,
      data: settings,
    });
  } catch (error) {
    console.error("Get all site settings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch site settings",
      error: error.message,
    });
  }
};

export const updateSiteSetting = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      siteTitle,
      siteSubtitle,
      siteHeading,
      avatarUrl,
      rememberWebsiteName,
      currentDomain,
    } = req.body;

    // 1️⃣ Check exists
    const setting = await siteSettings.findById(id);
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Site setting not found",
      });
    }

    // 2️⃣ Update only allowed fields
    if (siteTitle !== undefined) setting.siteTitle = siteTitle;
    if (siteSubtitle !== undefined) setting.siteSubtitle = siteSubtitle;
    if (siteHeading !== undefined) setting.siteHeading = siteHeading;
    if (avatarUrl !== undefined) setting.avatarUrl = avatarUrl;
    if (rememberWebsiteName !== undefined)
      setting.rememberWebsiteName = rememberWebsiteName;
    if (currentDomain !== undefined)
      setting.currentDomain = currentDomain;

    // meta
    setting.lastUpdatedBy = req.user?.email || "admin";

    await setting.save();

    // 3️⃣ Response
    res.status(200).json({
      success: true,
      message: "Site setting updated successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Update site setting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update site setting",
      error: error.message,
    });
  }
};

export const deleteSiteSetting = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Check exists
    const setting = await siteSettings.findById(id);
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Site setting not found",
      });
    }

    // 2️⃣ Prevent deleting active config
    if (setting.isActive) {
      return res.status(400).json({
        success: false,
        message: "Active site setting cannot be deleted. Deactivate it first.",
      });
    }

    // 3️⃣ Delete
    await siteSettings.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Site setting deleted successfully",
    });
  } catch (error) {
    console.error("Delete site setting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete site setting",
      error: error.message,
    });
  }
};