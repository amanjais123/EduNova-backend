const RatingAndReview=require("../models/RatingAndReview");
const Course=require("../models/Course");
const { default: mongoose } = require("mongoose");

//create Rating
exports.createRating=async(req,res) =>{
    try{
        const userId=req.user.id;
        const {rating,review,courseId} =req.body;
        const courseDetails =await Course.findOne(
                                         {_id:courseId,
                                        studentsEnrolled:{$elemMatch: {$eq:userId}},
                                         });
        if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"Student is not enrolled in the course",
            });
        }
        const alreadyReviewed=await RatingAndReview.findOne({
                                                user:userId,
                                                course:courseId,
                                                });
        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already reviewed by the user",
            });
        }
        //create rating and review
        const ratingReview =await RatingAndReview.create({
                                          rating,review,
                                          course:courseId,
                                          user:userId, 
                                        });
        //update the course with rating
        const updatedCourseDetails= await Course.findByIdAndUpdate({_id:courseId},
                                    {
                                        $push:{
                                            ratingAndReviews:ratingReview._id,
                                        }
                                    },
                                    {new:true});
        console.log(updatedCourseDetails);
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};



//get Average Rating
exports.getAverageRating =async(req,res) =>{
    try{
        const courseId=req.body.courseId;

        const result= await RatingAndReview.aggregate([
            {
                $match:{
                    course:mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ])
        
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }

        //if no rating/review exist 
        return res.status(200).json({
            success:true,
            message:'Average rating is 0,no ratings given till now',
            averageRating:0,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}



exports.getAllRating=async(req,res) =>{
    console.log("into the get all ratings")
    try{
        console.log("try block me aa gye hoooye")
        const allReviews=await RatingAndReview.find({})
                                              .sort({rating:"desc"})
                                              .populate({
                                                path:"user",
                                                select:"firstName lastName email image",
                                              })
                                              .populate({
                                                path:"course",
                                                select:"courseName",
                                              })
                                              .exec();
        return res.status(200).json({
            success:true,
            message:"All Reviews fetched Successfully",
            data:allReviews,
        });                                      
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}
