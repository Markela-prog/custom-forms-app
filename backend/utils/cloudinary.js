import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = (fileBuffer, fileType) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        {
          folder: "user-profile-pictures",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            reject("Image upload failed");
          } else {
            console.log("✅ Cloudinary Upload Success:", result);
            resolve(result.secure_url); // ✅ Resolve with just the URL
          }
        }
      )
      .end(fileBuffer);
  });
};

export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    // Extract full public_id from Cloudinary URL
    const regex = /\/user-profile-pictures\/([^/]+)\./; // Match entire name including suffix
    const match = imageUrl.match(regex);

    if (!match || !match[1]) {
      throw new Error("Invalid image URL format");
    }

    const publicId = `user-profile-pictures/${match[1]}`;
    console.log(`🗑 Deleting old profile picture: ${publicId}`);

    // Call Cloudinary API to delete the image
    const result = await cloudinary.v2.uploader.destroy(publicId);

    if (result.result !== "ok") {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    console.log("✅ Successfully deleted old image:", publicId);
  } catch (error) {
    console.error("❌ Error deleting old profile picture:", error);
  }
};
