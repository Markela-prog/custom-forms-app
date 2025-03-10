"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "../../context/authContext";
import QuestionnaireForm from "@/app/components/QuestionnaireForm";
import EditTemplateForm from "@/app/components/EditTemplateForm";
import UserPermissionTable from "@/app/components/UserPermissionTable";
import ReadOnlyTemplateView from "@/app/components/TemplateView";
import LikeButton from "@/app/components/LikeButton";

const TemplatePage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const [templateId, setTemplateId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");
  const [submittedForms, setSubmittedForms] = useState([]);

  useEffect(() => {
    if (params?.id && params.id !== "create") {
      setTemplateId(params.id);
    }
  }, [params]);
  

  const isOwnerOrAdmin =
    user?.role === "ADMIN" || template?.ownerId === user?.id;

  const hasACLAccess = template?.accessControl?.some(
    (ac) => ac.userId === user?.id
  );

  const canSubmitForm =
    isAuthenticated && (template?.isPublic || hasACLAccess || isOwnerOrAdmin);

  useEffect(() => {
    if (!templateId) return;

    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/templates/${templateId}`,
          { headers }
        );

        if (!response.ok)
          throw new Error("Template not found or access denied");

        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingTemplate(false);
      }
    };

    fetchTemplate();
  }, [templateId, isAuthenticated]);

  useEffect(() => {
    if (!isOwnerOrAdmin || activeTab !== "answers" || !templateId) return;

    const fetchSubmittedForms = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/forms/template/${templateId}`,
          { headers }
        );

        if (!response.ok) throw new Error("Failed to load submitted forms");

        const data = await response.json();
        setSubmittedForms(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchSubmittedForms();
  }, [activeTab, templateId, isOwnerOrAdmin, isAuthenticated]);

  const handleToggleVisibility = async () => {
    if (!isOwnerOrAdmin || !templateId) return;

    try {
      const token = localStorage.getItem("accessToken");

      const updatedTemplate = { isPublic: !template.isPublic };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates/${templateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedTemplate),
        }
      );

      if (!response.ok) throw new Error("Failed to update template visibility");

      setTemplate((prev) => ({
        ...prev,
        isPublic: !prev.isPublic,
      }));
    } catch (error) {
      console.error("Error updating visibility:", error);
      setError(error.message);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!isOwnerOrAdmin || !templateId) return;

    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this template? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates/${templateId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("❌ Failed to delete template.");

      alert("✅ Template deleted successfully.");
      router.push("/");
    } catch (error) {
      console.error("Error deleting template:", error);
      setError(error.message);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  if (loadingTemplate) return <p>Loading template...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Top Bar with Title */}
      <h1 className="text-3xl font-bold text-center">{template?.title}</h1>
      <p className="text-foreground text-center mb-2">
        {template?.description}
      </p>
      <div className="flex justify-center mt-4">
        <LikeButton
          templateId={template?.id}
          initialLikes={template?.stats?.totalLikes || 0}
          initialLiked={template?.isLikedByUser}
        />
      </div>

      {!isAuthenticated ? (
        <ReadOnlyTemplateView template={template} />
      ) : (
        <>
          {/*  Toggle Switch (Only for Owners) */}
          {isOwnerOrAdmin && (
            <div className="flex justify-center items-center gap-2 my-4">
              <span className="text-foreground font-semibold">
                {template?.isPublic ? "Public" : "Private"}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={template?.isPublic}
                  onChange={handleToggleVisibility}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          )}

          {/* Responsive Navigation Tabs */}
          {isOwnerOrAdmin && (
            <div className="flex flex-wrap justify-center border-b mb-4">
              {["questions", "answers", "permissions"].map(
                (tab) =>
                  (tab !== "permissions" || !template?.isPublic) && (
                    <button
                      key={tab}
                      className={`px-4 py-2 text-lg font-semibold transition-colors ${
                        activeTab === tab
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-500 hover:text-blue-500"
                      }`}
                      onClick={() => handleTabChange(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
              )}
            </div>
          )}

          {activeTab === "permissions" && (
            <UserPermissionTable templateId={templateId} />
          )}

          {/* Edit & Delete Buttons (Only for Owners/Admins) */}
          {isOwnerOrAdmin && activeTab === "questions" && (
            <div className="flex flex-col sm:flex-row gap-4 mt-2 mb-2">
              <button
                className="bg-yellow-500 text-white px-4 py-2 rounded"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Cancel Edit" : "✏️ Edit Template"}
              </button>

              <button
                className="bg-red-600 text-white px-4 py-2 rounded"
                onClick={handleDeleteTemplate}
              >
                🗑 Delete Template
              </button>
            </div>
          )}

          {/* Edit Mode */}
          {isEditing ? (
            <EditTemplateForm
              templateId={templateId}
              setIsEditing={setIsEditing}
            />
          ) : (
            <>
              {/* Show Questions Tab */}
              {activeTab === "questions" && (
                <>
                  {canSubmitForm && (
                    <QuestionnaireForm templateId={templateId} />
                  )}
                </>
              )}

              {/* Show Answers Tab */}
              {activeTab === "answers" && isOwnerOrAdmin && (
                <div className="mt-6">
                  <h2 className="text-2xl font-semibold">Submitted Forms</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {submittedForms.length === 0 ? (
                      <p className="text-gray-500">No forms submitted yet.</p>
                    ) : (
                      submittedForms.map((form) => (
                        <div
                          key={form.id}
                          className="p-4 border rounded-lg shadow cursor-pointer hover:shadow-lg"
                          onClick={() => router.push(`/forms/${form.id}`)}
                        >
                          <h3 className="font-semibold">
                            Submitted by: {form.user?.name || "Anonymous"}
                          </h3>
                          <p className="text-gray-500">
                            Submitted on:{" "}
                            {new Date(form.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
export default TemplatePage;
