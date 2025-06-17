const cloudinary = require("cloudinary").v2 ;
const path = require('path');

exports.uploadImageToCloudinary = async (file , folder , height , quality) =>{
const options = {folder} ;
if(height){
    options.height = height ;
}
if(quality){
    options.quality = quality ;

}

options.resource_type = "auto" ;

const filePath = path.resolve(file.tempFilePath);

    if (!file.tempFilePath) {
        throw new Error("Missing file.tempFilePath"); // Defensive check
    }
return await cloudinary.uploader.upload(file.tempFilePath , options );


}