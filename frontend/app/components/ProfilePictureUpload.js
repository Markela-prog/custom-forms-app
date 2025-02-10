import { useState } from "react";
import { uploadImage } from "../utils/cloudinary";

const ProfilePictureUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const imageUrl = await uploadImage(file);
      onUploadSuccess(imageUrl);
    } catch (err) {
      setError("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" id="fileInput" />
      <label htmlFor="fileInput" className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded">
        {uploading ? "Uploading..." : "Upload Profile Picture"}
      </label>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ProfilePictureUpload;
