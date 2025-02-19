"use client";
import { useState } from "react";
import { Upload } from "lucide-react"; // Icon for upload

const ProfilePictureUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload image");

      onUploadSuccess(URL.createObjectURL(file));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <label className="flex items-center space-x-2 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      <Upload size={18} />
      <span>{uploading ? "Uploading..." : "Upload New Picture"}</span>
      <input type="file" className="hidden" onChange={handleFileChange} />
    </label>
  );
};

export default ProfilePictureUpload;
