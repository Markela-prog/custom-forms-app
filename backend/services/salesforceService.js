import prisma from "../prisma/prismaClient.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ✅ Store Salesforce Tokens in Database
export const storeSalesforceTokens = async ({
  userId,
  salesforceId,
  accessToken,
  refreshToken,
  instanceUrl,
}) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      salesforceId,
      salesforceAccessToken: accessToken,
      salesforceRefreshToken: refreshToken,
      salesforceInstanceUrl: instanceUrl,
    },
  });
};

// ✅ Refresh Salesforce Access Token
export const refreshSalesforceToken = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { salesforceRefreshToken: true },
  });

  if (!user || !user.salesforceRefreshToken)
    throw new Error("Salesforce refresh token not found");

  const { data } = await axios.post(
    `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.SALESFORCE_CONSUMER_KEY,
      client_secret: process.env.SALESFORCE_CONSUMER_SECRET,
      refresh_token: user.salesforceRefreshToken,
    })
  );

  return await prisma.user.update({
    where: { id: userId },
    data: { salesforceAccessToken: data.access_token },
  });
};

// ✅ Disconnect Salesforce Account
export const disconnectSalesforce = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      salesforceId: null,
      salesforceAccessToken: null,
      salesforceRefreshToken: null,
      salesforceInstanceUrl: null,
    },
  });
};
