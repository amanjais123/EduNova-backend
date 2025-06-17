const Course = require("../models/Course") ;
const RatingAndReview = require("../models/RatingAndReview");
const Category = require("../models/Categories") ;
const User  = require("../models/User") ;
const {uploadImageToCloudinary} = require("../utils/imageUploader") ;
const Section = require("../models/Section")         // adjust path if needed
const SubSection = require("../models/SubSection") 
// const convertSecondsToDuration = require("../utils/convertSecondsToDuration");


const CourseProgress = require("../models/CourseProgress");

// create course handler 

exports.createCourse = async (req , res) => {
    try{
        const {courseName , courseDescription , whatYouWillLearn , price , category} = req.body ;


        if (!req.files || !req.files.thumbnailImage) {
    return res.status(400).json({
        success: false,
        message: "Thumbnail image is required",
    });
}


        const thumbnail = req.files.thumbnailImage ;
if (!thumbnail.tempFilePath) {
    return res.status(500).json({
        success: false,
        message: "Temporary file path not found. File may be missing.",
    });
}


        if(!courseName || !courseDescription || !price || !category  || !whatYouWillLearn) {
            return res.status(400).json({
                success : false ,
                message : "All fields are required !!" ,
            });
        }


    //we have to store the instructor id in course 

    const userId = req.user.id ;
    const instructorDetails = await User.findById(userId) ;
    console.log("Instructor Details : " , instructorDetails) ;

    if(!instructorDetails){
        return res.status(404).json({
            success : false ,
            message : "Instructor details not found !!" ,
        });
    }
    const categoryDetails = await Category.findById(category) ;
    if(!categoryDetails){
           return res.status(404).json({
            success : false ,
            message : "Category details not found !!" ,
        });
    }
    //image upload to cloudinary 
    console.log("FILE RECEIVED", req.files);
console.log("TEMP FILE PATH", thumbnail.tempFilePath);
 const thumbnailImage = await uploadImageToCloudinary(thumbnail , process.env.FOLDER_NAME) ;

     

//console.log(thumbnailImage) ;

    //create new emrty of course 

    const  newCourse = await Course.create({
        courseName,
        courseDescription,
        instructor: instructorDetails._id ,
        whatYouWillLearn :  whatYouWillLearn ,
        price ,
        category : categoryDetails._id ,
      thumbnail : thumbnailImage.secure_url ,
    })



    //add course in list 
    await User.findByIdAndUpdate(
        {_id : instructorDetails._id} ,
        {
            $push : {
                course : newCourse._id ,
            }
        },
        {new : true} ,  
    )
       

    //   update the category schema 


    await Category.findByIdAndUpdate(
        categoryDetails._id ,
        {
            $push : {
                Course : newCourse._id ,
            },
        },
        {new : true} 
    ) ;







    return res.status(200).json({
        success : true ,
        message : "new course created successefully !!" ,
        data : newCourse ,
    });

    }
    catch(error){
        console.error(error) ;
         return res.status(500).json({
            success :false,
            message : "new course cannot be created !!" ,
            error : error.message ,

    }) ;

}
}




//get All Courses handler 


exports.showAllCourses = async (req , res) =>{
    try{
        const allCourses = await Courses.find({}, {courseName :true ,
                                                        price : true ,
                                                        thumbnail:true ,
                                                           instructor:true ,
                                                        RatingAndReview:true ,
                                                        studentsEnrolled :true ,  })
                                                        .populate("instructor")
                                                        .exec() ;


        return res.status(200).json({
            success : true ,
            message : "Date for all courses fetched successfully ",

            data : allCourses ,
        }) ;   
    }
    catch(error){
        console.log(error) ;
        return res.status(500),json({
            success : true ,
            message : "Can not fetch course data ",
            error: error.message , 
        });
    }
}



//get course details 

exports.getCourseDetails = async (req , res) =>{
    try{
        const {courseId} = req.body ;

        const courseDetails = await Course.find(
            {_id : courseId}).populate(
                {path : "instructor" ,
                    populate  :{
                        path : "additionalDetails" ,
                    } ,

                }
            )
            .populate("category")
            .populate("ratingAndReview")
            .populate({
                path : "courseContent" ,
                populate:{
                    path : "subSection" ,              
                 },
            }
        )
        .exec();






     if(!courseDetails){
        return res.status(400).json({
            success:false ,
            message : "could not find course",
        });
     }



     return res.status(200).json({
        success : true ,
        message : "course details fetched successfully" ,
        data : courseDetails,
     });
    }
    catch(error){
        console.log(error) ;
        return res.status(500).json({
            success : false ,
            message :error.message ,
        });

    }
}




