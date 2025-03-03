import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let cachedAccessToken = null;

const getSalesforceToken = async () => {
  // If cached token exists, return it
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  try {
    const response = await axios.post(
      `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "password",
        client_id: process.env.SALESFORCE_CLIENT_ID,
        client_secret: process.env.SALESFORCE_CLIENT_SECRET,
        username: process.env.SALESFORCE_USERNAME,
        password: `${process.env.SALESFORCE_PASSWORD}${process.env.SALESFORCE_SECURITY_TOKEN}`,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Save token for reuse
    cachedAccessToken = response.data.access_token;

    return cachedAccessToken;
  } catch (error) {
    console.error(
      "Salesforce OAuth Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to authenticate with Salesforce");
  }
};

export default getSalesforceToken;
