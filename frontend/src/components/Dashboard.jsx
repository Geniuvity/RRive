import { useAuth } from "../context/AuthContext";
import ChatBox from "./ChatBox";
import { useState, useRef, useEffect } from "react";
import { getDriveFiles } from "../services/chatApi";
import { BsChatLeftText } from "react-icons/bs";
import { GrDocumentPdf } from "react-icons/gr";
import logo from "../assets/logo.png"

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [driveFiles, setDriveFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [filesError, setFilesError] = useState(null);
  const [messages, setMessages] = useState([]); 
  const menuRef = useRef(null);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Please login</p>;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSavedFiles = async () => {
    setActiveView("files");
    setFilesLoading(true);
    setFilesError(null);

    try {
      const data = await getDriveFiles();
      if (data.error) {
        setFilesError(data.error);
      } else {
        setDriveFiles(data.files);
      }
    } catch (err) {
      setFilesError("Failed to fetch files.");
    }

    setFilesLoading(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={styles.container}>

      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.profile}>
          <img
            src={user?.picture}
            style={styles.avatarImg}
            alt="profile"
            onError={(e) => e.target.style.display = "none"}
          />
          <p style={styles.profileName}>Hello, {user?.name}</p>
        </div>

        <div style={styles.menu}>
          <p
            style={{
              ...styles.menuItem,
              background: activeView === "dashboard" ? "#FFFFFF5A" : "transparent",
            }}
            onClick={() => setActiveView("dashboard")}
          >
            <BsChatLeftText  color="#111827" size={20}/> Chat Stream
          </p>
          <p
            style={{
              ...styles.menuItem,
              background: activeView === "files" ? "#FFFFFF5A" : "transparent",
            }}
            onClick={handleSavedFiles}
          >
            <GrDocumentPdf color="#111827" size={20} /> Saved Files
          </p>
        </div>
        {/* Footer Logo */}
        <div style={styles.footer}>
          <img src={logo} alt="footer logo" style={styles.footerImg} />
        </div>
      </div>
      
  
      {/* MAIN AREA */}
      <div style={styles.main}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            {activeView === "dashboard"
              ? "Chat Stream"
              : "Saved Files"}
          </h2>

          <div style={styles.userMenuWrapper} ref={menuRef}>
            <div
              style={styles.userBadge}
              onClick={() => setShowMenu(!showMenu)}
            >
              <img
                src={user?.picture}
                style={{ width: "32px", borderRadius: "50%" }}
                alt="user"
              />⌄
            </div>

            {showMenu && (
              <div style={styles.dropdown}>
                <button
                  style={styles.logoutBtn}
                  onClick={() => logout()}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Uses display none/block instead of conditional render 
            so ChatBox is never unmounted and messages persist */}
        <div style={{
          ...styles.chatWrapper,
          display: activeView === "dashboard" ? "flex" : "none"
        }}>
          <ChatBox messages={messages} setMessages={setMessages} />
        </div>

        {activeView === "files" && (
          <div style={styles.filesPanel}>

            {filesLoading && (
              <div style={styles.stateBox}>
                <p>Loading your saved files...</p>
              </div>
            )}

            {filesError && (
              <div style={styles.stateBox}>
                <p style={{ color: "#ff4d4d" }}>❌ {filesError}</p>
              </div>
            )}

            {!filesLoading && !filesError && driveFiles.length === 0 && (
              <div style={styles.stateBox}>
                <p>📭 No saved files yet.</p>
                <p style={{ color: "#888", fontSize: "14px" }}>
                  Summarize a repository and save it to Drive!
                </p>
              </div>
            )}

            {!filesLoading && !filesError && driveFiles.length > 0 && (
              <div style={styles.filesList}>
                {driveFiles.map((file) => (
                  <div key={file.id} style={styles.fileCard}>
                    <div style={styles.fileIcon}>📄</div>
                    <div style={styles.fileInfo}>
                      <p style={styles.fileName}>{file.name}</p>
                      <p style={styles.fileDate}>
                        {file.createdTime ? formatDate(file.createdTime) : ""}
                      </p>
                    </div>
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.openBtn}
                    >
                      Open
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: "220px",
    background: "#1759d28c",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    position: "relative",
  },
  footer: {
    position: "absolute",
    bottom: "20px",
    left: "65px", 
  },
  footerImg: {
    width: "120px",
    opacity: 1,
  },
  profile: {
    marginBottom: "30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  avatarImg: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    marginBottom: "10px",
    border: "3px solid #fff",
  },
  profileName: {
    margin: 0,
    fontSize: "16px",
    color: "#fff",
  },
  menu: {
    marginTop: "20px",
  },
  menuItem: {
    padding: "10px",
    cursor: "pointer",
    borderRadius: "6px",
    marginBottom: "5px",
    transition: "background 0.2s",
  },
  main: {
    flex: 1,
    background: "#f4f6f9",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
  },
  header: {
    height: "70px",
    background: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid #ddd",
    flexShrink: 0,
  },
  headerTitle: {
    margin: 0,
    fontSize: "20px",
  },
  userMenuWrapper: {
    position: "relative",
  },
  dropdown: {
    position: "absolute",
    top: "40px",
    right: 0,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "10px",
    zIndex: 100,
  },
  logoutBtn: {
    background: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  userBadge: {
    background: "#e5e7eb",
    padding: "8px 12px",
    borderRadius: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  chatWrapper: {
    flex: 1,
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },
  filesPanel: {
    flex: 1,
    padding: "30px",
    overflowY: "auto",
  },
  stateBox: {
    textAlign: "center",
    marginTop: "80px",
    color: "#555",
  },
  filesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  fileCard: {
    background: "#fff",
    borderRadius: "10px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
  },
  fileIcon: {
    fontSize: "28px",
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    margin: 0,
    fontWeight: "bold",
    color: "#333",
    fontSize: "15px",
  },
  fileDate: {
    margin: "4px 0 0 0",
    color: "#888",
    fontSize: "13px",
  },
  openBtn: {
    background: "#4f8cff",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: "8px",
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
};

export default Dashboard;