import {v2 as cloudinary} from cloudinary
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_kEY, 
    api_secret: CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath) return "file path is not ther!!"
        //upload the file on cloudinary
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //File have been uploaded successfully
        console.log('file have been uploaded successfully',response.url);
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as upload operation got failed
        return null
    }
}

export {uploadOnCloudinary}