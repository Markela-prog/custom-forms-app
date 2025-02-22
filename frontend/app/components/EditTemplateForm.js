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
import { validateQuestions } from "../utils/validateForm";

const EditTemplateForm = ({ templateId }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState(new Set());
  const [newQuestions, setNewQuestions] = useState([]);
  const [modifiedQuestions, setModifiedQuestions] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);

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
        setOriginalQuestions(data);
      } catch (error) {
        console.error(error);
        setStatusMessage("❌ Failed to load questions.");
      }
    };

    fetchQuestions();
  }, [templateId]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const updatedQuestions = arrayMove(questions, oldIndex, newIndex);

    setQuestions(updatedQuestions.map((q, index) => ({ ...q, order: index })));
  };

  const handleAddQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
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

  const handleFieldChange = (questionId, updatedData) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) =>
        q.id === questionId ? { ...q, ...updatedData } : q
      )
    );

    setNewQuestions((prevNewQuestions) =>
      prevNewQuestions.map((q) =>
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

  const handleSave = async () => {
    if (!isAuthenticated) {
      setStatusMessage("❌ You must be logged in to save changes.");
      return;
    }

    const validation = validateQuestions(questions);
    if (!validation.isValid) {
      setStatusMessage(validation.message);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      let createdQuestions = [];
      let questionIdMap = {};

      /* Create New Questions */
      if (newQuestions.length > 0) {
        console.log("🟢 Creating new questions:", newQuestions);

        const formattedNewQuestions = newQuestions.map(
          ({ id, isNew, ...q }) => ({
            title: q.title.trim(),
            description: q.description.trim(),
            type: q.type,
            options: Array.isArray(q.options) ? q.options : [],
            isRequired: q.isRequired || false,
            order: q.order,
          })
        );

        const addResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ questions: formattedNewQuestions }),
          }
        );
        if (!addResponse.ok) throw new Error("❌ Failed to add new questions.");
        createdQuestions = await addResponse.json();

        createdQuestions.forEach((q, index) => {
          questionIdMap[newQuestions[index].id] = q.id;
        });

        setQuestions((prev) =>
          prev.map((q) =>
            q.isNew ? { ...q, id: questionIdMap[q.id], isNew: false } : q
          )
        );

        await new Promise((resolve) => setTimeout(resolve, 100));

        setNewQuestions([]);
      }

      /* Update Existing Questions */
      if (Object.keys(modifiedQuestions).length > 0) {
        console.log("🟡 Updating modified questions:", modifiedQuestions);

        const filteredModifiedQuestions = Object.values(modifiedQuestions).map(
          ({ isNew, ...q }) => q
        );

        const updateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/update`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ questions: filteredModifiedQuestions }),
          }
        );
        if (!updateResponse.ok)
          throw new Error("❌ Failed to update questions.");
      }

      /* Delete Removed Questions */
      if (deletedQuestions.size > 0) {
        console.log("🔴 Deleting removed questions:", deletedQuestions);
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

      /* Reorder Questions (Always Last) */
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedQuestions = questions.map((q) => ({
        id: questionIdMap[q.id] || q.id,
        order: q.order,
      }));

      const reorderPayload = {
        templateId,
        questions: updatedQuestions.filter((q) => q.id),
      };

      console.log("🔵 Reorder Request Payload:", reorderPayload);
      const reorderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/reorder`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(reorderPayload),
        }
      );
      if (!reorderResponse.ok)
        throw new Error("❌ Failed to reorder questions.");

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

      {/* Add New Question Button */}
      <button
        onClick={() => handleAddQuestion("SINGLE_LINE")}
        className="flex items-center text-blue-600 mt-4"
      >
        <PlusCircle size={18} className="mr-1" /> Add Question
      </button>

      {/* Save Changes Button */}
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
