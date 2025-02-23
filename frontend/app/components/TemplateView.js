"use client";
import QuestionField from "./QuestionField";

const ReadOnlyTemplateView = ({ template }) => {
  return (
    <div className="mt-6">

      <div className="space-y-4">
        {template.questions.length > 0 ? (
          template.questions.map((question) => (
            <div key={question.id} className="p-4 border rounded-lg bg-gray-100">
              <p className="font-semibold">{question.title}</p>
              <QuestionField question={question} value="" disabled />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No questions available.</p>
        )}
      </div>
    </div>
  );
};

export default ReadOnlyTemplateView;
