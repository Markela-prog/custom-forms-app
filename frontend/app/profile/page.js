"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfilePictureUpload from "../components/ProfilePictureUpload";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (!storedToken) {
      router.push("/login"); // Redirect to login if not authenticated
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    const fetchUserProfile = async () => {
      try {
        console.log(`📡 Fetching profile with token: ${token}`);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error("❌ Profile fetch error:", error);
        router.push("/login");
      }
    };

    fetchUserProfile();
  }, [token]);

  // ✅ Function to update profile picture in state
  const handleProfileUpdate = async (profilePicture) => {
    try {
      const token = localStorage.getItem("accessToken");
      console.log(`🖼 Updating profile picture with token: ${token}`);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profilePicture }),
      });

      // ✅ Update local state without refreshing the page
      setUser((prev) => ({ ...prev, profilePicture }));
    } catch (error) {
      console.error("❌ Profile update failed:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h1 className="text-xl font-semibold text-center mb-4">Profile</h1>

      {user ? (
        <div className="flex flex-col items-center">
          {/* ✅ Profile picture updates instantly */}
          <img
            src={user.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full border"
          />
          <h2 className="mt-2 font-semibold text-lg">
            {user.username || "Anonymous"}
          </h2>
          <p className="text-gray-500">{user.email}</p>

          {/* ✅ Pass function to update profile picture instantly */}
          <ProfilePictureUpload onUploadSuccess={handleProfileUpdate} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProfilePage;
