import { checkResourceAccess } from "./resourceAccessMiddleware.js";
import { handleTemplateAccess } from "./templateAccessHandler.js";
// src/middleware/templateAccessMiddleware.js

// ✅ Template Access Middleware (Read for Public/Owner/Access-Control)
export const checkTemplateAccess = checkResourceAccess("template", "read", handleTemplateAccess);

// ✅ Template Modification Middleware (Owner/Admin only)
export const checkTemplateOwnerOrAdmin = checkResourceAccess("template", "owner");

// ✅ Template Update Access (Owner/Admin Only, No ACL)
export const checkTemplateUpdate = checkResourceAccess("template", "owner", handleTemplateAccess);

// ✅ Template Delete Access (Owner/Admin Only, No ACL)
export const checkTemplateDelete = checkResourceAccess("template", "owner", handleTemplateAccess);