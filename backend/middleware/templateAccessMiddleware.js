import { checkResourceAccess } from "./resourceAccessMiddleware.js";

export const checkTemplateAccess = checkResourceAccess("template", "read");
export const checkTemplateOwnerOrAdmin = checkResourceAccess("template", "owner");