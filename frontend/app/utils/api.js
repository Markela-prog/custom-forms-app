export const apiRequest = async (endpoint, method = "GET", body = null) => {
    const token = localStorage.getItem("accessToken");
  
    if (!token) {
      console.error("⚠️ No access token found in localStorage");
      throw new Error("No token available");
    }
  
    console.log(`📡 Sending Request: ${endpoint} with Token:`, token); // Debugging
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });
  
    if (!response.ok) {
      console.error(`🚨 API Error ${response.status}: ${await response.text()}`);
      throw new Error(await response.text());
    }
  
    return response.json();
  };
  