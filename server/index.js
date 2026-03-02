import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
dotenv.config()
import cors from "cors"
import mongoose from "mongoose"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"
import adminRouter from "./routes/admin.route.js"

const localOrigins = ["http://localhost:5173", "http://localhost:5174"];
const deployedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...localOrigins, ...deployedOrigins])];
const renderDomainRegex = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i;
const vpsDomainRegex = /^https?:\/\/([a-z0-9-]+\.)?(localjobshub\.in|localjobshubs\.in)$/i;

const app = express()
app.set("trust proxy", 1)
app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser tools (no Origin header)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin) || renderDomainRegex.test(origin) || vpsDomainRegex.test(origin)) {
            return callback(null, true)
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials:true
}))

app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hireloop backend is running" });
});

app.get("/api", (req, res) => {
  res.status(200).json({ message: "Hireloop API is running" });
});

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState
  res.status(200).json({
    ok: true,
    dbState,
    dbConnected: dbState === 1
  })
})

app.use("/api/auth" , authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview" , interviewRouter)
app.use("/api/payment" , paymentRouter)
app.use("/api/admin" , adminRouter)

const PORT = process.env.PORT || 6000
const startServer = async () => {
  try {
    await connectDb()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error.message)
    process.exit(1)
  }
}

startServer()
