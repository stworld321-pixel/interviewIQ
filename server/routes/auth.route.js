import express from "express"
import {
  forgotPassword,
  googleAuth,
  logOut,
  login,
  register,
  resetPassword,
} from "../controllers/auth.controller.js"

const authRouter = express.Router()


authRouter.post("/register",register)
authRouter.post("/login",login)
authRouter.post("/google",googleAuth)
authRouter.post("/forgot-password", forgotPassword)
authRouter.post("/reset-password/:token", resetPassword)
authRouter.get("/logout",logOut)


export default authRouter
