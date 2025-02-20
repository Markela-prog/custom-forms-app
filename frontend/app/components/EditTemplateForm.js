"use client";
import { useState, useEffect } from "react";
import QuestionField from "./QuestionField";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const EditTemplateForm = ({ templateId }) => {
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`
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

  const handleReorder = (result) => {
    if (!result.destination) return;
    const reordered = [...questions];
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    setQuestions(reordered);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/questions/${templateId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      <DragDropContext onDragEnd={handleReorder}>
        <Droppable droppableId="questions">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {questions.map((q, index) => (
                <Draggable key={q.id} draggableId={q.id} index={index}>
                  {(provided) => (
                    <li
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <QuestionField question={q} />
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
      >
        💾 Save Changes
      </button>
    </div>
  );
};

export default EditTemplateForm;
