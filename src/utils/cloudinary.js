import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Cloudinary configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if the required environment variables are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.log("Cloudinary configuration is missing");  // Logging message
    throw new Error('Cloudinary configuration variables are missing!');  // Throwing the error after logging
}

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return "File path is not provided!";
        
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Allows upload of all types of files (image, video, etc.)
        });
        console.log('File uploaded successfully:', response.url);
        fs.unlinkSync(localFilePath)    
       
        return response;
    } catch (error) {
        // Log the error and remove the local file as the upload operation failed
        console.error("Cloudinary upload error:", error);

        fs.unlinkSync(localFilePath); // Synchronously remove the file
        return null; // Indicate failure
    }
}

export { uploadOnCloudinary };
