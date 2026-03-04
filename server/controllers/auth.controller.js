import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"
import crypto from "crypto"
import { sendPasswordResetEmail } from "../config/mail.js"

const isProduction = process.env.NODE_ENV === "production"
const isRender = process.env.RENDER === "true"
const hasRemoteClient = (process.env.CLIENT_URL || "")
    .split(",")
    .map((url) => url.trim())
    .some((url) => url.startsWith("https://") && !url.includes("localhost"))
const useCrossSiteCookies = isProduction || isRender || hasRemoteClient
const cookieOptions = {
    httpOnly: true,
    secure: useCrossSiteCookies,
    sameSite: useCrossSiteCookies ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const setAuthCookie = (res, token) => {
    res.cookie("token", token, cookieOptions)
}

const isDbConnected = () => mongoose.connection.readyState === 1

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "user",
    planType: user.planType || "free",
    credits: user.credits,
    authType: user.authType
})

const resolveRoleByEmail = (email) => {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    return adminEmail && email === adminEmail ? "admin" : "user"
}

export const register = async (req,res) => {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({ message: "Database unavailable. Please try again in a moment." })
        }

        let {name, email, password} = req.body

        name = name?.trim()
        email = email?.trim().toLowerCase()

        if (!name || !email || !password) {
            return res.status(400).json({message:"Name, email and password are required"})
        }

        if (password.length < 6) {
            return res.status(400).json({message:"Password must be at least 6 characters"})
        }

        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).json({message:"User already exists. Please login."})
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            authType: "local",
            role: resolveRoleByEmail(email)
        })

        const token = await genToken(user._id)
        setAuthCookie(res, token)

        return res.status(201).json({ ...publicUser(user), token })
    } catch (error) {
        return res.status(500).json({message:`Register error ${error}`})
    }
}

export const login = async (req,res) => {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({ message: "Database unavailable. Please try again in a moment." })
        }

        let {email, password} = req.body
        email = email?.trim().toLowerCase()

        if (!email || !password) {
            return res.status(400).json({message:"Email and password are required"})
        }

        const user = await User.findOne({email}).select("+password")
        if (!user || !user.password) {
            return res.status(400).json({message:"Invalid email or password"})
        }

        const isMatched = await bcrypt.compare(password, user.password)
        if (!isMatched) {
            return res.status(400).json({message:"Invalid email or password"})
        }

        const expectedRole = resolveRoleByEmail(email)
        if (user.role !== expectedRole) {
            user.role = expectedRole
            await user.save()
        }

        const token = await genToken(user._id)
        setAuthCookie(res, token)

        return res.status(200).json({ ...publicUser(user), token })
    } catch (error) {
        console.error("Login error:", error)
        return res.status(500).json({message:`Login error ${error}`})
    }
}


export const googleAuth = async (req,res) => {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({ message: "Database unavailable. Please try again in a moment." })
        }

        let {name , email} = req.body
        name = name?.trim()
        email = email?.trim().toLowerCase()

        if (!name || !email) {
            return res.status(400).json({message:"Name and email are required"})
        }

        let user = await User.findOne({email})
        if(!user){
            user = await User.create({
                name , 
                email,
                authType:"google",
                role: resolveRoleByEmail(email)
            })
        } else {
            const expectedRole = resolveRoleByEmail(email)
            if (user.role !== expectedRole) {
                user.role = expectedRole
                await user.save()
            }
        }
        const token = await genToken(user._id)
        setAuthCookie(res, token)

        return res.status(200).json({ ...publicUser(user), token })



    } catch (error) {
        console.error("Google auth error:", error)
        return res.status(500).json({message:`Google auth error ${error}`})
    }
    
}

export const logOut = async (req,res) => {
    try {
        await res.clearCookie("token", {
            httpOnly: true,
            secure: cookieOptions.secure,
            sameSite: cookieOptions.sameSite
        })
        return res.status(200).json({message:"LogOut Successfully"})
    } catch (error) {
         return res.status(500).json({message:`Logout error ${error}`})
    }
    
}

export const forgotPassword = async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({ message: "Database unavailable. Please try again in a moment." })
        }

        let { email } = req.body
        email = email?.trim().toLowerCase()

        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpires")

        // Return success even when user does not exist to avoid email enumeration.
        if (!user) {
            return res.status(200).json({ message: "If this email exists, reset instructions were sent." })
        }

        const rawToken = crypto.randomBytes(32).toString("hex")
        const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")

        user.resetPasswordToken = hashedToken
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        await user.save()

        const clientBaseUrl =
            process.env.RESET_PASSWORD_URL ||
            (process.env.CLIENT_URL || "").split(",")[0]?.trim() ||
            "http://localhost:5173"
        const resetUrl = `${clientBaseUrl.replace(/\/$/, "")}/reset-password/${rawToken}`

        await sendPasswordResetEmail({
            to: user.email,
            name: user.name,
            resetUrl,
        })

        return res.status(200).json({ message: "If this email exists, reset instructions were sent." })
    } catch (error) {
        return res.status(500).json({ message: `Forgot password error ${error}` })
    }
}

export const resetPassword = async (req, res) => {
    try {
        if (!isDbConnected()) {
            return res.status(503).json({ message: "Database unavailable. Please try again in a moment." })
        }

        const { token } = req.params
        const { password } = req.body

        if (!token || !password) {
            return res.status(400).json({ message: "Token and password are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        }).select("+password +resetPasswordToken +resetPasswordExpires")

        if (!user) {
            return res.status(400).json({ message: "Reset link is invalid or expired" })
        }

        user.password = await bcrypt.hash(password, 10)
        user.authType = "local"
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        return res.status(200).json({ message: "Password reset successful. Please login." })
    } catch (error) {
        return res.status(500).json({ message: `Reset password error ${error}` })
    }
}
