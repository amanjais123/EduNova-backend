const express = require("express")
const router = express.Router()


const { auth, isStudent , isInstructor} = require("../middleware/auth")
const {
  deleteAccount,
  updateprofile,
  getAllUserDetails,
updateDisplayPicture,
instructorDashboard,
getEnrolledCourses
  
} = require("../controllers/Profile")
console.log("profileRoutes me aa gye");


router.delete("/deleteProfile",auth, deleteAccount)
router.put("/updateProfile", auth, updateprofile)
router.get("/getUserDetails", auth, getAllUserDetails)

router.get("/getEnrolledCourses",auth,isStudent, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructor", auth,isInstructor, instructorDashboard)



module.exports = router ;
