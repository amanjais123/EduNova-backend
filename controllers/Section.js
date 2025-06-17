const Section = require("../models/Section") ;
const Course = require("../models/Course") ;

const SubSection = require("../models/SubSection") ;



//create section 

exports.createSection = async (req , res) => {
    try{
        const {sectionName , courseId} = req.body ;

        if(!sectionName || !courseId){
            return res.status(400).json({
                success : false ,
                message  : "missing propertiies" ,
            });
        }


        const newSection  = await Section.create({sectionName}) ;
 await Course.findByIdAndUpdate(
            courseId , 
            {
                $push : {
                    courseContent : newSection._id ,
                }
            },
            {new : true} ,
        ) ;
    const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection", // Optional, only if you want nested subsections
        },
      })
      .exec();




        return res.status(200).json({
            success : true ,
            message : "section created Successfullly !!" ,
            updatedCourse,
        });





    }
    catch(error){
        console.log(error) ;
        return res.status(500).json({
            success : true ,
            message : "can not create a section !!" ,
        })

    }
}




// update section 


exports.updateSection = async (req , res) => {
    try{
        const {sectionName , sectionId , courseId} = req.body ;

        
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success : false ,
                message : "missing properties" ,
            }) ;
        }


await Section.findByIdAndUpdate(sectionId , {sectionName} , {new: true}) ;
   const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      });

        return res.status(200).json({
            success : true ,
            message : "Section updated successfullly" ,
       data: updatedCourse ,
        }) ;
    }
    catch(error){

        console.log(error) ;
        return res.status(400).json({ 
         success : false ,
        message : "canot update section !!" ,
            }) ;


    }
}


//delete section 

exports.deleteSection = async (req , res) => {
    try{

        const {sectionId , courseId} = req.body ;
        await Course.findByIdAndUpdate(courseId ,
            {
                $pull :{
                    courseContent:sectionId,
                }
            }

        ) ;

        const section = await Section.findById(sectionId);
        if(!section){
            return res.status(404).json({
                success:false,
                message:"section not found",
            })
        }

        await SubSection.deleteMany({_id:{$in: section.subSection}});
        await Section.findByIdAndUpdate(sectionId) ;
         const updatedCourse = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec() ;


        return res.status(200).json({
            success  :true ,
            message : "Section deleted ",
            data : updatedCourse ,
        });


    }
    catch(error){
        console.log(error) ;
        return res.status(500).json({
            success : false ,
            message : "can not delete section " ,
        });
    
    }
}