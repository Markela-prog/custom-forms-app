"use client";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/authContext";
import { useRouter } from "next/navigation";
import LikeButton from "./components/LikeButton";

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [templates, setTemplates] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/templates`
        );

        if (!response.ok) throw new Error("Failed to load templates");

        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center">Explore Templates</h1>

      {loading && <p>Loading templates...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="p-4 border rounded-lg shadow hover:shadow-lg flex flex-col"
          >
            <div
              className="cursor-pointer flex-grow"
              onClick={() => router.push(`/templates/${template.id}`)}
            >
              <h2 className="font-semibold text-lg">{template.title}</h2>
              <p className="text-gray-500">{template.description}</p>
            </div>

            {/* Separate Like Button - Prevent Redirect */}
            <div className="mt-2">
              <LikeButton
                templateId={template.id}
                initialLikes={template.stats?.totalLikes ?? 0} // Ensure totalLikes is always present
                initialLiked={isAuthenticated ? template.isLikedByUser : false} // Only show user likes if authenticated
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
