import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileBuffer, fileType) => {
  try {
    const result = await cloudinary.v2.uploader.upload_stream(
      {
        folder: "user-profile-pictures",
        resource_type: "image",
      },
      (error, result) => {
        if (error) throw new Error("Image upload failed");
        return result.secure_url;
      }
    ).end(fileBuffer);

    return result;
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    throw new Error("Failed to upload image");
  }
};

export const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
    console.log(`🗑 Deleting old profile picture: ${publicId}`);

    const result = await cloudinary.v2.uploader.destroy(`user-profile-pictures/${publicId}`);

    if (result.result !== "ok") throw new Error("Failed to delete image");

    console.log("✅ Successfully deleted old image:", publicId);
  } catch (error) {
    console.error("❌ Error deleting old profile picture:", error);
  }
};
