const Category = require("../models/Categories") ;
const Course = require("../models/Course")
// category ka handler func

 exports.createCategory = async (req , res)=> {
    try{
        const {name , description} = req.body ;

        if(!name || !description){
            return res.status(400).json({
                success : false ,
                message : "All fields are required !!" ,
            })   ;
        }
        const categoryDetails = await Category.create({
            name:name,
            description : description ,

        });
        console.log(categoryDetails) ;
        return res.status(200).json({
            success : true ,
            message : "category created Successfully !!" ,

        });



    }
    catch(error){
        return res.status(500).json({
            success : false ,
            message :"error.message" ,
        }) ;
    }
 }



  

// getAll category  handler func 

exports.showAllCategory = async (req , res)=>{
    try{
          const allCategory = await Category.find({} ,{name:true , description:true } ).populate("courses");

          res.status(200).json({
            success : true ,
            message : "All category Returned successfully " ,
            allCategory ,
          });
         
    }
    catch(error){
             return res.status(500).json({
            success : false ,
            message :error.message ,
        }) ;
    }
}        
  



//category page details 
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    // Step 1: Get selected category
    const selectedCategory = await Category.findById(categoryId).exec();
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Selected category not found",
      });
    }

    // Step 2: Get courses in selected category
    const selectedCategoryCourses = await Course.find({
      category: categoryId,

    })
      .populate("instructor")
       .populate("category")
      .exec();
console.log("Aman jaiswal:", selectedCategoryCourses[0]);
    const differentCategories = await Category.find({
      _id: { $ne: categoryId },
    }).exec();

    // Step 4: Fetch courses for different categories
    const differentCategoryCourses = await Promise.all(
      differentCategories.map(async (category) => {
        const courses = await Course.find({
          category: category._id,
        })
          .populate("instructor")
          .populate("category")
          .exec();

        return { ...category._doc, courses };
      })
    );
console.log("differentCourses:" , differentCategoryCourses) ;
    // Step 5: Get most selling courses
    const mostSellingCourses = await Course.find({})
    //   .sort({ sold: -1 })
    //   .limit(10)
    //   .populate("instructor")
    //   .exec();

    // Step 6: Send response
    return res.status(200).json({
      success: true,
      message: "Category-wise courses fetched successfully",
      data: {
       mostSellingCourses,
       differentCategoryCourses,
       selectedCategoryCourses,
      },
    });
  } catch (error) {
    console.log("Error in categoryPageDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

