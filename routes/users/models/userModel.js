
import mongoose from "mongoose"



const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    firstname:{
        type:String,
        required: true
    },
    surname:{
        type:String,
        required: true
    },
    email:{
      type: String,
      required: true
    },
    preferences:{
        type:[String]
    }

})

const userModel = mongoose.model('users',userSchema)


export default userModel