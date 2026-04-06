import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png"

const LoginButton = () => {
  const { login, logout, user } = useAuth(); 

  return (
    <div style={styles.page}>

      {/* TOP BAR (Logo + App Name) */}
      <div style={styles.topBar}>
        <div style={styles.logoSection}>
          <img src={logo} alt="RRive Logo" style={styles.logo} />
          <h4 style={styles.appName}>Agentic Powered Platform for GitHub & Google Drive</h4>
        </div>
      </div>

      {/* CENTER LOGIN CARD */}
      <div style={styles.card}>
        {!user ? ( 
          <>
            <h1 style={styles.title}> Welcome User</h1>
            <p style={styles.subtitle}>Your AI agent awaits</p>

            <button
              style={styles.loginButton}
              onClick={() => login()}
            >
              Login with Google
            </button>
          </>
        ) : (
          <>
            <h1 style={styles.title}>Hello, {user?.name}</h1>

            <button
              style={styles.logoutButton}
              onClick={() => logout()} 
            >
              Logout
            </button>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <p>@NishaAndYash | Powered by Token Vault - Auth0</p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
    position: "relative",
    background: "linear-gradient(to top, #a6d8ff, #eaf6ff)",
    backgroundImage: `
      radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 40px, transparent 41px),
      radial-gradient(circle at 70% 30%, rgba(255,255,255,0.5) 50px, transparent 51px),
      radial-gradient(circle at 50% 80%, rgba(255,255,255,0.4) 60px, transparent 61px)
    `,
  },
  topBar: {
    position: "absolute",
    top: "20px",
    left: "30px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logo: {
    width: "80px",
    height: "80px",
    background: "#007bff",
  },
  appName: {
    margin: 0,
    color: "#007bff",
    fontWeight: "bold",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    textAlign: "center",
    width: "320px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    animation: "fadeIn 0.6s ease-in-out",
  },
  title: {
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    marginBottom: "20px",
    color: "#666",
  },
  loginButton: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "0.3s",
  },
  logoutButton: {
    background: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  footer: {
    position: "absolute",
    bottom: "20px",
    left: "30px",
    color: "#555",
    fontSize: "14px",
  },
};

export default LoginButton;