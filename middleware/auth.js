
require("dotenv").config() ;
const User = require("../models/User") ;



const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || 
      req.body?.token || 
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);
console.log("🧪 Cookies:", req.cookies);
console.log("🧪 Auth Header:", req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // 👈 Now your controller can access req.user.id
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

  } catch (err) {
    console.error("Error in auth middleware:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during authentication",
    });
  }
};





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

