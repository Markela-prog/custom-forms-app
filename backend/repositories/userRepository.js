import prisma from "../prisma/prismaClient.js";

export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      profilePicture: true,
      role: true,
      authProvider: true,
      createdAt: true,
    },
  });
};

export const updateUserProfile = async (id, updateData) => {
  return prisma.user.update({
    where: { id },
    data: updateData,
  });
};
