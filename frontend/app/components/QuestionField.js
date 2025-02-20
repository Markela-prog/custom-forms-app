"use client";
import { useState } from "react";

const QuestionField = ({ question, value, onChange }) => {
  const options = Array.isArray(question.options) ? question.options : [];

  switch (question.type) {
    case "SINGLE_LINE":
      return (
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder={question.title}
          value={value || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          required={question.isRequired}
        />
      );

    case "MULTI_LINE":
      return (
        <textarea
          className="border p-2 w-full rounded"
          placeholder={question.title}
          rows={4}
          value={value || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          required={question.isRequired}
        />
      );

    case "INTEGER":
      return (
        <input
          type="number"
          className="border p-2 w-full rounded"
          placeholder={question.title}
          value={value || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          required={question.isRequired}
        />
      );

    case "CHECKBOX":
      return (
        <div className="space-y-2">
          {options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={option}
                checked={value?.includes(option) || false}
                onChange={(e) => {
                  const updatedValues = value ? [...value] : [];
                  if (e.target.checked) {
                    updatedValues.push(option);
                  } else {
                    const index = updatedValues.indexOf(option);
                    if (index !== -1) updatedValues.splice(index, 1);
                  }
                  onChange(question.id, updatedValues);
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );

    case "RADIOBOX":
      return (
        <div className="space-y-2">
          {options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={value === option}
                onChange={() => onChange(question.id, option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );

    case "DROPDOWN":
      return (
        <select
          className="border p-2 w-full rounded"
          value={value || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          required={question.isRequired}
        >
          <option value="">Select an option</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case "DATE":
      return (
        <input
          type="date"
          className="border p-2 w-full rounded"
          value={value || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          required={question.isRequired}
        />
      );

    case "TIME":
      return (
        <input
          type="time"
          className="border p-2 w-full rounded"
          value={value || ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          required={question.isRequired}
        />
      );

    default:
      return (
        <p className="text-red-500">Unknown question type: {question.type}</p>
      );
  }
};

export default QuestionField;
