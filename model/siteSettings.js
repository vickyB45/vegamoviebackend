import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    /* ===== BASIC INFO ===== */

    siteTitle: {
      type: String,
      required: true,
      trim: true,
    },

    siteSubtitle: {
      type: String,
      trim: true,
      default: "",
    },

    siteHeading: {
      type: String,
      trim: true,
    },

    /* ===== BRANDING ===== */

    avatarUrl: {
      type: String, // image URL or path
      default: "",
    },

    /* ===== DOMAIN INFO ===== */

    rememberWebsiteName: {
      type: String,
      trim: true,
    },

    currentDomain: {
      type: String,
      trim: true,
    },

    /* ===== CONTROL ===== */

    isActive: {
      type: Boolean,
      default: false, // 👈 IMPORTANT
    },

    lastUpdatedBy: {
      type: String, // admin email / username
      default: "admin",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
