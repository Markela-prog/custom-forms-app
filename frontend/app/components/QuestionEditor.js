"use client";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical, PlusCircle, ChevronDown } from "lucide-react";

const QuestionEditor = ({ question, onUpdate, onDelete }) => {
  const [options, setOptions] = useState(question.options || []);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFieldChange = (field, value) => {
    onUpdate(question.id, { ...question, [field]: value });
  };

  const handleAddOption = () => {
    const newOptions = [...options, ""];
    setOptions(newOptions);
    onUpdate(question.id, { ...question, options: newOptions });
  };

  const handleRemoveOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    onUpdate(question.id, { ...question, options: newOptions });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    onUpdate(question.id, { ...question, options: newOptions });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border rounded bg-white shadow space-y-2 flex flex-col relative"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab text-gray-400"
      >
        <GripVertical size={18} />
      </div>

      {/* Question Title */}
      <input
        type="text"
        value={question.title}
        onChange={(e) => handleFieldChange("title", e.target.value)}
        placeholder="Enter question..."
        className="w-full text-lg font-medium border-b outline-none focus:border-blue-500"
      />

      {/* Question Description */}
      <input
        type="text"
        value={question.description || ""}
        onChange={(e) => handleFieldChange("description", e.target.value)}
        placeholder="Description (optional)"
        className="w-full text-sm text-gray-500 border-b outline-none focus:border-blue-300"
      />

      {/* Question Type */}
      <select
        className="border p-2 w-full rounded"
        value={question.type}
        onChange={(e) => handleFieldChange("type", e.target.value)}
      >
        <option value="SINGLE_LINE">Short Text</option>
        <option value="MULTI_LINE">Long Text</option>
        <option value="RADIOBOX">Single Choice</option>
        <option value="CHECKBOX">Multiple Choice</option>
        <option value="DROPDOWN">Dropdown</option>
        <option value="INTEGER">Number</option>
        <option value="DATE">Date</option>
        <option value="TIME">Time</option>
      </select>

      {/* Options for Select-type Questions (Radio, Checkbox, Dropdown) */}
      {(question.type === "CHECKBOX" ||
        question.type === "RADIOBOX" ||
        question.type === "DROPDOWN") && (
        <div className="space-y-2 mt-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              {question.type === "RADIOBOX" ? (
                <input type="radio" disabled className="text-blue-500" />
              ) : question.type === "CHECKBOX" ? (
                <input type="checkbox" disabled className="text-green-500" />
              ) : (
                <ChevronDown size={18} className="text-gray-500" />
              )}
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="border p-2 w-full rounded"
                placeholder={`Option ${index + 1}`}
              />
              <button
                onClick={() => handleRemoveOption(index)}
                className="text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddOption}
            className="text-blue-600 flex items-center"
          >
            <PlusCircle size={18} /> <span className="ml-1">Add Option</span>
          </button>
        </div>
      )}

      {/* Delete Question Button */}
      <button
        onClick={() => onDelete(question.id)}
        className="text-red-500 mt-2"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default QuestionEditor;
