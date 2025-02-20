"use client";
import { useState, useEffect, useContext } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { AuthContext } from "../context/authContext";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import QuestionField from "./QuestionField";

const DraggableQuestion = ({ question, index }) => {
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
      className="p-4 border rounded bg-white shadow cursor-grab"
    >
      {index + 1}. <QuestionField question={question} />
    </div>
  );
};

const EditTemplateForm = ({ templateId }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    type: "SINGLE_LINE",
    options: [],
    isRequired: false,
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {};
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
          { headers }
        );
        if (!response.ok) throw new Error("Failed to load questions");
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuestions();
  }, [templateId]);

  const handleAddQuestion = () => {
    setQuestions([...questions, { ...newQuestion, id: Date.now().toString() }]);
    setNewQuestion({
      title: "",
      type: "SINGLE_LINE",
      options: [],
      isRequired: false,
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      setQuestions(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
          body: JSON.stringify({ questions }),
        }
      );

      if (!response.ok) throw new Error("Failed to save questions");
      alert("Questions saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving questions");
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Edit Questions</h2>

      {/* Drag & Drop Context */}
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
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAddQuestion}
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
      >
        ➕ Add Question
      </button>

      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-4 py-2 mt-4 rounded ml-2"
      >
        💾 Save Changes
      </button>
    </div>
  );
};

export default EditTemplateForm;