import prisma from "../prisma/prismaClient.js";

export const findAllUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, username: true, email: true, role: true, createdAt: true },
  });
};

export const findUserById = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};

export const updateUserRole = async (id, role) => {
  return prisma.user.update({
    where: { id },
    data: { role },
  });
};

export const deleteUserById = async (id) => {
  return prisma.user.delete({ where: { id } });
};
