import prisma from "../prisma/prismaClient.js";

export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,  // Now correctly fetching username
      profilePicture: true, // Now correctly fetching profile picture URL
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
    select: {
      id: true,
      email: true,
      username: true,
      profilePicture: true,
      role: true,
      updatedAt: true,
    },
  });
};
