"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter, useParams } from "next/navigation"; // ✅ Use `useParams`
import { AuthContext } from "../../context/authContext";
import TemplateForm from "@/app/components/TemplateForm";
import TemplateView from "@/app/components/TemplateView";
import TemplateManagement from "@/app/components/TemplateManagement";
import TemplateFormsList from "@/app/components/TemplateFormsList";
import QuestionnaireForm from "@/app/components/QuestionnaireForm";

const TemplatePage = () => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams(); // ✅ Correctly get params
  const [templateId, setTemplateId] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Handle params asynchronously
  useEffect(() => {
    if (params?.id) {
      setTemplateId(params.id);
    }
  }, [params]);

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{template?.title}</h1>
      <p className="text-gray-600">{template?.description}</p>

      {/* 🔹 Read-Only Mode for Unauthenticated Users */}
      {!isAuthenticated && template?.isPublic && (
        <TemplateView template={template} />
      )}

      {/* 🔹 Access Denied for Unauthenticated Users Trying to Access Private Template */}
      {!isAuthenticated && !template?.isPublic && (
        <p className="text-red-500">Access denied. Please log in.</p>
      )}

      {/* 🔹 Authenticated User Can Fill Form (Public or ACL User) */}
      {isAuthenticated &&
        (template?.isPublic || hasACLAccess || isOwnerOrAdmin) && (
            <QuestionnaireForm templateId={templateId} onSubmit={() => alert("Form Submitted!")} />
        )}

      {/* 🔹 Owner/Admin Gets Extra Management Features */}
      {isAuthenticated && isOwnerOrAdmin && (
        <>
          <TemplateManagement template={template} />
          <div className="mt-6">
            <h2 className="text-2xl font-semibold">Submitted Forms</h2>
            <TemplateFormsList templateId={templateId} />
          </div>
        </>
      )}
    </div>
  );
};

export default TemplatePage;
