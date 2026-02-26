import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        minlength:6,
        select:false
    },
    authType:{
        type:String,
        enum:["local","google"],
        default:"local"
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    credits:{
        type:Number,
        default:100
    }

}, {timestamps:true})

const User = mongoose.model("User" , userSchema)

export default User
