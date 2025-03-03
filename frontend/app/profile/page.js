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
  const [salesforceConnected, setSalesforceConnected] = useState(false);

  useEffect(() => {
    // Check if the user is connected to Salesforce
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/salesforce-status`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setSalesforceConnected(data.connected))
      .catch((err) => console.error("Error checking Salesforce status:", err));
  }, []);

  const handleConnectSalesforce = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salesforce/connect`;
  };

  const handleCreateSalesforceAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salesforce/create-account`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setSalesforceConnected(true);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Salesforce Account Creation Error:", error);
      alert("An error occurred while creating a Salesforce account.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectSalesforce = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/salesforce/disconnect`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setSalesforceConnected(false);
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Salesforce Disconnect Error:", error);
      alert("An error occurred while disconnecting from Salesforce.");
    } finally {
      setLoading(false);
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
        <div className="p-6 bg-white shadow-md rounded-lg max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-4">Salesforce Integration</h2>

          {!salesforceConnected ? (
            <button
              onClick={handleConnectSalesforce}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Connect to Salesforce
            </button>
          ) : (
            <>
              <button
                onClick={handleCreateSalesforceAccount}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
                disabled={loading}
              >
                {loading ? "Syncing..." : "Create Salesforce Account"}
              </button>

              <button
                onClick={handleDisconnectSalesforce}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Disconnecting..." : "Disconnect from Salesforce"}
              </button>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
