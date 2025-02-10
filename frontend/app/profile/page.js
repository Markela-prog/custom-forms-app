"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfilePictureUpload from "../components/ProfilePictureUpload";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login"); // Redirect if not authenticated
      return;
    }

    const fetchUserProfile = async () => {
      try {
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
        console.log("👤 User Profile:", data);
        setUser(data);
      } catch (error) {
        console.error("Profile fetch error:", error);
        router.push("/login");
      }
    };

    fetchUserProfile();
  }, []);

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

          <ProfilePictureUpload onUploadSuccess={() => {}} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ProfilePage;
