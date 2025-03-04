import pkceChallenge from "pkce-challenge";

/**
 * Generates a new PKCE challenge (verifier & challenge).
 * @returns {Promise<{ code_verifier: string, code_challenge: string }>}
 */
export const generatePkce = async () => {
  const pkce = await pkceChallenge();
  console.log("✅ [PKCE] Generated Code Verifier:", pkce.code_verifier);
  console.log("✅ [PKCE] Generated Code Challenge:", pkce.code_challenge);
  return pkce; // Returns both verifier & challenge
};
