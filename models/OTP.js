const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender") ;

const otpSchema= new mongoose.Schema({
    email:{
        type : String ,
        required : true ,
    },
    otp :{
        type : String ,
        required : true ,
    },
    createdAt :{
        type : Date ,
        default : Date.now() ,
        expires : 5*60 ,
    },


}) ;



// mail par otp bhejne ke liye func 

async function sendVerificationEmail(email , otp) {
    try{
        const mailResponse  = await mailSender(email , "Verification Email from EduNova" , otp );
            console.log("Email sent " , mailResponse) ;
        

    }
    catch(error){
        console.log("error occured while sending otp " , error) ;
        throw error ;
    }
}
otpSchema.pre("save" , async function(next){
    await sendVerificationEmail(this.email , this.otp) ;
    next() ;
})


module.exports = mongoose.model("OTP" , otpSchema) ;  
