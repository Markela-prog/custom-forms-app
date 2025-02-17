import { checkResourceAccess } from "./resourceAccessMiddleware.js";
// src/middleware/templateAccessMiddleware.js

// ✅ Template Access Middleware (Read for Public/Owner/Access-Control)
export const checkTemplateAccess = checkResourceAccess("template", "read");

// ✅ Template Modification Middleware (Owner/Admin only)
export const checkTemplateOwnerOrAdmin = checkResourceAccess("template", "owner");
