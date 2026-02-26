import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

const setAuthCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    credits: user.credits,
    authType: user.authType
})

export const register = async (req,res) => {
    try {
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
            authType: "local"
        })

        const token = await genToken(user._id)
        setAuthCookie(res, token)

        return res.status(201).json(publicUser(user))
    } catch (error) {
        return res.status(500).json({message:`Register error ${error}`})
    }
}

export const login = async (req,res) => {
    try {
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

        const token = await genToken(user._id)
        setAuthCookie(res, token)

        return res.status(200).json(publicUser(user))
    } catch (error) {
        return res.status(500).json({message:`Login error ${error}`})
    }
}


export const googleAuth = async (req,res) => {
    try {
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
                authType:"google"
            })
        }
        const token = await genToken(user._id)
        setAuthCookie(res, token)

        return res.status(200).json(publicUser(user))



    } catch (error) {
        return res.status(500).json({message:`Google auth error ${error}`})
    }
    
}

export const logOut = async (req,res) => {
    try {
        await res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        return res.status(200).json({message:"LogOut Successfully"})
    } catch (error) {
         return res.status(500).json({message:`Logout error ${error}`})
    }
    
}
