import prisma from "../prismaClient.js";

export const getUserById = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
};

export const updateUserSalesforceToken = async (userId, accessToken, instanceUrl) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      salesforceAccessToken: accessToken,
      salesforceInstanceUrl: instanceUrl,
    },
  });
};
