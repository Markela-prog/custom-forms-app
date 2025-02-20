"use client";
import { useState, useEffect } from "react";
import QuestionField from "./QuestionField";

const QuestionnaireForm = ({ templateId, onSubmit }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`
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
  }, [templateId]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forms/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateId, answers }),
        }
      );

      if (!response.ok) throw new Error("Submission failed");
      alert("Form submitted successfully!");
      onSubmit();
    } catch (err) {
      console.error(err);
      alert("Error submitting form");
    }
  };

  if (loading) return <p>Loading questions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Fill out the form</h2>

      {questions.map((question) => (
        <div key={question.id} className="mb-4">
          <label className="block text-lg font-medium mb-1">{question.title}</label>
          <QuestionField
            question={question}
            value={answers[question.id] || ""}
            onChange={handleAnswerChange}
          />
        </div>
      ))}

      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
};

export default QuestionnaireForm;
