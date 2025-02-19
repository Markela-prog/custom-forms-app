"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates?search=${searchQuery}`
      );
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center">Explore Templates</h1>

      {/* Search Bar */}
      <div className="flex mt-4">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* Loading / Error Handling */}
      {loading ? <p>Loading templates...</p> : null}
      {error ? <p className="text-red-500">{error}</p> : null}

      {/* Templates List */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="p-4 border rounded-lg shadow cursor-pointer hover:shadow-lg"
            onClick={() => router.push(`/templates/${template.id}`)}
          >
            <h2 className="font-semibold text-lg">{template.title}</h2>
            <p className="text-gray-500">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
