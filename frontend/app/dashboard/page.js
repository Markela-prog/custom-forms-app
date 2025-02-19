"use client";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import AuthGuard from "../components/AuthGuard";

const DashboardPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [templates, setTemplates] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return; // Ensure user is logged in before fetching data

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const [templatesRes, formsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/templates`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forms/user`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!templatesRes.ok || !formsRes.ok)
          throw new Error("Failed to load data");

        setTemplates(await templatesRes.json());
        setForms(await formsRes.json());
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  return (
    <AuthGuard>
      {" "}
      {/* ✅ Ensures user is logged in before rendering */}
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center">Dashboard</h1>

        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex justify-between mt-4">
          <h2 className="text-xl font-semibold">Available Templates</h2>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => router.push("/templates/create")}
          >
            ➕ Create New Template
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
        <h2 className="text-xl font-semibold mt-6">My Submitted Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {forms.map((form) => (
            <div
              key={form.id}
              className="p-4 border rounded-lg shadow cursor-pointer hover:shadow-lg"
              onClick={() => router.push(`/forms/${form.id}`)}
            >
              <h2 className="font-semibold">{form.template.title}</h2>
              <p className="text-gray-500">
                Submitted on: {new Date(form.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;
