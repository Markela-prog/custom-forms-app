export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
  formData.append("folder", "user-profile-pictures");

  console.log(`📤 Uploading file to Cloudinary: ${file.name}`);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Cloudinary Upload Error:", errorText);
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    console.log("✅ Cloudinary Upload Success:", data);
    return data.secure_url;
  } catch (error) {
    console.error("❌ Upload Failed:", error);
    throw error;
  }
};

export const deleteImage = async (imageUrl) => {
    if (!imageUrl) return;
  
    try {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract Cloudinary ID
      console.log(`🗑 Deleting old profile picture: ${publicId}`);
  
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_id: `user-profile-pictures/${publicId}`,
            api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
            timestamp: new Date().getTime(),
            signature: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
          }),
        }
      );
  
      const data = await response.json();
      if (data.result !== "ok") throw new Error("Failed to delete image");
  
      console.log("✅ Successfully deleted old image:", publicId);
    } catch (error) {
      console.error("❌ Failed to delete old profile picture:", error);
    }
  };

  
  