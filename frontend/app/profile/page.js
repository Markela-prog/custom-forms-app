"use client";
import { useEffect, useState } from "react";
import ProfilePictureUpload from "../components/ProfilePictureUpload";

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            credentials: "include",
          }
        );

        console.log("API Response:", response);

        if (!response.ok) {
          throw new Error(
            `HTTP Error: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Parsed JSON:", data);
        setUser(data);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileUpdate = async (profilePicture) => {
    try {
      await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePicture }),
      });
      setUser((prev) => ({ ...prev, profilePicture }));
    } catch (error) {
      console.error("Profile update failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h1 className="text-xl font-semibold text-center mb-4">Profile</h1>

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

          <ProfilePictureUpload onUploadSuccess={handleProfileUpdate} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProfilePage;
