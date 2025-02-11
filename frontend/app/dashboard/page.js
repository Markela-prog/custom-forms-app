"use client";
import { useRouter } from "next/navigation";

const fakeForms = [
  { id: "1", title: "Event Registration", createdAt: "Feb 10, 2025" },
  { id: "2", title: "Customer Feedback", createdAt: "Feb 8, 2025" },
  { id: "3", title: "Employee Survey", createdAt: "Feb 5, 2025" },
];

const fakeTemplates = [
  { id: "101", title: "Blank Form" },
  { id: "102", title: "Feedback Form" },
  { id: "103", title: "Event Registration" },
];

const DashboardPage = () => {
  const router = useRouter();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <nav className="mt-4 flex flex-col gap-2">
          <button onClick={() => router.push("/dashboard")} className="text-left p-2 hover:bg-gray-700 rounded">
            📂 My Forms
          </button>
          <button onClick={() => router.push("/profile")} className="text-left p-2 hover:bg-gray-700 rounded">
            👤 Profile
          </button>
          <button onClick={() => router.push("/trash")} className="text-left p-2 hover:bg-gray-700 rounded">
            🗑 Trash
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Forms</h1>
          <button
            onClick={() => router.push("/forms/new")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            ➕ Create New Form
          </button>
        </div>

        {/* Recent Forms */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Recent Forms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fakeForms.map((form) => (
              <div
                key={form.id}
                className="p-4 border rounded-lg bg-white shadow hover:shadow-lg cursor-pointer"
                onClick={() => router.push(`/forms/${form.id}`)}
              >
                <h3 className="font-semibold text-lg">{form.title}</h3>
                <p className="text-gray-500 text-sm">Created on {form.createdAt}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Templates</h2>
          <div className="flex gap-4">
            {fakeTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => router.push(`/forms/new?template=${template.title}`)}
                className="p-4 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                {template.title}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
