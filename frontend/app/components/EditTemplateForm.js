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
      }
    };

    fetchQuestions();
  }, [templateId]);

  // ✅ Handle Drag & Drop Reordering
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      const updatedQuestions = arrayMove(questions, oldIndex, newIndex);

      setQuestions(
        updatedQuestions.map((q, index) => ({ ...q, order: index }))
      );
    }
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
      isNew: true, // Mark as new
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
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // 1️⃣ Delete Removed Questions
      if (deletedQuestions.size > 0) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/delete`,
          {
            method: "DELETE",
            headers,
            body: JSON.stringify({ questionIds: Array.from(deletedQuestions) }),
          }
        );
      }

      // 2️⃣ Add New Questions
      if (newQuestions.length > 0) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ questions: newQuestions }),
          }
        );
      }

      // 3️⃣ Update Modified Questions
      if (Object.keys(modifiedQuestions).length > 0) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/update`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({
              questions: Object.values(modifiedQuestions),
            }),
          }
        );
      }

      // 4️⃣ Reorder Questions
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/reorder`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ questions, templateId }),
      });

      setStatusMessage("✅ Changes saved successfully!");
    } catch (error) {
      console.error(error);
      setStatusMessage("❌ Error saving changes.");
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
      <button onClick={handleSave}>💾 Save Changes</button>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
  );
};

export default EditTemplateForm;
