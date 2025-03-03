import prisma from "../prisma/prismaClient.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// Store Salesforce tokens in DB
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

// Refresh Salesforce Access Token
export const refreshSalesforceToken = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { salesforceRefreshToken: true },
  });

  if (!user || !user.salesforceRefreshToken)
    throw new Error("Salesforce refresh token not found");

  const response = await axios.post(
    `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
    new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.SALESFORCE_CONSUMER_KEY,
      client_secret: process.env.SALESFORCE_CONSUMER_SECRET,
      refresh_token: user.salesforceRefreshToken,
    })
  );

  const { access_token } = response.data;

  await prisma.user.update({
    where: { id: userId },
    data: { salesforceAccessToken: access_token },
  });

  return access_token;
};

// Check if Account Exists in Salesforce
export const checkSalesforceAccount = async (
  email,
  accessToken,
  instanceUrl
) => {
  const response = await axios.get(
    `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/query`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: `SELECT Id FROM Account WHERE Email='${email}'`,
      },
    }
  );

  return response.data.records.length > 0 ? response.data.records[0].Id : null;
};

// Create Salesforce Account & Contact
export const createSalesforceAccountAndContact = async (user) => {
  let accessToken = user.salesforceAccessToken;
  let instanceUrl = user.salesforceInstanceUrl;

  if (!accessToken) accessToken = await refreshSalesforceToken(user.id);

  const existingAccountId = await checkSalesforceAccount(
    user.email,
    accessToken,
    instanceUrl
  );

  if (existingAccountId) {
    return {
      accountId: existingAccountId,
      message: "Account already exists in Salesforce",
    };
  }

  // Create Account
  const accountResponse = await axios.post(
    `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Account`,
    { Name: user.companyName || "Unknown Company" },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const accountId = accountResponse.data.id;

  // Create Contact
  await axios.post(
    `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Contact`,
    {
      FirstName: user.firstName,
      LastName: user.lastName,
      Email: user.email,
      AccountId: accountId,
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  return {
    accountId,
    message: "Salesforce account and contact created successfully",
  };
};

// Disconnect Salesforce
export const disconnectSalesforce = async (userId) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      salesforceId: null,
      salesforceAccessToken: null,
      salesforceRefreshToken: null,
    },
  });
};
