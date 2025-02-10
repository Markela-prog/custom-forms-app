import prisma from "../prisma/prismaClient.js";

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id) => {
  return prisma.user.findUnique({ where: { id } });
};

export const createUser = async (userData) => {
  return prisma.user.create({ data: userData });
};

export const updateUser = async (email, updateData) => {
  return prisma.user.update({ where: { email }, data: updateData });
};

export const updateUserById = async (id, updateData) => {
  return prisma.user.update({ where: { id }, data: updateData });
};

export const findUserByResetToken = async () => {
  const user = await prisma.user.findFirst({
    where: {
      resetTokenExpiry: { gte: new Date() }, // Find by expiry first
    },
  });
  console.log("User found by expiry:", user);
  return user;
};
