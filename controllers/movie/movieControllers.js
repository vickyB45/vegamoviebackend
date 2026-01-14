import mongoose, { deleteModel } from "mongoose";
import MovieModel from "../../model/movieSchema.js";

/* =========================================================
   CREATE MOVIE (ADMIN)
========================================================= */
export const handleCreateMovie = async (req, res) => {
  try {
    const {
      title,
      slug,
      description,
      releaseDate,
      releaseYear,
      duration,
      language,
      redirectUrl,
      poster,
      quality,
      rating,
      status,
      isTrending,
    } = req.body;

    /* ---------- REQUIRED FIELDS ---------- */
    if (!title || !slug || !description || !poster || !redirectUrl) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
        required: ["title", "slug", "description", "poster", "redirectUrl"],
      });
    }

    /* ---------- SLUG VALIDATION ---------- */
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slug format (lowercase & hyphen only)",
      });
    }

    /* ---------- DUPLICATE CHECK ---------- */
    const exists = await MovieModel.findOne({ slug });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Movie with this slug already exists",
      });
    }

    /* ---------- HELPERS ---------- */
    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.map(v => String(v).trim());
      if (typeof val === "string") return [val.trim()];
      return [];
    };

    /* ---------- CREATE ---------- */
    const movie = await MovieModel.create({
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      description: description.trim(),
      releaseDate: releaseDate ? Number(releaseDate) : undefined,
      releaseYear: releaseYear ? Number(releaseYear) : undefined,
      duration: duration ? Number(duration) : undefined,
      language: normalizeArray(language),
      poster: poster.trim(),
      redirectUrl: redirectUrl.trim(),
      quality: normalizeArray(quality),
      rating: rating ? Number(rating) : 0,
      status: status || "draft",
      isTrending: Boolean(isTrending),
    });

    return res.status(201).json({
      success: true,
      message: "Movie created successfully",
      movie,
    });
  } catch (error) {
    console.error("CREATE MOVIE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const handleGetAllMovie = async (req, res) => {
  try {
    /* =====================
       PAGINATION
    ====================== */
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    /* =====================
       QUERY PARAMS
    ====================== */
    const {
      isTrending,
      status,
      language,
      quality,
      minRating,
      search,
      year,
    } = req.query;

    /* =====================
       MATCH STAGE (EMPTY by default = ALL DATA)
    ====================== */
    const match = {};

    /* ---------- STATUS ---------- */
    const allowedStatus = ["draft", "published", "blocked"];
    if (status && allowedStatus.includes(status)) {
      match.status = status;
    }

    /* ---------- TRENDING ---------- */
    if (isTrending === "true") match.isTrending = true;
    if (isTrending === "false") match.isTrending = false;

    /* ---------- ARRAY FIELDS ---------- */
    if (language) match.language = { $in: [language] };
    if (quality) match.quality = { $in: [quality] };

    /* ---------- RATING ---------- */
    if (minRating) match.rating = { $gte: Number(minRating) };

    /* ---------- YEAR ---------- */
    if (year) match.releaseYear = Number(year);

    /* ---------- SEARCH ---------- */
    if (search) {
      match.title = { $regex: search, $options: "i" };
    }

    /* =====================
       SORT LOGIC
    ====================== */
    let sortStage = { createdAt: -1 }; // default: newest first

    if (isTrending === "true") {
      sortStage = { isTrending: -1, createdAt: -1 };
    }

    /* =====================
       AGGREGATION PIPELINE
    ====================== */
    const pipeline = [
      { $match: match },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: limit },
    ];

    const movies = await MovieModel.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      page,
      limit,
      count: movies.length,
      hasMore: movies.length === limit,
      movies,
    });
  } catch (error) {
    console.error("GET ALL MOVIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movies",
    });
  }
};

/* =========================================================
   DELETE MOVIE (BY ID – QUERY PARAM)
   Example: DELETE /api/movies/delete?id=64f8c9a1...
========================================================= */

