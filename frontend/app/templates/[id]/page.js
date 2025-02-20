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

  // ✅ Set template ID from URL params
  useEffect(() => {
    if (params?.id) {
      setTemplateId(params.id);
    }
  }, [params]);

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

  if (loadingTemplate) return <p>Loading template...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const isOwnerOrAdmin =
    user?.role === "ADMIN" || template?.ownerId === user?.id;
  const hasACLAccess = template?.accessControl?.some(
    (ac) => ac.userId === user?.id
  );
  const canSubmitForm =
    isAuthenticated && (template?.isPublic || hasACLAccess || isOwnerOrAdmin);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center">{template?.title}</h1>
      <p className="text-gray-600 text-center mb-2">{template?.description}</p>

      {/* 🔹 Single Edit Button at the Top */}
      {isOwnerOrAdmin && (
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
          {/* 🔹 Form Submission */}
          {canSubmitForm && <QuestionnaireForm templateId={templateId} />}

          {/* 🔹 Admin/Owner Management Features */}
          {isOwnerOrAdmin && (
            <>
              
              <div className="mt-6">
                <h2 className="text-2xl font-semibold">Submitted Forms</h2>
                <TemplateFormsList templateId={templateId} />
              </div>
            </>
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
