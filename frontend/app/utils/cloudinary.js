export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET); // Use env variable
    formData.append("folder", "user-profile-pictures"); // Optional: Organize uploads in Cloudinary
  
    console.log("Uploading file to Cloudinary:", file.name);
  
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
      console.error("Upload Failed:", error);
      throw error;
    }
  };
  