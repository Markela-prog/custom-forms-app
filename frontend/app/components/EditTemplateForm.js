"use client";
import { useState, useEffect, useContext } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AuthContext } from "../context/authContext";
import QuestionField from "./QuestionField";
import StatusMessage from "./StatusMessage";
import {
  LucideIcon,
  Text,
  List,
  Radio,
  Check,
  Calendar,
  Timer,
  PlusCircle,
} from "lucide-react";

// ✅ Define question types with icons
const questionTypes = [
  { type: "SINGLE_LINE", label: "Single line", icon: <Text size={20} /> },
  { type: "MULTI_LINE", label: "Multi line", icon: <List size={20} /> },
  { type: "RADIOBOX", label: "Radiobox", icon: <Radio size={20} /> },
  { type: "CHECKBOX", label: "Checkbox", icon: <Check size={20} /> },
  {
    type: "DROPDOWN",
    label: "Dropdown",
    icon: <List size={20} />,
  },
  { type: "DATE", label: "Date", icon: <Calendar size={20} /> },
  { type: "TIME", label: "Time", icon: <Timer size={20} /> },
];

const DraggableQuestion = ({ question, index, onDelete, onFieldChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="p-4 border rounded bg-white shadow cursor-grab relative space-y-2"
    >
      {/* ❌ Delete button */}
      <button
        onClick={() => onDelete(question.id)}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
      >
        ✖
      </button>

      {/* ✅ Editable Title */}
      <input
        type="text"
        value={question.title}
        onChange={(e) => onFieldChange(question.id, { title: e.target.value })}
        placeholder="Įveskite klausimą..."
        className="w-full text-lg font-medium border-b outline-none focus:border-blue-500"
      />

      {/* ✅ Editable Description */}
      <input
        type="text"
        value={question.description || ""}
        onChange={(e) =>
          onFieldChange(question.id, { description: e.target.value })
        }
        placeholder="Aprašymas (neprivalomas)"
        className="w-full text-sm text-gray-500 border-b outline-none focus:border-blue-300"
      />

      {/* 📝 Question Field */}
      <QuestionField question={question} onFieldChange={onFieldChange} />
    </div>
  );
};

const EditTemplateForm = ({ templateId }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [originalQuestions, setOriginalQuestions] = useState([]);
  const [deletedQuestions, setDeletedQuestions] = useState(new Set());
  const [newQuestions, setNewQuestions] = useState([]);
  const [modifiedQuestions, setModifiedQuestions] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
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
        setOriginalQuestions(data); // Store original for tracking changes
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestions();
  }, [templateId]);

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
    setIsDropdownOpen(false);
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

    if (!newQuestions.some((q) => q.id === questionId)) {
      setModifiedQuestions((prev) => ({
        ...prev,
        [questionId]: { ...prev[questionId], ...updatedData },
      }));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

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

      setStatusMessage("Changes saved successfully!");
    } catch (err) {
      console.error(err);
      setStatusMessage("Error saving changes.");
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Questions</h2>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={questions}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {questions.map((question, index) => (
              <DraggableQuestion
                key={question.id}
                question={question}
                index={index}
                onDelete={handleDeleteQuestion}
                onFieldChange={handleFieldChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Styled Dropdown for Adding Questions */}
      <div className="relative mt-4">
        <button
          className="flex items-center text-blue-600 hover:underline"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <PlusCircle size={18} /> <span className="ml-1">Add question</span> 
        </button>
        {isDropdownOpen && (
          <div className="absolute bg-white shadow-lg p-2 rounded border">
            {questionTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleAddQuestion(type)}
                className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded w-full"
              >
                {icon} <span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSave}>💾 Save Changes</button>
      {statusMessage && <StatusMessage message={statusMessage} />}
    </div>
  );
};

export default EditTemplateForm;
