const QuestionField = ({ question, value, onChange, disabled = false }) => {
  if (!question) {
    return <p className="text-red-500">⚠️ Question data is missing!</p>;
  }

  const options = Array.isArray(question.options) ? question.options : [];
  const parsedValue = Array.isArray(value) ? value : value?.split(", ") || [];

  switch (question.type) {
    case "SINGLE_LINE":
      return (
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder={question.title}
          value={value || ""}
          onChange={(e) => onChange && onChange(question.id, e.target.value)}
          required={question.isRequired}
          disabled={disabled}
        />
      );

    case "MULTI_LINE":
      return (
        <textarea
          className="border p-2 w-full rounded"
          placeholder={question.title}
          rows={4}
          value={value || ""}
          onChange={(e) => onChange && onChange(question.id, e.target.value)}
          required={question.isRequired}
          disabled={disabled}
        />
      );

    case "INTEGER":
      return (
        <input
          type="number"
          className="border p-2 w-full rounded"
          placeholder={question.title}
          value={value || ""}
          onChange={(e) => onChange && onChange(question.id, e.target.value)}
          required={question.isRequired}
          disabled={disabled}
        />
      );

    case "CHECKBOX":
      return (
        <div className="space-y-2">
          {options.length > 0 ? (
            options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={parsedValue.includes(option)}
                  onChange={(e) => {
                    if (disabled) return;
                    const newValue = e.target.checked
                      ? [...parsedValue, option]
                      : parsedValue.filter((v) => v !== option);
                    onChange && onChange(question.id, newValue);
                  }}
                  disabled={disabled}
                />
                <span>{option}</span>
              </label>
            ))
          ) : (
            <p className="text-gray-500">No options available.</p>
          )}
        </div>
      );

    case "RADIOBOX":
      return (
        <div className="space-y-2">
          {options.length > 0 ? (
            options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) =>
                    !disabled &&
                    onChange &&
                    onChange(question.id, e.target.value)
                  }
                  disabled={disabled}
                />
                <span>{option}</span>
              </label>
            ))
          ) : (
            <p className="text-gray-500">No options available.</p>
          )}
        </div>
      );

    case "DROPDOWN":
      return (
        <select
          className="border p-2 w-full rounded"
          value={value || ""}
          required={question.isRequired}
          onChange={(e) =>
            !disabled && onChange && onChange(question.id, e.target.value)
          }
          disabled={disabled}
        >
          <option value="">Select an option</option>
          {options.length > 0 ? (
            options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>
      );

    case "DATE":
      return (
        <input
          type="date"
          className="border p-2 w-full rounded"
          value={value || ""}
          onChange={(e) =>
            !disabled && onChange && onChange(question.id, e.target.value)
          }
          required={question.isRequired}
          disabled={disabled}
        />
      );

    case "TIME":
      return (
        <input
          type="time"
          className="border p-2 w-full rounded"
          value={value || ""}
          onChange={(e) =>
            !disabled && onChange && onChange(question.id, e.target.value)
          }
          required={question.isRequired}
          disabled={disabled}
        />
      );

    default:
      return (
        <p className="text-red-500">Unknown question type: {question.type}</p>
      );
  }
};

export default QuestionField;
