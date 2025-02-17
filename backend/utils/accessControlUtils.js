
import prisma from "../prisma/prismaClient.js";

export const checkAccess = async ({ resource, resourceId, user, action }) => {
  // 🟡 1️⃣ Handle Actions Without Resource ID
  if (!resourceId) {
    if (["create", "read_all", "getUserForms"].includes(action)) {
      return user
        ? { access: true, role: "authenticated" }
        : { access: false, reason: "Unauthorized" };
    }
    return { access: false, reason: "Resource ID is required" };
  }

  console.log(
    `[AccessControl] User ${
      user?.id || "Guest"
    } attempting ${action} on ${resource} ${resourceId}`
  );

  // 🟠 2️⃣ Special Case: Questions are Scoped to Template
  if (resource === "question") {
    const question = await prisma.question.findUnique({
      where: { id: resourceId },
      include: { template: { select: { ownerId: true } } },
    });

    if (!question) {
      return { access: false, reason: "Question not found" };
    }

    // 🟡 Owner Check (via Template)
    if (question.template?.ownerId === user?.id) {
      console.log(
        `[AccessControl] User ${user?.id} is TEMPLATE OWNER for question ${resourceId}`
      );
      return { access: true, role: "owner" };
    }

    return {
      access: false,
      reason: "Only template owners can modify questions",
    };
  }

  // 🟠 3️⃣ Default Resource Check (e.g., Template Access)
  const resourceData = await prisma[resource].findUnique({
    where: { id: resourceId },
    include: { accessControl: true },
  });

  if (!resourceData) return { access: false, reason: `${resource} not found` };

  // 🟢 Role-Based Access
  if (user?.role === "ADMIN") return { access: true, role: "admin" };
  if (resourceData.ownerId === user?.id) return { access: true, role: "owner" };

  // ✅ ACL Check
  if (resourceData.accessControl?.some((ac) => ac.userId === user?.id)) {
    return { access: true, role: "acl" };
  }

  // ✅ Authenticated for Public Resources
  if (user && resourceData.isPublic) {
    return { access: true, role: "authenticated" };
  }

  return { access: false, reason: "Unauthorized" };
};
