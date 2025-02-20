"use client";
import { useState, useEffect, useContext } from "react";
import QuestionField from "./QuestionField";
import StatusMessage from "./StatusMessage";
import { AuthContext } from "../context/authContext";

const QuestionnaireForm = ({ templateId, isOwner, onSubmit }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // ✅ Fetch form submission status for the user
  useEffect(() => {
    const checkFormSubmission = async () => {
      try {
        if (!isAuthenticated) return;
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/forms/check-submission/${templateId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (response.ok) {
          const data = await response.json();
          setHasSubmitted(data.hasSubmitted);
        } else {
          console.warn("Failed to check form submission status.");
        }
      } catch (err) {
        console.error("Error checking form submission status:", err.message);
      }
    };

    checkFormSubmission();
  }, [templateId, isAuthenticated]);

  // ✅ Fetch questions only if the user has NOT submitted the form
  useEffect(() => {
    const fetchQuestions = async () => {
      if (hasSubmitted) return;

      try {
        const token = localStorage.getItem("accessToken");
        const headers =
          isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
          { headers }
        );

        if (!response.ok) throw new Error("Failed to load questions");

        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [templateId, isAuthenticated, hasSubmitted]);

  // ✅ Handle changes in answers
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setStatusMessage(null);

    try {
      // 🔹 Ensure answers are in correct format: [{ questionId, value }]
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, value]) => ({
          questionId,
          value: Array.isArray(value) ? value.join(", ") : value, // ✅ Convert array to string if needed
        })
      );

      if (formattedAnswers.length === 0) {
        throw new Error("No answers provided.");
      }

      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/answers/${templateId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ answers: formattedAnswers }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      setStatusMessage("Form submitted successfully! ✅");
      setHasSubmitted(true);
      onSubmit && onSubmit();
    } catch (err) {
      console.error("Error submitting form:", err.message);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // ✅ If user has already submitted, show a message instead of the form
  if (hasSubmitted) {
    return (
      <div className="mx-auto p-6 border rounded-lg shadow bg-white text-center">
        <h2 className="text-2xl font-bold text-gray-700">
          You have already submitted this form.
        </h2>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto p-6 border rounded-lg shadow bg-white"
    >
      <h2 className="text-2xl font-bold mb-4">Fill out the form</h2>

      {questions.map((question) => (
        <div key={question.id} className="mb-4">
          <label className="block text-lg font-medium mb-1">
            {question.title}{" "}
            {question.isRequired && <span className="text-red-500">*</span>}
          </label>
          <QuestionField
            question={question}
            value={answers[question.id] || ""}
            onChange={handleAnswerChange}
          />
        </div>
      ))}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      {statusMessage && (
        <StatusMessage
          message={statusMessage}
          onClose={() => setStatusMessage(null)}
        />
      )}

      <button
        type="submit"
        className={`mt-4 w-full px-4 py-2 rounded-lg text-white ${
          submitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default QuestionnaireForm;
