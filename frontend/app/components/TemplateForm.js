"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const TemplateForm = ({ template }) => {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/answers/${template.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: Object.entries(answers).map(([qId, value]) => ({
              questionId: qId,
              value,
            })),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit answers");

      setSuccessMessage("Form submitted successfully!");
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold">Fill the form</h2>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {template.questions.map((question) => (
          <div key={question.id} className="p-4 border rounded-lg">
            <label className="block font-semibold">{question.title}</label>
            <input
              type="text"
              className="p-2 border rounded w-full"
              value={answers[question.id] || ""}
              onChange={(e) => handleChange(question.id, e.target.value)}
              required={question.isRequired}
            />
          </div>
        ))}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default TemplateForm;
