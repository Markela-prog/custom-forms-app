"use client";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import AuthGuard from "../components/AuthGuard";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import ChangePasswordForm from "../components/ChangePasswordForm";
import StatusMessage from "../components/StatusMessage";
import { Pencil } from "lucide-react";

const ProfilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");

        const userData = await response.json();
        setUser(userData);
        setNewUsername(userData.username || "Anonymous");
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  const handleUsernameChange = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newUsername }),
        }
      );

      if (!response.ok) throw new Error("Failed to update username");

      setUser((prev) => ({ ...prev, username: newUsername }));
      setEditingUsername(false);
      setStatusMessage("Username updated successfully! ✅");
    } catch (error) {
      console.error("Error updating username:", error);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg mt-2">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Profile
        </h1>

        {loading && (
          <p className="text-center text-gray-500">Loading profile...</p>
        )}

        {statusMessage && (
          <StatusMessage
            message={statusMessage}
            onClose={() => setStatusMessage(null)}
          />
        )}

        {user ? (
          <div className="flex flex-col items-center space-y-4">
            {/* Profile Picture */}
            <img
              src={user.profilePicture || "/profile.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full border shadow-lg"
            />

            {/* Change Profile Image Button */}
            <ProfilePictureUpload
              onUploadSuccess={(newPic) => {
                setUser((prev) => ({ ...prev, profilePicture: newPic }));
                setStatusMessage("Profile picture updated! 🖼️");
              }}
            />

            {/* Username Section */}
            <div className="flex items-center space-x-2">
              {editingUsername ? (
                <>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="p-2 border rounded"
                  />
                  <button
                    onClick={handleUsernameChange}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingUsername(false)}
                    className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {user.username || "Anonymous"}
                  </h2>
                  <Pencil
                    size={18}
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => setEditingUsername(true)}
                  />
                </>
              )}
            </div>

            {/* Email */}
            <p className="text-gray-500">{user.email}</p>

            <div className="flex space-x-4">
              {/* Change Password Button */}
              <button
                onClick={() => setChangingPassword(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 shadow-md transition"
              >
                Change Password
              </button>
            </div>

            {/* Change Password Form Modal */}
            {changingPassword && (
              <ChangePasswordForm
                onClose={() => setChangingPassword(false)}
                onStatusMessage={setStatusMessage}
              />
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500">No user data found.</p>
        )}
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
