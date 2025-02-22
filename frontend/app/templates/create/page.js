"use client";
import { useState, useContext } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AuthContext } from "@/app/context/authContext";
import QuestionEditor from "@/app/components/QuestionEditor";
import { PlusCircle } from "lucide-react";
import { validateTemplate, validateQuestions } from "@/app/utils/validateForm";

const CreateTemplateForm = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [template, setTemplate] = useState({
    title: "",
    description: "",
    topic: "",
    image: "",
    isPublic: true,
  });
  const [questions, setQuestions] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleAddQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      title: "",
      description: "",
      type,
      options:
        type === "CHECKBOX" || type === "RADIOBOX" || type === "DROPDOWN"
          ? [""]
          : [],
      isRequired: false,
      order: questions.length,
    };

    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (questionId, updatedData) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? updatedData : q))
    );
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    const newOrder = arrayMove(questions, oldIndex, newIndex);

    setQuestions(newOrder.map((q, index) => ({ ...q, order: index })));
  };

  const handleCreateTemplate = async () => {
    if (!isAuthenticated) {
      setStatusMessage("❌ You must be logged in to create a template.");
      return;
    }

    const templateValidation = validateTemplate(template);
    if (!templateValidation.isValid) {
      setStatusMessage(templateValidation.message);
      return;
    }

    const questionValidation = validateQuestions(questions);
    if (!questionValidation.isValid) {
      setStatusMessage(questionValidation.message);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Missing authentication token");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const templateResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(template),
        }
      );

      if (!templateResponse.ok) {
        throw new Error("❌ Failed to create template.");
      }

      const templateData = await templateResponse.json();
      const templateId = templateData.id;

      if (questions.length > 0) {
        const questionResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ questions }),
          }
        );

        if (!questionResponse.ok) {
          throw new Error("❌ Failed to add questions.");
        }
      }

      setStatusMessage("✅ Template and questions created successfully!");
      setTemplate({
        title: "",
        description: "",
        topic: "",
        image: "",
        isPublic: true,
      });
      setQuestions([]);
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage(error.message || "❌ Error creating template");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 space-y-6">
      <h2 className="text-2xl font-bold">Create a New Template</h2>

      <input
        type="text"
        placeholder="Template Title"
        value={template.title}
        onChange={(e) => setTemplate({ ...template, title: e.target.value })}
        className="border p-2 w-full rounded"
      />
      <textarea
        placeholder="Description"
        value={template.description}
        onChange={(e) =>
          setTemplate({ ...template, description: e.target.value })
        }
        className="border p-2 w-full rounded"
      />
      <input
        type="text"
        placeholder="Topic"
        value={template.topic}
        onChange={(e) => setTemplate({ ...template, topic: e.target.value })}
        className="border p-2 w-full rounded"
      />
      <input
        type="text"
        placeholder="Image URL"
        value={template.image}
        onChange={(e) => setTemplate({ ...template, image: e.target.value })}
        className="border p-2 w-full rounded"
      />
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={template.isPublic}
          onChange={() =>
            setTemplate({ ...template, isPublic: !template.isPublic })
          }
        />
        <label>Make this template public</label>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={handleUpdateQuestion}
                onDelete={handleDeleteQuestion}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={() => handleAddQuestion("SINGLE_LINE")}
        className="text-blue-600"
      >
        <PlusCircle size={18} /> Add Question
      </button>

      <button
        onClick={handleCreateTemplate}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4 ml-2"
      >
        Create Template
      </button>

      {statusMessage && <p className="text-green-600">{statusMessage}</p>}
    </div>
  );
};

export default CreateTemplateForm;
