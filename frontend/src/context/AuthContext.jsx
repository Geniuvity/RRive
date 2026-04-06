import { createContext, useContext, useEffect, useState } from "react";

// The below line works with both, on a local machine and on a server (like render)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returningFromGoogle = params.get("google_connected") === "true";
    const connectFailed = params.get("error") === "connect_failed";

    // Clean URL params
    if (returningFromGoogle || connectFailed) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (returningFromGoogle) {
      setGoogleConnected(true);
    }

    fetch(`${BACKEND_URL}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);

        // Only trigger connect if logged in AND not returning from google flow
        if (data && !returningFromGoogle && !connectFailed) {
          connectGoogle();
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const connectGoogle = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/connect-google`, {
        credentials: "include",
        redirect: "manual",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "already_connected") {
          console.log("Google already connected ✅");
          setGoogleConnected(true);
          return;
        }
        return;
      }

      // Use window.location.replace instead of href to avoid back-button loop
      if (res.status === 307 || res.status === 302 || res.type === "opaqueredirect") {
        window.location.replace(`${BACKEND_URL}/auth/connect-google`);
        return;
      }

    } catch (err) {
      window.location.replace(`${BACKEND_URL}/auth/connect-google`);
    }
  };

  const login = () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  const logout = () => {
    window.location.href = `${BACKEND_URL}/auth/logout`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, googleConnected }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);