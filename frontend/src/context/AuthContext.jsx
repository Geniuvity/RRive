import { createContext, useContext, useEffect, useState } from "react";

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

    fetch("http://localhost:8000/auth/me", { credentials: "include" })
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
      const res = await fetch("http://localhost:8000/auth/connect-google", {
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
        window.location.replace("http://localhost:8000/auth/connect-google");
        return;
      }

    } catch (err) {
      window.location.replace("http://localhost:8000/auth/connect-google");
    }
  };

  const login = () => {
    window.location.href = "http://localhost:8000/auth/login";
  };

  const logout = () => {
    window.location.href = "http://localhost:8000/auth/logout";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, googleConnected }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);