// Edit Course Details
exports.editCourse = async (req, res) => {
	try {
	  const { courseId } = req.body
	  const updates = req.body
	  const course = await Course.findById(courseId)
  
	  if (!course) {
		return res.status(404).json({ error: "Course not found" })
	  }
  
	  // If Thumbnail Image is found, update it
	  if (req.files) {
		console.log("thumbnail update")
		const thumbnail = req.files.thumbnailImage
		const thumbnailImage = await uploadImageToCloudinary(
		  thumbnail,
		  process.env.FOLDER_NAME
		)
		course.thumbnail = thumbnailImage.secure_url
	  }
  
	  // Update only the fields that are present in the request body
	  for (const key in updates) {
		if (Object.prototype.hasOwnProperty.call(updates, key)) {

		  if (key === "tag" || key === "instructions") {
			course[key] = JSON.parse(updates[key])
		  } else {
			course[key] = updates[key]
		  }
		}
	  }
  
	  await course.save()
  
	  const updatedCourse = await Course.findOne({
		_id: courseId,
	  })
		.populate({
		  path: "instructor",
		  populate: {
			path: "additionalDetails",
		  },
		})
		.populate("category")
		// .populate("ratingAndReviews")
		.populate({
		  path: "courseContent",
		  populate: {
			path: "subSection",
		  },
		})
		.exec()
  
	  res.json({
		success: true,
		message: "Course updated successfully",
		data: updatedCourse,
	  })
	} catch (error) {
	  console.error(error)
	  res.status(500).json({
		success: false,
		message: "Internal server error",
		error: error.message,
	  })
	}
}



exports.getFullCourseDetails = async (req, res) => {
  try {
    console.log("🚀 getFullCourseDetails called");

    const { courseId } = req.body;
    const userId = req.user.id;

    console.log("📦 courseId:", courseId);
    console.log("👤 userId:", userId);

    const courseDetails = await Course.findOne({ _id: courseId })
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .populate("studentsEnrolled", "_id")
      .exec();

    console.log("📚 courseDetails fetched:", !!courseDetails);

    if (!courseDetails) {
      console.log("❌ No courseDetails found");
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    if (courseDetails.status === "Draft") {
      console.log("⛔ Course is in draft status");
      return res.status(403).json({
        success: false,
        message: `Accessing a draft course is forbidden`,
      });
    }

    let courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId,
    });

    console.log("✅ courseProgressCount found:", !!courseProgressCount);

    let totalDurationInSeconds = 0;
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration || 0);
        totalDurationInSeconds += timeDurationInSeconds;
      });
    });

    // const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    console.log("✅ Returning data: ", {
      courseDetails,
      totalDurationInSeconds,
      completedVideos: courseProgressCount?.completedVideos || [],
    });

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDurationInSeconds,
        completedVideos: courseProgressCount?.completedVideos || [],
      },
    });
  } catch (error) {
    console.log("💥 Error in getFullCourseDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};










  // Get a list of Course for a given Instructor
  exports.getInstructorCourses = async (req, res) => {
	try {
	  // Get the instructor ID from the authenticated user or request body
	  const instructorId = req.user.id
  
	  // Find all courses belonging to the instructor
	  const instructorCourses = await Course.find({
		instructor: instructorId,
	  }).sort({ createdAt: -1 })
  
	  // Return the instructor's courses
	  res.status(200).json({
		success: true,
		data: instructorCourses,
	  })
	} catch (error) {
	  console.error(error)
	  res.status(500).json({
		success: false,
		message: "Failed to retrieve instructor courses",
		error: error.message,
	  })
	}
  }

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // ✅ Fix here: get enrolled students from the course instance
    const studentsEnrolled = course.studentsEnrolled

    // Check if studentsEnrolled is iterable
    if (Array.isArray(studentsEnrolled)) {
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
