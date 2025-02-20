"use client";
import { useRouter } from "next/navigation";

const TemplateManagement = ({ template }) => {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/templates/${template.id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates/${template.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete template");

      router.push("/");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="mt-6 flex gap-4">
      <button className="px-4 py-2 bg-yellow-500 text-white rounded" onClick={handleEdit}>
        Edit Template
      </button>
      <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleDelete}>
        Delete Template
      </button>
    </div>
  );
};

export default TemplateManagement;
