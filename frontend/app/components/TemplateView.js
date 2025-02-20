const TemplateView = ({ template }) => {
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold">Questions</h2>
      <div className="mt-4 space-y-4">
        {template.questions.map((question) => (
          <div key={question.id} className="p-4 border rounded-lg bg-gray-100">
            <p className="font-semibold">{question.title}</p>
            <input
              type="text"
              className="p-2 border rounded w-full bg-gray-200 cursor-not-allowed"
              placeholder="Read-only mode"
              disabled
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateView;
