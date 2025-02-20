"use client";
import { useEffect, useState } from "react";

const TemplateFormsList = ({ templateId }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/forms/template/${templateId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to load forms");

        setForms(await response.json());
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [templateId]);

  if (loading) return <p>Loading forms...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-4">
      {forms.length === 0 ? (
        <p>No forms submitted yet.</p>
      ) : (
        <ul className="space-y-2">
          {forms.map((form) => (
            <li key={form.id} className="p-3 border rounded-lg">
              <p>Submitted by: {form.user.email}</p>
              <p>Date: {new Date(form.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TemplateFormsList;
