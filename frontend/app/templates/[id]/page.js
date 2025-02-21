"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthContext } from "../../context/authContext";
import TemplateView from "@/app/components/TemplateView";
import TemplateFormsList from "@/app/components/TemplateFormsList";
import QuestionnaireForm from "@/app/components/QuestionnaireForm";
import EditTemplateForm from "@/app/components/EditTemplateForm";

const TemplatePage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const [templateId, setTemplateId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("questions"); // 🔹 Track active tab
  const [submittedForms, setSubmittedForms] = useState([]);

  // ✅ Set template ID from URL params
  useEffect(() => {
    if (params?.id) {
      setTemplateId(params.id);
    }
  }, [params]);

  // ✅ Define user permissions (Move this above useEffect)
  const isOwnerOrAdmin =
    user?.role === "ADMIN" || template?.ownerId === user?.id;

  const hasACLAccess = template?.accessControl?.some(
    (ac) => ac.userId === user?.id
  );

  const canSubmitForm =
    isAuthenticated && (template?.isPublic || hasACLAccess || isOwnerOrAdmin);

  // ✅ Fetch template details
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

  // ✅ Fetch submitted forms when in "Answers" tab
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

  if (loadingTemplate) return <p>Loading template...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 🔹 Top Bar with Title */}
      <h1 className="text-3xl font-bold text-center">{template?.title}</h1>
      <p className="text-gray-600 text-center mb-2">{template?.description}</p>

      {/* 🔹 Navigation Tabs (Only for Owners/Admins) */}
      {isOwnerOrAdmin && (
        <div className="flex justify-center border-b mb-4">
          <button
            className={`px-4 py-2 text-lg font-semibold ${
              activeTab === "questions"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("questions")}
          >
            Questions
          </button>
          <button
            className={`px-4 py-2 text-lg font-semibold ${
              activeTab === "answers"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("answers")}
          >
            Answers
          </button>
        </div>
      )}

      {/* 🔹 Show Edit Button (Only in Questions Tab) */}
      {isOwnerOrAdmin && activeTab === "questions" && (
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded mt-2 mb-2"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel Edit" : "✏️ Edit Template"}
        </button>
      )}

      {/* 🔹 Edit Mode */}
      {isEditing ? (
        <EditTemplateForm templateId={templateId} />
      ) : (
        <>
          {/* 🔹 Show Questions Tab */}
          {activeTab === "questions" && (
            <>
              {canSubmitForm && <QuestionnaireForm templateId={templateId} />}
            </>
          )}

          {/* 🔹 Show Answers Tab */}
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

      {/* 🔹 Read-Only Mode for Unauthenticated Users */}
      {!isAuthenticated && template?.isPublic && (
        <TemplateView template={template} />
      )}

      {/* 🔹 Access Denied for Unauthenticated Users Trying to Access Private Template */}
      {!isAuthenticated && !template?.isPublic && (
        <p className="text-red-500">Access denied. Please log in.</p>
      )}
    </div>
  );
};

export default TemplatePage;
