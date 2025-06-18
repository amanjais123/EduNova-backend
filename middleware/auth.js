const jwt = require("jsonwebtoken") ;
require("dotenv").config() ;
const User = require("../models/User") ;




//Auth
exports.auth = async (req , res  ,next) => {
  try {
    console.log("💬 Cookies:", req.cookies);
    console.log("💬 Headers:", req.headers);
    console.log("💬 Body:", req.body);

    const token = req.cookies.token
                || req.body.token
                || req.header("Authorization")?.replace("Bearer ", "") ;

    console.log("Auth middleware triggered");
    console.log("Authorization Header:", req.headers.authorization);
    console.log("🪪 Extracted Token:", token);

    if(!token){
      return res.status(401).json({
        success : false ,
        message : "Token is missing" ,
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
      console.log("JWT verified successfully");
    } catch(err) {
      return res.status(401).json({   // ✅ ADD RETURN
        success : false ,
        message : "Invalid token !!" ,
      });
    }

    next(); // ✅ Only called if verification succeeds
  }
  catch(error){
    return res.status(401).json({   // ✅ ADD RETURN
      success : false ,
      message : "Something went wrong while verifying token",
    });
  }
}




// IsStudent 
exports.isStudent = async (req , res , next) =>{
    console.log("IsStudent me aa gye bhai")
    try{
        if(req.user.accountType !== "Student") {
            console.log("Student nhi ho bhai")
            return res.status(401).json({
                success : false ,
                message : "this is protected route for student only !!" ,
            }) ;
        }
        console.log("Student verified chalo aage")
        next() ;

    }
    catch(error){
        return res.status(401).json({
            success : false ,
            message : "User Role can not be verfied" ,
        }) ;
   }
}




//isInstructor 

exports.isInstructor = async (req , res , next) =>{
    try{
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success : false ,
                message : "this is protected route for Instructor only !!" ,
            }) ;
        }

        next() ;

    }
    catch(error){
        return res.status(401).json({
            success : false ,
            message : "User Role can not be verfied" ,
        }) ;
   }
}




//isAdmin 


exports.isAdmin = async (req , res , next) =>{
    try{
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success : false ,
                message : "this is protected route for Admin  only !!" ,
            }) ;
        }

        next() ;

    }
    catch(error){
        return res.status(401).json({
            success : false ,
            message : "User Role can not be verfied" ,
        }) ;
   }
}

