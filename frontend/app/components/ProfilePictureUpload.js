"use client";
import { useState } from "react";
import { Upload, Loader2, CheckCircle, XCircle } from "lucide-react";

const ProfilePictureUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("profilePicture", file);

      console.log("📡 Uploading Image:", file.name);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData, // Send file as FormData
        }
      );

      const responseText = await response.text();
      console.log("🔍 Server Response:", responseText); // Debug response text

      if (!response.ok) {
        console.error("❌ Profile update failed:", responseText);
        throw new Error("Profile update failed");
      }

      const data = JSON.parse(responseText);
      onUploadSuccess(data.user.profilePicture);

      setStatusMessage("Profile picture updated successfully!");
      setStatusType("success");
    } catch (err) {
      setStatusMessage("Failed to upload image.");
      setStatusType("error");
      console.error("🚨 Upload Error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 shadow-md hover:bg-blue-600 transition"
      >
        {uploading ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          <Upload className="w-5 h-5" />
        )}
        {uploading ? "Uploading..." : "Upload Profile Picture"}
      </label>

      {/* ✅ Status Messages */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
            statusType === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {statusType === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-700" />
          ) : (
            <XCircle className="w-5 h-5 text-red-700" />
          )}
          <p>{statusMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
