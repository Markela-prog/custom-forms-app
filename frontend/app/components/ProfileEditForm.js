"use client";
import { useState } from "react";

const ProfileEditForm = ({ user, onClose }) => {
  const [username, setUsername] = useState(user.username || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user.profilePicture);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Show preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("accessToken");
    const formData = new FormData();
    formData.append("username", username);
    if (image) formData.append("profilePicture", image);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData, // Multipart form data for image upload
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");

      onClose(); // Close form after success
      window.location.reload(); // Refresh page to see changes
    } catch (error) {
      setError("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-4">Edit Profile</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            className="p-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div className="flex flex-col items-center">
            <img
              src={preview || "/default-avatar.png"}
              alt="Preview"
              className="w-24 h-24 rounded-full border mb-2"
            />
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditForm;
