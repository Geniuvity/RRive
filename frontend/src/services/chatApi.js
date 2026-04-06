// The below line works with both, on a local machine and on a server (like render)
const BASE_URL =import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const sendMessage = async (message) => {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message }),
  });

  if (!response.ok) throw new Error("Failed to fetch response");
  return response.json();
};

export const confirmSave = async () => {
  const response = await fetch(`${BASE_URL}/save-to-drive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to save to Drive");
  return response.json();
};

export const getDriveFiles = async () => {  
  const response = await fetch(`${BASE_URL}/drive-files`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to fetch Drive files");
  return response.json();
};