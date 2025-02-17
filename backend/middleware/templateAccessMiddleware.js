import { checkResourceAccess } from "./resourceAccessMiddleware.js";
// src/middleware/templateAccessMiddleware.js

// ✅ Template Access Middleware (Read for Public/Owner/Access-Control)
export const checkTemplateAccess = checkResourceAccess("template", "read");

// ✅ Template Modification Middleware (Owner/Admin only)
export const checkTemplateOwnerOrAdmin = checkResourceAccess("template", "owner");

// ✅ Template Update Access (Owner or Admin Only)
export const checkTemplateUpdate = checkResourceAccess("template", "owner");

// ✅ Template Delete Access (Owner or Admin Only)
export const checkTemplateDelete = checkResourceAccess("template", "owner");