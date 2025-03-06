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

export const createSalesforceAccountAndContact = async (user, accountData) => {
  const accessToken = await refreshSalesforceToken(user.id);
  const instanceUrl = user.salesforceInstanceUrl;

  if (!user.salesforceAccessToken) {
    throw new Error("No Salesforce access token found. Please reconnect.");
  }

  if (user.salesforceAccountId) {
    throw new Error("Salesforce account already exists.");
  }

  try {
    // 🔹 Step 1: Create Account in Salesforce
    const { data: account } = await axios.post(
      `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Account`,
      {
        Name: accountData.companyName || "Unnamed Company",
        Industry: accountData.industry || "Unknown",
        Website: accountData.website || "",
        Phone: accountData.phone || "",
        Type: "Customer",
      },
      { headers: { Authorization: `Bearer ${user.salesforceAccessToken}` } }
    );

    console.log("✅ [Salesforce] Account Created:", account.id);

    // 🔹 Step 2: Create Contact in Salesforce linked to Account
    const { data: contact } = await axios.post(
      `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Contact`,
      {
        FirstName: accountData.firstName,
        LastName: accountData.lastName,
        Email: accountData.email,
        Phone: accountData.phone || "",
        Title: accountData.title || "",
        AccountId: account.id, // Link Contact to Account
      },
      { headers: { Authorization: `Bearer ${user.salesforceAccessToken}` } }
    );

    console.log("✅ [Salesforce] Contact Created:", contact.id);

    return {
      accountId: account.id,
      contactId: contact.id,
      message: "Salesforce Account & Contact created successfully!",
    };
  } catch (error) {
    console.error(
      "❌ [Salesforce] Account/Contact Creation Failed:",
      error.response?.data || error
    );
    throw new Error("Salesforce Account/Contact creation failed.");
  }
};
