"use client";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";

const LikeButton = ({
  templateId,
  initialLikes,
  initialLiked,
  onLikeUpdate,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(initialLiked);
    setLikes(initialLikes);
  }, [initialLikes, initialLiked]);

  const handleLike = async (event) => {
    event.stopPropagation(); // Prevent click from triggering template redirect

    if (!isAuthenticated) {
      alert("You need to be logged in to like a template.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/likes/${templateId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to update like.");

      const data = await response.json();
      setLiked(data.liked);
      setLikes(data.totalLikes);

      // Notify parent component (HomePage) to update UI
      if (onLikeUpdate) {
        onLikeUpdate(templateId, data.liked, data.totalLikes);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        liked
          ? "bg-red-500 text-white"
          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
      }`}
    >
      {liked ? "❤️" : "🤍"} {likes}
    </button>
  );
};

export default LikeButton;
