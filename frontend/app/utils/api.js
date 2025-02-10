export const apiRequest = async (endpoint, method = "GET", body = null) => {
    const token = localStorage.getItem("accessToken");
  
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });
  
    if (!response.ok) throw new Error(await response.text());
  
    return response.json();
  };
  