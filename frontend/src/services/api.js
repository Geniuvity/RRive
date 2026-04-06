const BASE_URL = "http://localhost:8000";

export const getProtectedData = async () => {  
  const response = await fetch(`${BASE_URL}/protected`, {
    credentials: "include",  
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  return response.json();
};