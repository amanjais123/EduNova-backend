const Profile  = require("../models/Profile");
const User  = require("../models/User") ;
const CourseProgress = require("../models/CourseProgress") ;
const Course = require("../models/Course");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
// const { convertSecondsToDuration } = require("../utils/convertSecondsToDuration");

//hamne profile pahle hi bna di h ...null value ke sath ab bs value ko update krdena h 
exports.updateprofile = async (req , res) =>{
try{
    const {dateOfBirth ="" , about="" , contactNumber , gender} = req.body ;
    const id = req.user.id ;

    if(!contactNumber || !gender || !id){
        return res.status(400).json({
            success : false ,
            message : "All firlds are required !!" ,
        });
    }
    const userDetails = await User.findById(id) ;
    const profileId = userDetails.additionalDetails ;
    const profileDetails = await Profile.findById(profileId) ;


    profileDetails.dateOfBirth = dateOfBirth ;
    profileDetails.about = about ;
    profileDetails.gender = gender ;
    profileDetails.contactNumber = contactNumber ;
    await profileDetails.save() ;

    const updatedUser = await User.findById(id).populate("additionalDetails");
    return res.status(200).json({
        success : true ,
        message : "profile updated successfully" ,
        profileDetails ,
    }) ;

}
catch(error){
    console.log(error) ;
    return res.status(500).json({
        success : false ,
        message : "can not update profile "

})
}

}





//delete account 

exports.deleteAccount = async (req ,res) => {
    try{
        const id  = req.user.id ;
        const userDetails = await User.findById(id) ;
        if(!userDetails){
            return res.status(404).json({
                success : false ,
                message : "User not found !"  ,
            });
        }


        //deleting prifile / additional details 

        await Profile.findByIdAndDelete({_id :userDetails.additionalDetails} ) ;


        //deleting user 
        await User.findByIdAndDelete({_id : id});

        return res.status(200).json({
            success : true ,
            message  : "account deleted successfully " ,
        }) ;

    }
    catch(error){
        console.log(error) ;
        return res.status(500).json({
            success : false ,
            message : "can not delete account" ,
        })
    }
}








//get all user details 

exports.getAllUserDetails = async (req , res) => {
    try{
    const id = req.user.id ;

    const userDetails= await User.findById(id).populate("additionalDetails").exec() ;

    return res.status(200).json({
        success : true ,
        message : "User data fetched successfully",
        userDetails ,
    });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success : false ,
            message : "can not fetch users" ,
        }) ;
    }

}




//update profile pic
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: "Image Updated successfully",
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


const convertSecondsToDuration = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

//enrolled courses user ke 
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id
    let userDetails = await User.findOne({
      _id: userId,
    })
      .populate({
        path: "courses",
        populate: {
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        },
      })
      .exec()
    userDetails = userDetails.toObject()
    var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
      let totalDurationInSeconds = 0
      SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        totalDurationInSeconds += userDetails.courses[i].courseContent[
          j
        ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        userDetails.courses[i].totalDuration = convertSecondsToDuration(
          totalDurationInSeconds
        )
        SubsectionLength +=
          userDetails.courses[i].courseContent[j].subSection.length
      }
      let courseProgressCount = await CourseProgress.findOne({
        courseID: userDetails.courses[i]._id,
        userId: userId,
      })
      courseProgressCount = courseProgressCount?.completedVideos.length
      if (SubsectionLength === 0) {
        userDetails.courses[i].progressPercentage = 100
      } else {
        // To make it up to 2 decimal point
        const multiplier = Math.pow(10, 2)
        userDetails.courses[i].progressPercentage =
          Math.round(
            (courseProgressCount / SubsectionLength) * 100 * multiplier
          ) / multiplier
      }
    }

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`,
      })
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}






exports.instructorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const instructor = await User.findById(userId);
    console.log("ammmmmmmm instructor" ,instructor) ;
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    const courses = await Course.find({ instructor: userId })
      .populate("studentsEnrolled")
      .exec();
console.log("ammmmmmmmmm course", courses)  ;
   const courseData = courses.map((course) => {
  const enrolledCount = course.studentsEnrolled.length;
  return {
    _id: course._id,
    courseName: course.courseName,
    courseDescription: course.courseDescription,
    totalStudentsEnrolled: enrolledCount,
    instructorName: `${instructor.firstName} ${instructor.lastName}`,
    price: course.price,
    totalAmountGenerated: enrolledCount * course.price,
  };
});
console.log("course data", courseData)
    return res.status(200).json({
      success: true,
      data: courseData,
    });
  } catch (error) {
    console.log("GET_INSTRUCTOR_API ERROR", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
