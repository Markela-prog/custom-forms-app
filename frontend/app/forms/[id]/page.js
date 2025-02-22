"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "../../context/authContext";
import QuestionField from "@/app/components/QuestionField";

const FormPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const [formId, setFormId] = useState(null);
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templateOwnerId, setTemplateOwnerId] = useState(null);

  useEffect(() => {
    if (params?.id) {
      setFormId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (!formId) return;

    const fetchForm = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/forms/${formId}`,
          { headers }
        );

        if (!response.ok) throw new Error("Form not found or access denied");

        const data = await response.json();
        setForm(data);
        setTemplateOwnerId(data?.template?.ownerId);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchForm();
  }, [formId, isAuthenticated]);

  useEffect(() => {
    if (!form?.templateId) return;

    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${form.templateId}`,
          { headers }
        );

        if (!response.ok) throw new Error("Failed to fetch questions");

        const data = await response.json();
        setQuestions(data.sort((a, b) => a.order - b.order));
      } catch (error) {
        console.error("Error fetching questions:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [form?.templateId, isAuthenticated]);

  if (loading) return <p>Loading form...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const isOwnerOrAdmin =
    user?.role === "ADMIN" ||
    form?.userId === user?.id ||
    templateOwnerId === user?.id;

  if (!isOwnerOrAdmin) {
    return (
      <p className="text-red-500">
        Access denied. You do not have permission to view this form.
      </p>
    );
  }

  const enrichedQuestions = questions.map((question) => {
    const answer = form?.answers.find((a) => a.questionId === question.id);
    return { ...question, value: answer?.value || "" };
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 🔹 Form Title */}
      <h1 className="text-3xl font-bold text-center">
        {form?.template?.title}
      </h1>
      <p className="text-gray-600 text-center mb-2">
        {form?.template?.description}
      </p>

      {/* 🔹 Display Questions and Answers */}
      <div className="mt-6 p-6 border rounded-lg shadow bg-white">
        <h2 className="text-2xl font-semibold mb-4">User's Responses</h2>

        {enrichedQuestions.map((question) => (
          <div key={question.id} className="mb-4">
            <label className="block text-lg font-medium mb-1">
              {question.title}
            </label>
            <QuestionField
              question={question}
              value={question.value}
              disabled
            />
          </div>
        ))}
      </div>

      {/* 🔹 Back to Template Button */}
      {isOwnerOrAdmin && (
        <button
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() =>
            router.push(`/templates/${form.templateId}?tab=answers`)
          }
        >
          🔙 Back to Submitted Forms
        </button>
      )}
    </div>
  );
};

export default FormPage;