export const handleDeleteMovie = async (req, res) => {
  try {
    const { id } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Movie id is required in body",
      });
    }

    /* ---------- DELETE ---------- */
    const deletedMovie = await MovieModel.findByIdAndDelete(id);

    if (!deletedMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${deletedMovie.title} deleted successfully`,
      movieId: deletedMovie._id,
    });
  } catch (error) {
    console.error("DELETE MOVIE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete movie",
    });
  }
};

/* =========================================================
   UPDATE MOVIE (BY ID – QUERY PARAM)
   Example:
   PATCH /api/movies/update?id=64f8c9a1...
========================================================= */
export const handleUpdateMovie = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Movie id is required in query",
      });
    }

    const {
      title,
      slug,
      description,
      releaseDate,
      releaseYear,
      duration,
      language,
      redirectUrl,
      poster,
      quality,
      rating,
      status,
      isTrending,
    } = req.body;

    /* ---------- HELPER ---------- */
    const normalizeArray = (val) => {
      if (Array.isArray(val)) return val.map(v => String(v).trim());
      if (typeof val === "string") return [val.trim()];
      return undefined;
    };

    /* ---------- BUILD UPDATE OBJECT ---------- */
    const updateData = {};

    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (poster) updateData.poster = poster.trim();
    if (redirectUrl) updateData.redirectUrl = redirectUrl.trim();

    if (releaseDate !== undefined) updateData.releaseDate = Number(releaseDate);
    if (releaseYear !== undefined) updateData.releaseYear = Number(releaseYear);
    if (duration !== undefined) updateData.duration = Number(duration);

    if (language !== undefined)
      updateData.language = normalizeArray(language);

    if (quality !== undefined)
      updateData.quality = normalizeArray(quality);

    if (rating !== undefined) updateData.rating = Number(rating);
    if (status) updateData.status = status;
    if (isTrending !== undefined)
      updateData.isTrending = Boolean(isTrending);

    /* ---------- SLUG CHECK (if updating slug) ---------- */
    if (slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return res.status(400).json({
          success: false,
          message: "Invalid slug format",
        });
      }

      const exists = await MovieModel.findOne({
        slug,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Movie with this slug already exists",
        });
      }

      updateData.slug = slug.trim().toLowerCase();
    }

    /* ---------- UPDATE ---------- */
    const updatedMovie = await MovieModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie: updatedMovie,
    });
  } catch (error) {
    console.error("UPDATE MOVIE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update movie",
    });
  }
};

/* =========================================================
   GET SINGLE MOVIE BY SLUG
   Public: only published movies
   Admin: ?preview=true  -> draft / blocked bhi dekh sakta
========================================================= */

export const handleGetMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const { preview } = req.query;

    /* ---------- VALIDATION ---------- */
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Movie id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie id",
      });
    }

    /* ---------- BUILD QUERY ---------- */
    const query = { _id: id };

    // Public users → only published movies
  

    /* ---------- FIND MOVIE ---------- */
    const movie = await MovieModel.findOne(query);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      movie,
    });
  } catch (error) {
    console.error("GET MOVIE BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movie",
    });
  }
};




/* =========================================================
   ADMIN DASHBOARD (GET)
========================================================= */
export const handleAdminDashboard = async (req, res) => {
  try {
    const pipeline = [
      {
        $facet: {
          /* =====================
             STATUS COUNTS
          ====================== */
          statusCounts: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],

          /* =====================
             TOTAL MOVIES
          ====================== */
          totalMovies: [
            { $count: "total" },
          ],

          /* =====================
             RECENT MOVIES
          ====================== */
          recentMovies: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                slug: 1,
                poster: 1,
                status: 1,
                rating: 1,
                isTrending: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
    ];

    const [result] = await MovieModel.aggregate(pipeline);

    /* =====================
       NORMALIZE COUNTS
    ====================== */
    const stats = {
      totalMovies: result.totalMovies[0]?.total || 0,
      publishedMovies: 0,
      draftMovies: 0,
      blockedMovies: 0,
    };

    result.statusCounts.forEach((item) => {
      if (item._id === "published") stats.publishedMovies = item.count;
      if (item._id === "draft") stats.draftMovies = item.count;
      if (item._id === "blocked") stats.blockedMovies = item.count;
    });

    return res.status(200).json({
      success: true,
      stats,
      recentMovies: result.recentMovies,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};


export const handleNotification = async (req, res) => {
  try {
    /**
     * LOGIC:
     * - Latest movies se notification
     * - Trending movies ko priority
     * - Last 10 notifications only
     */

    const notifications = await MovieModel.aggregate([
      {
        $match: {
          status: "published", // sirf live movies
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          quality: 1,
          language: 1,
          createdAt: 1,
          isTrending: 1,
          redirectUrl: 1
        },
      },
    ]);

    // 🔹 convert movies → notification format
    const formattedNotifications = notifications.map((movie) => {
      const qualities = movie.quality?.join(" / ");
      const languages = movie.language?.join(" + ");

      return {
        id: movie._id,
        title: `${movie.title} (${new Date(
          movie.createdAt
        ).getFullYear()}) ${languages}`,
        subtitle: qualities
          ? `Download now available in ${qualities}`
          : "Now available for download",
        link: movie.redirectUrl,
        time: getTimeAgo(movie.createdAt),
        isSeen: false, // future: user based
        type: movie.isTrending ? "trending" : "movie",
        createdAt: movie.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      total: formattedNotifications.length,
      unreadCount: formattedNotifications.length, // future: user based
      data: formattedNotifications,
    });
  } catch (error) {
    console.error("Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};
const getTimeAgo = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};
