"use client";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import AuthGuard from "../components/AuthGuard";
import ProfileEditForm from "../components/ProfileEditForm";

const ProfilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

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

        setUser(await response.json());
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h1 className="text-xl font-semibold text-center mb-4">Profile</h1>

        {loading && <p>Loading profile...</p>}
        {user ? (
          <div className="flex flex-col items-center">
            <img
              src={user.profilePicture || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full border"
            />
            <h2 className="mt-2 font-semibold text-lg">
              {user.username || "Anonymous"}
            </h2>
            <p className="text-gray-500">{user.email}</p>

            {/* ✅ Edit Profile Button */}
            <button
              onClick={() => setEditing(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </button>

            {editing && (
              <ProfileEditForm user={user} onClose={() => setEditing(false)} />
            )}
          </div>
        ) : (
          <p>No user data found.</p>
        )}
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
