"use client";
import { useState, useEffect, useContext } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { AuthContext } from "@/app/context/authContext";
import QuestionEditor from "@/app/components/QuestionEditor";
import { PlusCircle } from "lucide-react";

const EditTemplateForm = ({ templateId }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState(new Set());
  const [newQuestions, setNewQuestions] = useState([]);
  const [modifiedQuestions, setModifiedQuestions] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch existing questions when component loads
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
          { headers }
        );

        if (!response.ok) throw new Error("Failed to load questions");

        const data = await response.json();
        setQuestions(data);
        setOriginalQuestions(data); // Store original for tracking changes
      } catch (error) {
        console.error(error);
        setStatusMessage("❌ Failed to load questions.");
      }
    };

    fetchQuestions();
  }, [templateId]);

  // ✅ Handle Drag & Drop Reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const updatedQuestions = arrayMove(questions, oldIndex, newIndex);

    setQuestions(updatedQuestions.map((q, index) => ({ ...q, order: index })));
  };

  // ✅ Handle Adding New Questions
  const handleAddQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(), // Temporary ID
      title: "",
      description: "",
      type,
      options:
        type === "RADIOBOX" || type === "CHECKBOX" || type === "DROPDOWN"
          ? [""]
          : [],
      isRequired: false,
      order: questions.length,
      isNew: true,
    };

    setQuestions([...questions, newQuestion]);
    setNewQuestions([...newQuestions, newQuestion]);
  };

  // ✅ Handle Deleting Questions
  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));

    if (!newQuestions.some((q) => q.id === questionId)) {
      setDeletedQuestions(new Set([...deletedQuestions, questionId]));
    }

    setNewQuestions(newQuestions.filter((q) => q.id !== questionId));
    setModifiedQuestions((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  // ✅ Handle Updating Questions
  const handleFieldChange = (questionId, updatedData) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId ? { ...q, ...updatedData } : q
      )
    );

    if (!newQuestions.some((q) => q.id === questionId)) {
      setModifiedQuestions((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], ...updatedData },
      }));
    }
  };

  // ✅ Handle Saving Changes
  const handleSave = async () => {
    if (!isAuthenticated) {
      setStatusMessage("❌ You must be logged in to save changes.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // 1️⃣ Delete Removed Questions
      if (deletedQuestions.size > 0) {
        const deleteResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/delete`,
          {
            method: "DELETE",
            headers,
            body: JSON.stringify({ questionIds: Array.from(deletedQuestions) }),
          }
        );
        if (!deleteResponse.ok)
          throw new Error("❌ Failed to delete questions.");
      }

      // 2️⃣ Add New Questions
      if (newQuestions.length > 0) {
        const addResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              questions: newQuestions.map(({ isNew, ...q }) => q),
            }),
          }
        );

        if (!addResponse.ok) throw new Error("❌ Failed to add new questions.");

        const createdQuestions = await addResponse.json(); // ✅ Get real IDs
        console.log("🟢 New Questions Created:", createdQuestions);

        // ✅ Replace temporary IDs with real database IDs
        setQuestions((prev) =>
          prev.map((q) =>
            q.isNew
              ? createdQuestions.find((newQ) => newQ.title === q.title) || q
              : q
          )
        );

        setNewQuestions([]); // ✅ Clear new questions list
      }

      console.log("🟠 Update Request Payload:", {
        questions: Object.values(modifiedQuestions).map(({ isNew, ...q }) => q),
      });
      // 3️⃣ Update Modified Questions
      if (Object.keys(modifiedQuestions).length > 0) {
        const updateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/update`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              questions: Object.values(modifiedQuestions),
            }),
          }
        );
        if (!updateResponse.ok)
          throw new Error("❌ Failed to update questions.");
      }

      // 4️⃣ Reorder Questions
      const reorderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/reorder`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({ questions, templateId }),
        }
      );
      if (!reorderResponse.ok)
        throw new Error("❌ Failed to reorder questions.");
      setNewQuestions([]);
      setStatusMessage("✅ Changes saved successfully!");
    } catch (error) {
      console.error(error);
      setStatusMessage(error.message || "❌ Error saving changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {questions.map((question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={handleFieldChange}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* 🔹 Add New Question Button */}
      <button
        onClick={() => handleAddQuestion("SINGLE_LINE")}
        className="flex items-center text-blue-600 mt-4"
      >
        <PlusCircle size={18} className="mr-1" /> Add Question
      </button>

      {/* 🔹 Save Changes Button */}
      <button
        onClick={handleSave}
        className={`bg-blue-500 text-white px-4 py-2 rounded mt-4 ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
        }`}
        disabled={loading}
      >
        {loading ? "Saving..." : "💾 Save Changes"}
      </button>

      {statusMessage && <p className="mt-2 text-red-500">{statusMessage}</p>}
    </div>
  );
};

export default EditTemplateForm;
