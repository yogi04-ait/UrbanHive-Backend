require('dotenv').config();
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: "urbanHive", 
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({
                        publicId: result.public_id, 
                        imageUrls: result.secure_url,
                    });
                }
            }
        ).end(file.buffer);
    });
};

const uploadMultipleAndStore = async (files) => {
    try {
        const uploadPromises = files.map((file) => uploadToCloudinary(file));
        const imageData = await Promise.all(uploadPromises);
        return imageData;
    } catch (error) {
        console.log("Error in uploading images", error);
        return [];  
    }
};

module.exports = { uploadMultipleAndStore };
