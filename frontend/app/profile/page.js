"use client";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import AuthGuard from "../components/AuthGuard";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import ChangePasswordForm from "../components/ChangePasswordForm";
import StatusMessage from "../components/StatusMessage";
import { Pencil } from "lucide-react";
import axios from "axios";

const ProfilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    accountName: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleAuthRedirect = () => {
    window.location.href = "https://custom-forms-app-r0hw.onrender.com/api/salesforce/login";
  };
  

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!user.salesforceAccessToken || !user.salesforceInstanceUrl) {
      alert("Please authenticate with Salesforce first.");
      return;
    }

    try {
      const response = await axios.post(
        "https://custom-forms-app-r0hw.onrender.com/api/salesforce/create-account",
        {
          ...formData,
          salesforceToken: user.salesforceAccessToken,
          instanceUrl: user.salesforceInstanceUrl,
        }
      );

      if (response.data.success) {
        alert("Salesforce Account and Contact created!");
      } else {
        alert("Failed to create Salesforce account.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

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
      <div className="max-w-3xl mx-auto p-6 bg-background dark:bg-gray-900 rounded-lg shadow-lg mt-2">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground dark:text-white">
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
              className="w-32 h-32 rounded-full border shadow-none bg-transparent profile-picture bg-white"
            />

            {/* Change Profile Image Button */}
            <ProfilePictureUpload
              onUploadSuccess={(newPic) => {
                setUser((prev) => ({ ...prev, profilePicture: newPic }));
                setStatusMessage("Profile picture updated! 🖼️");
              }}
            />

            {/* Username Section */}
            <div className="flex flex-col items-center w-full px-4 sm:flex-row sm:justify-center sm:gap-x-4">
              {editingUsername ? (
                <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 items-center">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="p-2 border rounded w-full sm:w-[200px] md:w-[250px] lg:w-[300px] text-center sm:text-left"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleUsernameChange}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full sm:w-auto transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingUsername(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full sm:w-auto transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                  <h2 className="text-xl font-semibold text-foreground dark:text-white">
                    {user.username || "Anonymous"}
                  </h2>
                  <Pencil
                    size={20}
                    className="cursor-pointer text-gray-500 hover:text-gray-700 transition-all"
                    onClick={() => setEditingUsername(true)}
                  />
                </div>
              )}
            </div>

            {/* Email */}
            <p className="text-foreground">{user.email}</p>

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

        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={handleAuthRedirect}
        >
          Connect to Salesforce
        </button>

        <button
          className="mt-4 ml-2 px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => setShowForm(true)}
        >
          Create Salesforce Account
        </button>

        {showForm && (
          <form
            className="mt-4 p-4 border rounded bg-gray-100"
            onSubmit={handleFormSubmit}
          >
            <div className="mb-2">
              <label className="block font-medium">Account Name</label>
              <input
                type="text"
                className="border p-2 w-full"
                required
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="block font-medium">First Name</label>
              <input
                type="text"
                className="border p-2 w-full"
                required
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="block font-medium">Last Name</label>
              <input
                type="text"
                className="border p-2 w-full"
                required
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>

            <div className="mb-2">
              <label className="block font-medium">Email</label>
              <input
                type="email"
                className="border p-2 w-full"
                required
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
