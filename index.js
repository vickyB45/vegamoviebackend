import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";

import connectDB from "./db/connectDb.js"

import movieRoute from "./routes/movie/movieRoute.js"
import authRoute from "./routes/auth/adminRoute.js"

dotenv.config()

const app = express()

app.use(cookieParser())
app.use(cors({
     origin: [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
  ],
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// call db
connectDB()


/* =======================
   🛣️ ROUTES
======================= */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Backend API running",
  });
});

app.use("/api/movie",movieRoute)
app.use("/api/admin",authRoute)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


/* =======================
   🚀 SERVER START
======================= */

const PORT = process.env.PORT || 3005


app.listen(PORT,()=>{
    console.log(`🔥 Server running on http://localhost:${PORT}`)
})