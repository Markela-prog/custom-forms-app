export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "profile_pictures"); // Change this in Cloudinary settings
  
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
  
    if (!response.ok) throw new Error("Image upload failed");
  
    const data = await response.json();
    return data.secure_url; // Returns the uploaded image URL
  };
  