const User = require("../models/User") ;
const mailSender = require("../utils/MailSender") ;
const bcrypt = require("bcrypt") ; 
const crypto = require("crypto") ;


// Reset password token 
exports.resetPasswordToken  = async (req , res)=>{
     try{
        const {email} = req.body ;

        const user = await User.findOne({email : email}) ;
        if(!user) {
            return res.json({
                success : false ,
                message : "Your email is not registered !!" ,
            });
        }

        const token  = crypto.randomUUID() ;
        const updatedDetails = await User.findOneAndUpdate({email : email}, {
                                                token : token ,
                                                resetPasswordExpires : Date.now() + 5*60*1000 ,
                                                } , {new:true} ,
    
        ) ;
             // creating url using token 

        const url = `http://localhost:3000/update-password/${token}` 
        await mailSender ( email , "Password reset Link " , `Password reset Link : ${url}` ) ;


        return res.json({
            success : true ,
            message : "Email sent Successfully .....check your email and update password !!" ,

        }) ;
 
     }
     catch(error){
        console.log(error) ;
        return res.status(500).json({
            success : false ,
            message : "can not reset password ....try again !!" ,
        }) ;


     }
}





// Update password in DB 
exports.resetPassword = async (req , res)=> {
    try{
        const {password , confirmPassword , token} = req.body ;


        if(password !== confirmPassword){
            return res.json({
                success: false ,
                message : "password not matching" ,
            });
        }


        const userDetails = await User.findOne({token : token}) ;

        if(!userDetails){
            return res.json({
                success: true ,
                message : "Token is Invalid " ,
            });
        }

        if(userDetails.resetPasswordExpires <  Date.now() ){
            return res.json({
                success : false ,
                message : "Token is Expired .....please regenerate again !!" ,
            });
        }

        const hashedPassword  = await bcrypt.hash(password , 10) ;
        await User.findOneAndUpdate (
            {token : token} ,
            {password:hashedPassword},
            {new  :true} ,
        ) ;

        return res.status(200).json({
            success : true ,
            message :"password reset successfully" ,

        }) ;        

    }
    catch(error){

        console.log(error) ;
        return res.status(500).json({
            success : false ,
            message : "something went wrong while reseting password !!" ,
        });
        

    }
}

