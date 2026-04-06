import { useState, useEffect, useRef } from "react";
import { sendMessage, confirmSave } from "../services/chatApi";
import RepoList from "./RepoList";

// messages and setMessages come from Dashboard as props
const ChatBox = ({ messages, setMessages }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null); 

  // Auto-scrolling whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", type: "text", data: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await sendMessage(input);
      const botMessage = {
        role: "bot",
        type: res.type || "text",
        data: res.data || "No response received",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", type: "text", data: "Error fetching response" },
      ]);
    }

    setInput("");
    setLoading(false);
  };

  const handleApprove = async () => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.type === "auth_required"
          ? { ...msg, type: "text", data: "Saving to Google Drive..." }
          : msg
      )
    );

    try {
      const res = await confirmSave();
      setMessages((prev) => [
        ...prev,
        { role: "bot", type: "text", data: res.data || "✅ Saved to Google Drive!" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", type: "text", data: "❌ Failed to save to Google Drive." },
      ]);
    }
  };

  const handleReject = () => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.type === "auth_required"
          ? { ...msg, type: "text", data: "❌ Save cancelled." }
          : msg
      )
    );
  };

  const renderMessage = (msg, index) => {
    if (msg.type === "auth_required") {
      return (
        <div key={index} style={styles.messageRow}>
          <div style={styles.authCard}>
            <p style={styles.authTitle}>🔐 Authorization Required</p>
            <p style={styles.authSubtitle}>
              Allow this app to save a summary to your Google Drive?
            </p>
            <div style={styles.authButtons}>
              <button style={styles.approveBtn} onClick={handleApprove}>
                ✅ Approve
              </button>
              <button style={styles.rejectBtn} onClick={handleReject}>
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={index}
        style={{
          ...styles.messageRow,
          justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            ...styles.bubble,
            background: msg.role === "user" ? "#4f8cff" : "#ffffff",
            color: msg.role === "user" ? "#fff" : "#000",
          }}
        >
          {msg.type === "repos" ? <RepoList repos={msg.data} /> : msg.data}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.chatArea}>
        {messages.map((msg, index) => renderMessage(msg, index))}
        {loading && <p>Thinking...</p>}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputBar}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={styles.input}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} style={styles.sendBtn}>➤</button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    minHeight: 0,
  },
  chatArea: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    padding: "20px",
    minHeight: 0,
  },
  messageRow: {
    display: "flex",
    marginBottom: "10px",
  },
  bubble: {
    padding: "12px",
    borderRadius: "12px",
    maxWidth: "70%",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    wordBreak: "break-word",
  },
  authCard: {
    background: "#fff",
    border: "2px solid #4f8cff",
    borderRadius: "12px",
    padding: "20px",
    maxWidth: "70%",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  authTitle: {
    fontWeight: "bold",
    fontSize: "16px",
    marginBottom: "8px",
    color: "#333",
  },
  authSubtitle: {
    color: "#666",
    marginBottom: "16px",
    fontSize: "14px",
  },
  authButtons: {
    display: "flex",
    gap: "10px",
  },
  approveBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  rejectBtn: {
    background: "#ff4d4d",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  inputBar: {
    display: "flex",
    padding: "10px",
    background: "#fff",
    borderTop: "1px solid #ddd",
    flexShrink: 0,
    minHeight: "60px",
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    outline: "none",
  },
  sendBtn: {
    marginLeft: "10px",
    padding: "10px 15px",
    borderRadius: "50%",
    background: "#4f8cff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
  },
};

export default ChatBox;