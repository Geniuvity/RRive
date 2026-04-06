const RepoCard = ({ repo }) => {
  return (
    <div style={styles.card}>
      
      {/* TOP SECTION */}
      <div style={styles.header}>
        <img src={repo.avatar} alt="avatar" style={styles.avatar} />

        <div>
          <h4 style={styles.repoName}>{repo.name}</h4>
          <p style={styles.owner}>by {repo.owner}</p>
        </div>

        <div style={styles.stars}>
          ⭐ {repo.stars}
        </div>
      </div>

      {/* DESCRIPTION */}
      <p style={styles.description}>
        {repo.description || "No description available"}
      </p>

      {/* BUTTON */}
      <a href={repo.url} target="_blank" rel="noreferrer">
        <button style={styles.button}>View Repo</button>
      </a>
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    marginBottom: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "10px",
  },

  repoName: {
    margin: 0,
    fontSize: "16px",
  },

  owner: {
    margin: 0,
    fontSize: "12px",
    color: "#666",
  },

  stars: {
    fontWeight: "bold",
    color: "#f4b400",
  },

  description: {
    fontSize: "14px",
    color: "#444",
    marginBottom: "12px",
  },

  button: {
    background: "#4f8cff",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default RepoCard;